import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const database = join(tmpdir(), `spacechristmas-smoke-${randomBytes(8).toString('hex')}.db`);
const keysPath = join(tmpdir(), `spacechristmas-smoke-keys-${randomBytes(8).toString('hex')}`);
const password = randomBytes(24).toString('hex');
async function unusedPort() {
  return new Promise((resolve, reject) => {
    const socket = createServer();
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', () => {
      const selected = socket.address().port;
      socket.close(() => resolve(selected));
    });
  });
}
const port = await unusedPort();
const origin = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  ASPNETCORE_ENVIRONMENT: 'Development',
  Admin__Password: password,
  ConnectionStrings__EventContext: `Data Source=${database};Default Timeout=30`,
  DataProtection__KeysPath: keysPath
};
const publishedDirectory = join(process.cwd(), 'publish');

function dotnet(args) {
  return spawn('dotnet', ['SpaceChristmas-UX.dll', ...args], {
    cwd: publishedDirectory, env, stdio: ['ignore', 'pipe', 'pipe']
  });
}

const migration = dotnet(['--migrate']);
let migrationOutput = '';
for (const stream of [migration.stdout, migration.stderr])
  stream.on('data', data => { migrationOutput += data; });
const migrationExit = await new Promise(resolve => migration.once('exit', resolve));
async function cleanDatabase() {
  for (const suffix of ['', '-shm', '-wal'])
    await rm(database + suffix, { force: true });
  await rm(keysPath, { recursive: true, force: true });
}
if (migrationExit !== 0) {
  await cleanDatabase();
  throw new Error(`Database migration failed: ${migrationOutput.slice(-3000)}`);
}

const host = dotnet(['--urls', origin]);
let hostOutput = '';
for (const stream of [host.stdout, host.stderr])
  stream.on('data', data => { hostOutput += data; });
let browser;
let replica;
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (host.exitCode !== null) throw new Error(`Host exited: ${hostOutput.slice(-3000)}`);
    try {
      ready = (await fetch(`${origin}/healthz`)).ok;
    } catch {
      // The listener is not ready yet.
    }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error(`Host did not become ready: ${hostOutput.slice(-3000)}`);

  browser = await chromium.launch({
    headless: true,
    ...(process.platform === 'win32' ? { channel: 'msedge' } : {})
  });
  const admin = await browser.newContext();
  const master = await admin.newPage();
  const browserErrors = [];
  master.on('pageerror', error => browserErrors.push(error.message));
  master.on('response', response => {
    if (response.url().includes('/api/')) browserErrors.push(`API ${response.status()} ${response.url()}`);
  });
  await master.goto(`${origin}/Admin/Login`);
  await master.locator('input[type=password]').fill(password);
  await master.locator('button[type=submit]').click();
  try {
    await master.waitForURL('**/Master', { timeout: 10000 });
  } catch (error) {
    throw new Error(`Admin login stayed at ${master.url()}: ${await master.locator('body').innerText()}; browser: ${browserErrors.join('; ')}; server: ${hostOutput.slice(-2500)}`, { cause: error });
  }
  // A new admin session should be created and displayed by the Master page.
  await master.waitForFunction(
    () => /^[A-F0-9]{32}$/.test(document.querySelector('#inviteCode')?.textContent.trim() ?? '')
  );
  const invite = (await master.locator('#inviteCode').innerText()).trim();
  if (!/^[A-F0-9]{32}$/.test(invite)) throw new Error('Master did not show an invite code.');

  const replicaOrigin = `http://127.0.0.1:${await unusedPort()}`;
  replica = dotnet(['--urls', replicaOrigin]);
  let replicaOutput = '';
  for (const stream of [replica.stdout, replica.stderr])
    stream.on('data', data => { replicaOutput += data; });
  let replicaReady = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (replica.exitCode !== null) throw new Error(`Replica exited: ${replicaOutput.slice(-3000)}`);
    try {
      replicaReady = (await fetch(`${replicaOrigin}/healthz`)).ok;
    } catch {
      // The listener is not ready yet.
    }
    if (replicaReady) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!replicaReady) throw new Error(`Replica did not become ready: ${replicaOutput.slice(-3000)}`);
  const sharedSession = await admin.request.get(`${replicaOrigin}/api/sessions/current`);
  if (!sharedSession.ok() || (await sharedSession.json()).InviteCode !== invite)
    throw new Error('Second instance did not recognize the admin session cookie.');

  const player = await browser.newContext();
  const station = await player.newPage();
  const playerResponses = [];
  station.on('pageerror', error => playerResponses.push(error.message));
  station.on('response', response => {
    if (response.url().includes('/api/')) playerResponses.push(`API ${response.status()} ${response.url()}`);
  });
  await station.goto(origin);
  await station.locator('#group-code-input').fill(invite);
  await station.locator('button[type=submit]').click();
  await station.getByRole('button', { name: /Select Your Position/i }).click();
  try {
    await station.getByRole('link', { name: 'Communications' }).click({ timeout: 10000 });
  } catch (error) {
    throw new Error(`Join failed at ${station.url()}: ${await station.locator('body').innerText()}; browser: ${playerResponses.join('; ')}; server: ${hostOutput.slice(-2500)}`, { cause: error });
  }
  await station.waitForURL('**/Communications');
  await master.locator('button[onclick="sendMessage(this)"]').first().click();
  await station.waitForFunction(
    () => window.eventList?.some(evt => evt.Name === 'newMessage'),
    null,
    { timeout: 10000 }
  );
  console.log('Browser smoke passed: admin login, shared-key replica session, invite join, station access and cross-browser event polling.');
} finally {
  if (browser) await browser.close();
  if (replica?.exitCode === null) {
    replica.kill();
    await new Promise(resolve => replica.once('exit', resolve));
  }
  if (host.exitCode === null) {
    host.kill();
    await new Promise(resolve => host.once('exit', resolve));
  }
  await cleanDatabase();
}
