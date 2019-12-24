let charSpacing = 20;
var messages = [];
let messageCanvasId = "messageCanvas";
var messageButton = {};

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

function firstLoad() {
    
}

function tearDownView() {
    document.getElementById("gameCanvas").innerHTML = "";
}

function drawMessageButton() {
    var canvas = document.getElementById(messageCanvasId);
    
    if (typeof(canvas) == undefined || canvas == null) {
        canvas = document.createElement("canvas");
        canvas.id = messageCanvasId;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        document.getElementById("gameCanvas").appendChild(canvas);

        canvas.addEventListener("mouseup", function (ev) {

            var mousePosition = getMousePosition(canvas, ev);
            var context = canvas.getContext("2d");
    
            if (context.isPointInPath(messageButton, mousePosition.x, mousePosition.y)) {
                context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                messageButton = null;
                
                var message = messages[0];
                messages.splice(0, 1);
                message.drawMessage(canvas);
            }
        });
    }

    var context = canvas.getContext("2d");
    context.save();

    context.fillStyle = "#337ab7";
    
    messageButton = new Path2D();
    messageButton.rect(CANVAS_WIDTH / 2 - 60, CANVAS_HEIGHT / 2 - 12.5, 120, 25);
    context.fill(messageButton);

    context.fillStyle = "white";
    context.font = "15px consolas";
    context.fillText("Show Message", CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT / 2 + 5);

    context.restore();
}

function eventLoop() {
    if (messages.length > 0) {
        drawMessageButton();
    }

    if (eventQueue.length > 0) {
        var event = eventQueue[0];
        eventQueue.splice(0, 1);

        if (event.Name === "newMessage" || event.name === "newMessage") {
            messages.push(new BrailleMessage(event.Value, { "x": 10, "y": 10 }));
            drawMessageButton();
        } else if (event.Name === "displayMessage" || event.name === "displayMessage") {
            message.drawMessage();
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

class BrailleMessage {
    constructor(message, location) {
        this.characters = [];
        this.baseX = location.x;
        this.location = location;
        message = message.toLowerCase();

        for (var i = 0; i < message.length; i++) {
            if ("., :;'\"-()".indexOf(message[i]) != -1) {
                if (this.location.x >= CANVAS_WIDTH - 100) {
                    this.location.y += 35;
                    this.location.x = this.baseX;
                } else {
                    this.location.x += 10;
                }
            } else {
                this.characters.push(new BrailleCharacter(message[i], { x: this.location.x, y: this.location.y }));
                this.location.x += 22;
            }
        }
    }

    drawMessage(canvas) {
        for (var i = 0; i < this.characters.length; i++) {
            this.characters[i].drawDots(canvas);
        }
    }
}

class BrailleCharacter {
    constructor(asciichar, position) {
        var characterObj = this.alphabet[asciichar];

        this.filledDots = characterObj["filled"];
        this.openDots = characterObj["open"];
        this.positionOffset = position;
    }

    dotPositions = [
        {},
        {
            "x": 5,
            "y": 5
        },
        {
            "x": 15,
            "y": 5
        },
        {
            "x": 5,
            "y": 15
        },
        {
            "x": 15,
            "y": 15
        },
        {
            "x": 5,
            "y": 25
        },
        {
            "x": 15,
            "y": 25
        }
    ]

    alphabet = {
        "1": {
            "filled": [1],
            "open": [2, 3, 4, 5, 6]
        },
        "2": {
            "filled": [1, 3],
            "open": [2, 4, 5, 6]
        },
        "3": {
            "filled": [1, 2],
            "open": [3, 4, 5, 6]
        },
        "4": {
            "filled": [1, 2, 4],
            "open": [3, 5, 6]
        },
        "5": {
            "filled": [1, 4],
            "open": [2, 3, 5, 6]
        },
        "6": {
            "filled": [1, 2, 3],
            "open": [4, 5, 6]
        },
        "7": {
            "filled": [1, 2, 3, 4],
            "open": [5, 6]
        },
        "8": {
            "filled": [1, 3, 4],
            "open": [2, 5, 6]
        },
        "9": {
            "filled": [2, 3],
            "open": [1, 4, 5, 6]
        },
        "0": {
            "filled": [2, 3, 4],
            "open": [1, 5, 6]
        },
        "a": {
            "filled": [1],
            "open": [2, 3, 4, 5, 6]
        },
        "b": {
            "filled": [1, 3],
            "open": [2, 4, 5, 6]
        },
        "c": {
            "filled": [1, 2],
            "open": [3, 4, 5, 6]
        },
        "d": {
            "filled": [1, 2, 4],
            "open": [3, 5, 6]
        },
        "e": {
            "filled": [1, 4],
            "open": [2, 3, 5, 6]
        },
        "f": {
            "filled": [1, 2, 3],
            "open": [4, 5, 6]
        },
        "g": {
            "filled": [1, 2, 3, 4],
            "open": [5, 6]
        },
        "h": {
            "filled": [1, 3, 4],
            "open": [2, 5, 6]
        },
        "i": {
            "filled": [2, 3],
            "open": [1, 4, 5, 6]
        },
        "j": {
            "filled": [2, 3, 4],
            "open": [1, 5, 6]
        },
        "k": {
            "filled": [1, 5],
            "open": [2, 3, 4, 6]
        },
        "l": {
            "filled": [1, 3, 5],
            "open": [2, 4, 6]
        },
        "m": {
            "filled": [1, 2, 5],
            "open": [3, 4, 6]
        },
        "n": {
            "filled": [1, 2, 4, 5],
            "open": [3, 6]
        },
        "o": {
            "filled": [1, 4, 5],
            "open": [2, 3, 6]
        },
        "p": {
            "filled": [1, 2, 3, 5],
            "open": [4, 6]
        },
        "q": {
            "filled": [1, 2, 3, 4, 5],
            "open": [6]
        },
        "r": {
            "filled": [1, 3, 4, 5],
            "open": [2, 6]
        },
        "s": {
            "filled": [2, 3, 5],
            "open": [1, 4, 6]
        },
        "t": {
            "filled": [2, 3, 4, 5],
            "open": [1, 6]
        },
        "u": {
            "filled": [1, 5, 6],
            "open": [2, 3, 4]
        },
        "v": {
            "filled": [1, 3, 5, 6],
            "open": [2, 4]
        },
        "w": {
            "filled": [2, 3, 4, 6],
            "open": [1, 5]
        },
        "x": {
            "filled": [1, 2, 5, 6],
            "open": [3, 4]
        },
        "y": {
            "filled": [1, 2, 4, 5, 6],
            "open": [3]
        },
        "z": {
            "filled": [1, 4, 5, 6],
            "open": [2, 3]
        }
    }

    drawDots(canvas) {
        let context = canvas.getContext("2d");
        context.save();

        context.fillStyle = "white";
        context.strokeStyle = "white";

        for (var i = 0; i < this.filledDots.length; i++) {
            var dot = this.filledDots[i];
            var dotPath = new Path2D();
            dotPath.arc(this.dotPositions[dot].x + this.positionOffset.x, this.dotPositions[dot].y + this.positionOffset.y, 2, 0, 2 * Math.PI);
            context.fill(dotPath);
        }

        for (var i = 0; i < this.openDots.length; i++) {
            var dot = this.openDots[i];
            var dotPath = new Path2D();
            dotPath.arc(this.dotPositions[dot].x + this.positionOffset.x, this.dotPositions[dot].y + this.positionOffset.y, 2, 0, 2 * Math.PI);
            context.stroke(dotPath);
        }

        context.restore();
    }
}