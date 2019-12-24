var flightArea;
var shipPieceForFlight;
var barriers = [];
var myTimerLabel = {};

function loadScreen() {
    eventQueue.push({
        "Name": "firstLoad",
        "TimeStamp": getUTCDatetime(),
        "Id": uuid(),
        "Scope": "_local",
        "Status": "Complete"
    });
    setInterval(eventLoop, 100);
    setInterval(poll, 1000);
}

function eventLoop() {
    if (eventQueue.length > 0) {
        var event = eventQueue[0];
        eventQueue.splice(0, 1);

        if (event.Name === "prepareThrusterFlight" || event.name === "prepareThrusterFlight") {
            tearDownView();

            var instructionContainer = newContainer("instructionLabel", instructionStyle);
            instructionContainer.innerHTML = "<h3>Use the arrow keys to move the ship through the course. The ship will move forward automatically but you can slow down or speed up with the left/right arrow keys.</h3>";

            var startContainer = newContainer("mystartbutton", startButtonStyle);
            var startButton = newButton("Start");
            startButton.classList.add("btn");
            startButton.classList.add("btn-primary");

            startButton.onclick = function () {
                eventQueue.push({
                    "Name": "startThrusterFlight",
                    "TimeStamp": getUTCDatetime(),
                    "Id": uuid(),
                    "Scope": "_local",
                    "Status": "Complete"
                });
            };

            startContainer.appendChild(startButton);

            document.getElementById("gameCanvas").appendChild(instructionContainer);
            document.getElementById("gameCanvas").appendChild(startContainer);
        } else if (event.Name === "startThrusterFlight" || event.name === "startThrusterFlight") {
            startThrusterFlight();
        } else if (event.Name === "prepareTacticalCombat" || event.name === "prepareTacticalCombat") {
            tearDownView();

            var instructionContainer = newContainer("instructionLabel", instructionStyle);
            instructionContainer.innerHTML = "<h3>Use the left and right arrow keys to rotate the gun alignment. Use the space bar to fire torpedos.</h3>";

            var startContainer = newContainer("mystartbutton", startButtonStyle);
            var startButton = newButton("Start");
            startButton.classList.add("btn");
            startButton.classList.add("btn-primary");
            startButton.onclick = function () {
                eventQueue.push({
                    "Name": "startTacticalCombat",
                    "TimeStamp": getUTCDatetime(),
                    "Id": uuid(),
                    "Scope": "_local",
                    "Status": "Complete"
                });
            };

            startContainer.appendChild(startButton);

            document.getElementById("gameCanvas").appendChild(instructionContainer);
            document.getElementById("gameCanvas").appendChild(startContainer);
        } else if (event.Name === "startTacticalCombat" || event.name === "startTacticalCombat") {
            startTacticalCombat();
        } else if (event.Name === "tacticalCombatSuccess" || event.name === "tacticalCombatSuccess") {
            tearDownView();
            firstLoad();
        } else if (event.Name === "firstLoad" || event.name === "firstLoad") {
            tearDownView();
            firstLoad();
        }
    }
}

// core functionality
function firstLoad() {
    createCoreUI();
}

var nav_x = "";
var nav_y = "";
var nav_z = "";

function navigate() {
    nav_x = document.getElementById("x").value;
    nav_y = document.getElementById("y").value;
    nav_z = document.getElementById("z").value;

    var event = {
        "Name": "changedNavigation",
        "Id": uuid(),
        "Timestamp": getUTCDatetime(),
        "Scope": "all",
        "Status": "Complete",
        "Value": `${nav_x},${nav_y},${nav_z}`
    };

    eventQueue.push(event);
}

function changeSpeed(speed) {
    var event = {
        "Name": "changedNavigation",
        "Id": uuid(),
        "Timestamp": getUTCDatetime(),
        "Scope": "all",
        "Status": "Complete"
    };

    if (speed == 0) {
        event.Value = "Stopped";
        document.getElementById("speedLabel").innerHTML = "Stopped";
    } else if (speed == 10) {
        event.Value = "Hyperspeed";
        document.getElementById("speedLabel").innerHTML = "Hyperspeed";
    } else {
        event.Value = speed.toElement.innerText;
        document.getElementById("speedLabel").innerHTML = speed.toElement.innerText;
    }

    eventQueue.push(event);
}

function createCoreUI() {
    var mainView = newContainer("mainView", instructionStyle);
    var tableView = document.createElement("table");
    tableView.id = "tableView";
    tableView.width = CANVAS_WIDTH;
    tableView.height = CANVAS_HEIGHT;

    // X Row
    var row = document.createElement("tr");

    var cell = document.createElement("td");
    cell.style = "width: 10px;";
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.innerHTML = "<h3>X: </h3>";
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.innerHTML = "<input id=\"x\" type=\"text\" />";
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.colSpan = 2;
    cell.rowSpan = 4;
    cell.innerHTML = "<h1>Speed: <span id=\"speedLabel\">Stopped</span></h1>";
    row.appendChild(cell);
    tableView.appendChild(row);

    // Y Row
    row = document.createElement("tr");
    cell = document.createElement("td");
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.innerHTML = "<h3>Y: </h3>";
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.innerHTML = "<input id=\"y\" type=\"text\" />";
    row.appendChild(cell);
    tableView.appendChild(row);

    // Z Row
    row = document.createElement("tr");
    cell = document.createElement("td");
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.innerHTML = "<h3>Z: </h3>";
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.innerHTML = "<input id=\"z\" type=\"text\" />";
    row.appendChild(cell);
    tableView.appendChild(row);

    // Button Row
    row = document.createElement("tr");
    cell = document.createElement("td");
    row.appendChild(cell);
    cell = document.createElement("td");
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.innerHTML = "<center><button class=\"btn btn-success\" onclick=\"navigate()\">Navigate</button></center>";
    row.appendChild(cell);
    tableView.appendChild(row);

    row = document.createElement("tr");
    cell = document.createElement("td");
    row.appendChild(cell);

    mainView.appendChild(tableView);

    tableView = document.createElement("table");
    tableView.style = "margin-top: 10px;";
    tableView.cellPadding = 10;
    row = document.createElement("tr");

    cell = document.createElement("td");
    var btn = document.createElement("button");
    btn.id = "fullStopBtn";
    btn.innerHTML = "Full Stop"
    btn.onclick = function () { changeSpeed(0); };
    btn.className += "btn btn-primary";

    cell.appendChild(btn);
    row.appendChild(cell);

    for (var i = 2; i < 6; i++) {
        cell = document.createElement("td");

        btn = document.createElement("button");
        btn.id = `Impulse${i}`;
        btn.innerHTML = `Impulse ${i - 1}`;
        var str = `Impulse ${i - 1}`
        btn.onclick = changeSpeed;
        btn.className += "btn btn-primary";

        cell.appendChild(btn);
        row.appendChild(cell);
    }

    cell = document.createElement("td");

    btn = document.createElement("button");
    btn.id = "Hyperspeed"
    btn.innerHTML = `Hyperspeed`;
    btn.onclick = function () { changeSpeed(10); };
    btn.className += "btn btn-warning";

    cell.appendChild(btn);
    row.appendChild(cell);

    tableView.appendChild(row);
    mainView.appendChild(tableView);

    var gameContainer = document.getElementById("gameCanvas");
    gameContainer.appendChild(mainView);

    // setupEventListener();
}

function tearDownView() {
    document.getElementById("gameCanvas").innerHTML = "";
}

function restartGame() {
    document.getElementById("myrestartbutton").style.display = "none";
    flightArea.stop();
    flightArea.clear();
    flightArea = {};
    shipPieceForFlight = {};
    barriers = [];
    myTimerLabel = {};
    document.getElementById("gameCanvas").innerHTML = "";
    startThrusterFlight();
}

function startThrusterFlight() {
    flightArea = new FlightArea();
    shipPieceForFlight = new flightComponent(GAME_PIECE_HEIGHT, GAME_PIECE_HEIGHT, GAME_PIECE_COLOR, 10, 75);
    myTimerLabel = new flightComponent("15px", "Consolas", "white", 10, 25, "text");
    this.endTime = new Date();
    this.endTime.setMinutes(this.endTime.getMinutes() + 1.5);

    if (document.getElementById("instructionLabel")) {
        document.getElementById("instructionLabel").style.display = "none";
        document.getElementById("mystartbutton").style.display = "none";
    }

    flightArea.start();
}

class FlightArea {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        document.getElementById("gameCanvas").appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.pause = false;
        this.frameNo = 0;
        this.start = function () {
            this.interval = setInterval(updateFlightArea, 10);
            this.timerInterval = setInterval(function () {
                this.currentTime = new Date().getTime();
            }, 10); // update every 1/100 sec.
            window.addEventListener('keydown', function (e) {
                e.preventDefault();
                flightArea.keys = (flightArea.keys || []);
                flightArea.keys[e.keyCode] = (e.type == "keydown");
            });
            window.addEventListener('keyup', function (e) {
                flightArea.keys[e.keyCode] = (e.type == "keydown");
            });
        };
        this.stop = function () {
            clearInterval(this.interval);
            clearInterval(this.timerInterval);
            this.pause = true;
        };
        this.clear = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
    }
}

class flightComponent {
    constructor(width, height, color, x, y, type) {
        this.type = type;
        if (type == "text") {
            this.text = color;
        }
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.x = x;
        this.y = y;
        this.update = function () {
            this.ctx = flightArea.context;
            if (this.type == "text") {
                this.ctx.font = this.width + " " + this.height;
                this.ctx.fillStyle = color;
                this.ctx.fillText(this.text, this.x, this.y);
            }
            else {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        };
        this.crashWith = function (otherobj) {
            var myleft = this.x;
            var myright = this.x + (this.width);
            var mytop = this.y;
            var mybottom = this.y + (this.height);
            var otherleft = otherobj.x;
            var otherright = otherobj.x + (otherobj.width);
            var othertop = otherobj.y;
            var otherbottom = otherobj.y + (otherobj.height);
            var crash = true;
            if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
                crash = false;
            }
            return crash;
        };
    }
}

function updateFlightArea() {
    var x, y, min, max, height, gap;

    this.currentTime = new Date().getTime();
    var _endTime = this.endTime.getTime();

    var difference = _endTime - this.currentTime;

    var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((difference % (1000 * 60)) / 1000);
    var centiseconds = Math.floor((difference % (1000 * 60) / 10));

    if (difference < 0) {
        clearInterval(this.timerInterval);
        flightArea.clear();
        flightArea.stop();

        var canvas = document.getElementById(mainCanvasId);

        var ctx = canvas.getContext("2d");
        ctx.save();
        ctx.font = "30 Consolas";
        ctx.fillStyle = "white";

        ctx.fillText("Success!!!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

        ctx.restore();

        setTimeout(() => eventQueue.push({
            "Name": "flightSuccess",
            "TimeStamp": getUTCDatetime(),
            "Id": uuid(),
            "Scope": "RW",
            "Status": "Complete"
        }), 3000);

        return;
    }

    for (i = 0; i < barriers.length; i += 1) {
        if (shipPieceForFlight.crashWith(barriers[i])) {
            // TODO: failed
            flightArea.stop();

            var canvas = document.getElementById(mainCanvasId);
            var context = canvas.getContext("2d");
            context.save();

            context.fillStyle = "#337ab7";

            restartButton = new Path2D();
            restartButton.rect(CANVAS_WIDTH / 2 - 60, CANVAS_HEIGHT / 2 - 12.5, 120, 25);
            context.fill(restartButton);

            context.fillStyle = "white";
            context.font = "15px consolas";
            context.fillText("Try Again", CANVAS_WIDTH / 2 - 38, CANVAS_HEIGHT / 2 + 5);

            context.restore();

            canvas.addEventListener("mouseup", function (ev) {

                var mousePosition = getMousePosition(canvas, ev);
                var context = canvas.getContext("2d");

                if (context.isPointInPath(restartButton, mousePosition.x, mousePosition.y)) {
                    restartCombat();
                }
            });
            return;
        }
    }
    if (flightArea.pause == false) {
        flightArea.clear();
        flightArea.frameNo += 1;

        myTimerLabel.text = ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2) + "." + centiseconds;
        myTimerLabel.update();

        if (flightArea.frameNo == 1 || everyFlightInterval(150)) {
            x = flightArea.canvas.width;
            y = flightArea.canvas.height - 100;
            min = 60;
            max = 200;
            height = Math.floor(Math.random() * (max - min + 1) + min);
            min = 50;
            max = 200;
            gap = Math.floor(Math.random() * (max - min + 1) + min);
            barriers.push(new flightComponent(OBSTACLE_WIDTH, height, OBSTACLE_COLOR, x, 0));
            barriers.push(new flightComponent(OBSTACLE_WIDTH, x - height - gap, OBSTACLE_COLOR, x, height + gap));
        }
        for (i = 0; i < barriers.length; i += 1) {
            barriers[i].x += -1;
            barriers[i].update();
        }

        if (flightArea.keys && flightArea.keys[KEY_LEFT]) { moveleft(null); }
        if (flightArea.keys && flightArea.keys[KEY_RIGHT]) { moveright(null); }
        if (flightArea.keys && flightArea.keys[KEY_UP]) { moveup(null); }
        if (flightArea.keys && flightArea.keys[KEY_DOWN]) { movedown(null); }

        shipPieceForFlight.x += shipPieceForFlight.speedX;
        shipPieceForFlight.y += shipPieceForFlight.speedY;
        shipPieceForFlight.speedX = 0;
        shipPieceForFlight.speedY = 0;
        shipPieceForFlight.update();
    }
}

function everyFlightInterval(n) {
    if ((flightArea.frameNo / n) % 1 == 0) { return true; }
    return false;
}

function moveup(e) {
    shipPieceForFlight.speedY = -1;
}

function movedown() {
    shipPieceForFlight.speedY = 1;
}

function moveleft() {
    shipPieceForFlight.speedX = -1;
}

function moveright() {
    shipPieceForFlight.speedX = 1;
}

function clearmove(e) {
    shipPieceForFlight.speedX = 0;
    shipPieceForFlight.speedY = 0;
}