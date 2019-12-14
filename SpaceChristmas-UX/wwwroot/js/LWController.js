var myShipForShields = {};
var myFrontShield = null;
var myRearShield = null;
var name = "LW";

// Components
function newButton(title) {
    var button = document.createElement("button");

    button.innerHTML = title;

    return button;
}

function newContainer(id, style) {
    var container = document.createElement("div");

    container.id = id;
    container.style = style;

    return container;
}
// end Components

function loadScreen() {
    eventQueue.push({
        "Name": "firstLoad",
        "TimeStamp": getUTCDatetime(),
        "Id": uuid(),
        "Scope": "_local",
        "Status": "Complete"
    });
    setInterval(eventLoop, 10);
    setInterval(poll, 1000);
}

function eventLoop() {
    if (eventQueue.length > 0) {
        var event = eventQueue[0];
        eventQueue.splice(0, 1);

        if (event.Name === "prepareTacticalCombat") {
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
        } else if (event.Name === "firstLoad") {
            tearDownView();
            firstLoad();
        }
    }
}

// core functionality
function firstLoad() {
    createCoreUI();
    setupShields();
}

function getMousePosition(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
    };
}

function setupEventListener() {
    var canvas = document.getElementById(mainCanvasId);
    canvas.addEventListener("mouseup", function (ev) {

        var mousePosition = getMousePosition(canvas, ev);
        var context = canvas.getContext("2d");

        if (context.isPointInPath(myFrontShield.path, mousePosition.x, mousePosition.y)) {
            myFrontShield.active = !myFrontShield.active;
            redrawShields(mainCanvasId);
        }

        if (context.isPointInPath(myRearShield.path, mousePosition.x, mousePosition.y)) {
            myRearShield.active = !myRearShield.active;
            redrawShields(mainCanvasId);
        }
    });
}

function setupShields() {
    myShipForShields = {};
    myFrontShield = { "active": false };
    myRearShield = { "active": false };
    drawShipForShields(mainCanvasId);
}

function redrawShields(canvas_id) {
    const context = document.getElementById(canvas_id).getContext("2d");

    context.save();

    if (myFrontShield.active) {
        context.fillStyle = TORPEDO_COLOR;
        context.fill(myFrontShield.path);
    } else {
        context.fillStyle = "black";
        context.fill(myFrontShield.path);
        context.strokeStyle = TORPEDO_COLOR;
        context.stroke(myFrontShield.path);
    }

    if (myRearShield.active) {
        context.fillStyle = TORPEDO_COLOR;
        context.fill(myRearShield.path);
    } else {
        context.fillStyle = "black";
        context.fill(myRearShield.path);
        context.strokeStyle = TORPEDO_COLOR;
        context.stroke(myRearShield.path);
    }

    context.restore();
}

function drawShipForShields(canvas_id) {
    const context = document.getElementById(canvas_id).getContext("2d");

    context.save();

    context.fillStyle = GAME_PIECE_COLOR;
    context.strokeStyle = GAME_PIECE_COLOR;

    myShipForShields = new Path2D();

    myShipForShields.moveTo(50, 100);
    myShipForShields.lineTo(150, 50);
    myShipForShields.lineTo(200, 50);
    myShipForShields.lineTo(150, 100);
    myShipForShields.lineTo(200, 100);
    myShipForShields.lineTo(250, 125);
    myShipForShields.lineTo(250, 175);
    myShipForShields.lineTo(200, 200);
    myShipForShields.lineTo(150, 200);
    myShipForShields.lineTo(200, 250);
    myShipForShields.lineTo(150, 250);
    myShipForShields.lineTo(50, 200);
    myShipForShields.lineTo(50, 100);

    context.fill(myShipForShields);

    var frontShield = new Path2D();
    frontShield.arc(150, 150, 125, 0 - (Math.PI / 2) + .05, Math.PI / 2 - .05);
    frontShield.arc(150, 150, 140, Math.PI / 2 - .05, 0 - (Math.PI / 2) + .05, true);
    frontShield.closePath();
    context.strokeStyle = TORPEDO_COLOR;
    context.stroke(frontShield);

    myFrontShield.path = frontShield;

    var rearShield = new Path2D();
    rearShield.arc(150, 150, 125, Math.PI / 2 + .05, 3 * Math.PI / 2 - .05);
    rearShield.arc(150, 150, 140, 3 * Math.PI / 2 - .05, Math.PI / 2 + .05, true);
    rearShield.closePath();
    context.strokeStyle = TORPEDO_COLOR;
    context.stroke(rearShield);

    myRearShield.path = rearShield;

    context.restore();
}

function createCoreUI() {
    var mainView = newContainer("mainView", instructionStyle);
    var canvas = document.createElement("canvas");
    canvas.id = mainCanvasId;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    mainView.appendChild(canvas);

    var button = newButton("Raise Shields");

    var gameContainer = document.getElementById("gameCanvas");
    gameContainer.appendChild(mainView);

    setupEventListener();
}

function tearDownView() {
    document.getElementById("gameCanvas").innerHTML = "";
}