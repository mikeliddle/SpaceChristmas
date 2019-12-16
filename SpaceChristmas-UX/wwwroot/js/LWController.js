var myShipForShields = {};
var myFrontShield = null;
var myRearShield = null;
var name = "LW";
var shieldInterval = null;

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
    setupShields();
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
    myFrontShield = { "active": false, "temp": 0 };
    myRearShield = { "active": false, "temp": 0 };
    drawShipForShields(mainCanvasId);
    shieldInterval = setInterval(updateShieldTemp, 1000);
}

function updateShieldTemp() {
    if (myFrontShield.temp >= 38) {
        myFrontShield.active = false;
        redrawShields(mainCanvasId);
    }
    if (myRearShield.temp >= 38) {
        myRearShield.active = false;
        redrawShields(mainCanvasId);
    }
    if (myFrontShield.active) {
        myFrontShield.temp += 1;
    } else if (myFrontShield.temp > 0) {
        myFrontShield.temp -= 1;
    }

    if (myRearShield.active) {
        myRearShield.temp += 1;
    } else if (myRearShield.temp > 0) {
        myRearShield.temp -= 1;
    }

    redrawShieldTemp();
}

function redrawShieldTemp() {
    const context = document.getElementById(mainCanvasId).getContext("2d");

    context.save();

    context.fillStyle = "red";

    var forward = new Path2D();
    forward.moveTo(552,448);
    forward.lineTo(552,448 - myFrontShield.temp * 10);
    forward.lineTo(648,448 - myFrontShield.temp * 10);
    forward.lineTo(648,448);
    forward.closePath();

    var ventral = new Path2D();
    ventral.moveTo(427,448);
    ventral.lineTo(427,448 - myRearShield.temp * 10);
    ventral.lineTo(523,448 - myRearShield.temp * 10);
    ventral.lineTo(523,448);
    ventral.closePath();

    context.fill(forward);
    context.fill(ventral);

    context.fillStyle = "black";

    var blackVentral = new Path2D();
    blackVentral.moveTo(427,52);
    blackVentral.lineTo(427,448 - myRearShield.temp * 10);
    blackVentral.lineTo(523,448 - myRearShield.temp * 10);
    blackVentral.lineTo(523,52);
    blackVentral.closePath();

    var blackForward = new Path2D();
    blackForward.moveTo(552,52);
    blackForward.lineTo(552,448 - myFrontShield.temp * 10);
    blackForward.lineTo(648,448 - myFrontShield.temp * 10);
    blackForward.lineTo(648,52);
    blackForward.closePath();

    context.fill(blackForward);
    context.fill(blackVentral);

    context.restore();
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
    context.font = "bold 25px Consolas";

    context.fillText("Shields", 125, 25);
    context.fillText("Shield Temp", 460, 25)

    context.font = "20px Consolas"
    context.fillText("Forward", 200, 340);
    context.fillText("Ventral", 70, 340);
    context.fillText("Forward", 560, 475);
    context.fillText("Ventral", 440, 475);

    myShipForShields = new Path2D();

    myShipForShields.moveTo(75, 125);
    myShipForShields.lineTo(175, 75);
    myShipForShields.lineTo(225, 75);
    myShipForShields.lineTo(175, 125);
    myShipForShields.lineTo(225, 125);
    myShipForShields.lineTo(275, 150);
    myShipForShields.lineTo(275, 200);
    myShipForShields.lineTo(225, 225);
    myShipForShields.lineTo(175, 225);
    myShipForShields.lineTo(225, 275);
    myShipForShields.lineTo(175, 275);
    myShipForShields.lineTo(75, 225);
    myShipForShields.lineTo(75, 125);

    context.fill(myShipForShields);

    var windshield = new Path2D();
    windshield.moveTo(225, 135);
    windshield.lineTo(270, 155);
    windshield.lineTo(270, 195);
    windshield.lineTo(225, 215);
    windshield.closePath();
    context.fillStyle = "grey";
    context.fill(windshield);

    var frontShield = new Path2D();
    frontShield.arc(175, 175, 120, 0 - (Math.PI / 2) + .05, Math.PI / 2 - .05);
    frontShield.arc(175, 175, 140, Math.PI / 2 - .05, 0 - (Math.PI / 2) + .05, true);
    frontShield.closePath();
    context.strokeStyle = TORPEDO_COLOR;
    context.stroke(frontShield);

    myFrontShield.path = frontShield;

    var rearShield = new Path2D();
    rearShield.arc(175, 175, 120, Math.PI / 2 + .05, 3 * Math.PI / 2 - .05);
    rearShield.arc(175, 175, 140, 3 * Math.PI / 2 - .05, Math.PI / 2 + .05, true);
    rearShield.closePath();
    context.strokeStyle = TORPEDO_COLOR;
    context.stroke(rearShield);

    myRearShield.path = rearShield;

    var rearGeneratorTemp = new Path2D();
    rearGeneratorTemp.moveTo(425,50);
    rearGeneratorTemp.lineTo(425,450);
    rearGeneratorTemp.lineTo(525,450);
    rearGeneratorTemp.lineTo(525,50);
    rearGeneratorTemp.closePath();

    context.stroke(rearGeneratorTemp)

    var forwardGeneratorTemp = new Path2D();
    forwardGeneratorTemp.moveTo(550,50);
    forwardGeneratorTemp.lineTo(550,450);
    forwardGeneratorTemp.lineTo(650,450);
    forwardGeneratorTemp.lineTo(650,50);
    forwardGeneratorTemp.closePath();

    context.stroke(forwardGeneratorTemp);

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
    
    if (shieldInterval) {
        clearInterval(shieldInterval);
    }
}