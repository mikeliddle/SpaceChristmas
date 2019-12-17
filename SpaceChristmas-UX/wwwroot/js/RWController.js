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
        
        if (event.Name === "prepareThrusterFlight") {
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
        } else if (event.Name === "startThrusterFlight") {
            startThrusterFlight();
        } else if (event.Name === "prepareTacticalCombat") {
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
        } else if (event.Name === "startTacticalCombat") {
            startTacticalCombat();
        } else if (event.Name === "tacticalCombatSuccess") {
            tearDownView();
            firstLoad();
        } else if (event.Name === "firstLoad") {
            tearDownView();
            firstLoad();
        }
    }
}

// core functionality
function firstLoad() {
    createCoreUI();
}

function createCoreUI() {
    var mainView = newContainer("mainView", instructionStyle);
    var canvas = document.createElement("canvas");
    canvas.id = mainCanvasId;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    mainView.appendChild(canvas);
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

        var successContainer = newContainer("successLabel", successStyle);
        successContainer.innerHTML = "<h1>Success!!!</h1>";
        document.getElementById("gameCanvas").appendChild(successContainer);

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
            
            var restartContainer = newContainer("myrestartbutton", restartStyle);
            var restartButton = newButton("Try Again?");
            restartButton.classList.add("btn");
            restartButton.classList.add("btn-primary");
            restartButton.onclick = restartGame;
            restartContainer.appendChild(restartButton);

            document.getElementById("gameCanvas").appendChild(restartContainer);
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