// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.
var eventQueue = [];
var eventList = [];

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function uuid() {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

function getUTCDatetime() {
    var now = new Date();
    return `${now.getUTCFullYear()}-${now.getUTCMonth}-${now.getUTCDate}T:${now.getUTCHours}:${now.getUTCMinutes}:${now.getUTCSeconds}.${now.getUTCMilliseconds}Z`
}

var remoteUrl = "https://localhost:5001/"

function poll(sequenceNumber = 0) {
    if (!sessionStorage.getItem("sessionId")) {
        return;
    }

    var poll = setTimeout(function () {
        $.ajax({
            url: remoteUrl + "api/Events/" + sequenceNumber,
            headers: { "sessionId": sessionStorage.getItem("sessionId") },
            success: function (response) {
                var latestEvent = eventList[eventList.length];

                for (var event in response) {
                    if (event.TimeStamp > latestEvent.TimeStamp) {
                        eventList.push(event);
                        eventQueue.push(event);
                    }
                }
            },
            dataType: "json"
        })
    }, 1000);
}

function postEvent(event) {
    if (event.scope === "_local") {
        // quit out early if we can.
        return;
    }

    if (!sessionStorage.getItem("sessionId")) {
        return;
    }

    var post = setTimeout(function () {
        $.ajax({
            url: remoteUrl + "api/Events",
            method: "POST",
            headers: { "sessionId": sessionStorage.getItem("sessionId") },
            data: event,
            error: function (xhr, status, e) {
                console.log(e);
            },
            dataType: "json"
        })
    });
}

function getMousePosition(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
    };
}

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

// tactical combat section
var tacticalCombatArea;
var tacticalGamePiece;
var enemyObjects = [];
var myTorpedos = [];
var torpedoRate = 30;
var torpedoState = torpedoRate + 1;
var hitPoints = {};

function restartCombat() {
    tacticalCombatArea.stop();
    tacticalCombatArea.clear();
    tacticalCombatArea = {};
    tacticalGamePiece = {};
    enemyObjects = [];
    myTorpedos = [];
    hitPoints = {};
    document.getElementById("gameCanvas").innerHTML = "";
    eventQueue.push({
        "Name": "startTacticalCombat",
        "TimeStamp": getUTCDatetime(),
        "Id": uuid(),
        "Scope": "_local",
        "Status": "Complete"
    });
}

function startTacticalCombat() {
    tacticalCombatArea = new CombatArea();
    tacticalGamePiece = new combatComponent(GAME_PIECE_HEIGHT, GAME_PIECE_HEIGHT, GAME_PIECE_COLOR, 30, CANVAS_HEIGHT / 2);
    hitPoints = new combatComponent("32px", "Consolas", "white", 220, 25, "text");
    hitPoints.score = 0;

    if (document.getElementById("instructionLabel")) {
        document.getElementById("instructionLabel").style.display = "none";
        document.getElementById("mystartbutton").style.display = "none";
    }

    tacticalCombatArea.start();
}

class CombatArea {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.id = mainCanvasId;
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        document.getElementById("gameCanvas").appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.pause = false;
        this.frameNo = 0;

        this.start = function () {
            this.interval = setInterval(updateCombatArea, 20);
            window.addEventListener('keydown', function (e) {
                e.preventDefault();
                tacticalCombatArea.keys = (tacticalCombatArea.keys || []);
                tacticalCombatArea.keys[e.keyCode] = (e.type == "keydown");
            });
            window.addEventListener('keyup', function (e) {
                tacticalCombatArea.keys[e.keyCode] = (e.type == "keydown");
            });
        };
        this.stop = function () {
            clearInterval(this.interval);
        };
        this.clear = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
    }
}

class combatComponent {
    constructor(width, height, color, x, y, type) {
        this.type = type;
        if (type == "text") {
            this.text = color;
        }
        this.speed = 0;
        this.width = width;
        this.height = height;
        this.angle = 0;
        this.moveAngle = 0;
        this.x = x;
        this.y = y;
        this.update = function () {
            this.ctx = tacticalCombatArea.context;
            if (this.type == "text") {
                this.ctx.font = this.width + " " + this.height;
                this.ctx.fillStyle = color;
                this.ctx.fillText(this.text, this.x, this.y);
            }
            else {
                this.ctx.save();
                this.ctx.translate(this.x, this.y);
                this.ctx.rotate(this.angle);
                this.ctx.fillStyle = color;
                this.ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
                this.ctx.restore();
            }
        };
        this.newPos = function () {
            if (this.type != "torpedo") {
                this.angle += this.moveAngle * Math.PI / 180;
            }
            this.y += this.speed * Math.sin(this.angle);
            this.x += this.speed * Math.cos(this.angle);
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

function calculateAngleToGamePiece(piece) {
    a = piece.x - this.tacticalGamePiece.x;
    b = piece.y - this.tacticalGamePiece.y;
    c = Math.sqrt(a * a + b * b);

    angleC = 90 * Math.PI / 180;
    angleA = Math.asin(a * Math.sin(angleC) / c);
    angleB = Math.asin(b * Math.sin(angleC) / c);

    return (angleB - Math.PI / 2);
}

function updateCombatArea() {
    var x, y, min, max, height, gap;

    if (hitPoints.score >= 25) {
        // End Successfully
        clearInterval(this.timerInterval);
        tacticalCombatArea.clear();
        tacticalCombatArea.stop();

        var canvas = document.getElementById("gameCanvas");
        
        var ctx = canvas.getContext("2d");
        ctx.save();
        ctx.font = "30 Consolas";
        ctx.fillStyle = "white";

        ctx.fillText("Success!!!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

        ctx.restore();

        setTimeout(() => eventQueue.push({
            "Name": "tacticalCombatSuccess",
            "TimeStamp": getUTCDatetime(),
            "Id": uuid(),
            "Scope": "LW",
            "Status": "Complete"
        }), 3000);

        return;
    }

    for (i = 0; i < enemyObjects.length; i += 1) {
        var obstacle = enemyObjects[i];
        if (tacticalGamePiece.crashWith(obstacle)) {
            // TODO: failed
            tacticalCombatArea.stop();

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
        // hit an enemy
        for (j = 0; j < myTorpedos.length; j += 1) {
            if (obstacle.crashWith(myTorpedos[j])) {
                enemyObjects.splice(i, 1);
                myTorpedos.splice(j, 1);
                hitPoints.score += 1;
            }
        }
    }
    if (tacticalCombatArea.pause == false) {
        tacticalCombatArea.clear();
        tacticalCombatArea.frameNo += 1;
        tacticalGamePiece.moveAngle = 0;

        hitPoints.text = "Score: " + hitPoints.score;
        hitPoints.update();

        // add enemies
        if (tacticalCombatArea.frameNo == 1 || tacticalEveryInterval(50)) {
            x = tacticalCombatArea.canvas.width;

            min = 0;
            max = tacticalCombatArea.canvas.height;
            y = Math.floor(Math.random() * (max - min + 1) + min);
            var enemy = new combatComponent(GAME_PIECE_HEIGHT, GAME_PIECE_HEIGHT, OBSTACLE_COLOR, x, y, "enemy");
            enemy.angle = calculateAngleToGamePiece(enemy);

            enemyObjects.push(enemy);
        }

        // move enemies
        for (i = 0; i < enemyObjects.length; i += 1) {
            enemyObjects[i].x += Math.sin(enemyObjects[i].angle) * OBSTACLE_SPEED;
            enemyObjects[i].y -= Math.cos(enemyObjects[i].angle) * OBSTACLE_SPEED;
            enemyObjects[i].update();
        }

        // move torpedos
        for (i = 0; i < myTorpedos.length; i += 1) {
            myTorpedos[i].newPos();
            myTorpedos[i].update();
        }
        torpedoState += 1;

        // reset game piece
        tacticalGamePiece.moveAngle = 0;
        tacticalGamePiece.speed = 0;

        // handle keyboard events
        if (tacticalCombatArea.keys && tacticalCombatArea.keys[KEY_LEFT]) { rotateLeft(); }
        if (tacticalCombatArea.keys && tacticalCombatArea.keys[KEY_RIGHT]) { rotateRight(); }
        if (tacticalCombatArea.keys && tacticalCombatArea.keys[KEY_SPACE]) { fireTorpedo(); }

        // update game piece
        tacticalGamePiece.newPos();
        tacticalGamePiece.update();
    }
}

function fireTorpedo() {
    if (torpedoState > torpedoRate) {
        torpedoState = 0;
        var torpedo = new combatComponent(TORPEDO_HEIGHT, TORPEDO_HEIGHT, TORPEDO_COLOR, tacticalGamePiece.x, tacticalGamePiece.y, "torpedo");

        torpedo.angle = tacticalGamePiece.angle;
        torpedo.speed = TORPEDO_SPEED;

        myTorpedos.push(torpedo);
    }
}

function tacticalEveryInterval(n) {
    if ((tacticalCombatArea.frameNo / n) % 1 == 0) { return true; }
    return false;
}

function rotateRight() {
    tacticalGamePiece.moveAngle = 2;
}

function rotateLeft() {
    tacticalGamePiece.moveAngle = -2;
}

function clearmove(e) {
    tacticalGamePiece.speedX = 0;
    tacticalGamePiece.speedY = 0;
}