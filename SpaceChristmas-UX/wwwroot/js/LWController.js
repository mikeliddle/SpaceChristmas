﻿var myGameArea;
var myGamePiece;
var myObstacles = [];
var myTorpedos = [];
var torpedoRate = 30;
var torpedoState = torpedoRate + 1;
var myScore = {};

function loadScreen() {
    
}

function restartGame() {
    document.getElementById("myrestartbutton").style.display = "none";
    myGameArea.stop();
    myGameArea.clear();
    myGameArea = {};
    myGamePiece = {};
    myObstacles = [];
    myScore = {};
    document.getElementById("gameCanvas").innerHTML = "";
    startGame()
}

function startGame() {
    myGameArea = new gamearea();
    myGamePiece = new component(GAME_PIECE_HEIGHT, GAME_PIECE_HEIGHT, GAME_PIECE_COLOR, 30, CANVAS_HEIGHT / 2);
    myScore = new component("32px", "Consolas", "white", 220, 25, "text");
    myScore.score = 0;

    if (document.getElementById("instructionLabel")) {
        document.getElementById("instructionLabel").style.display = "none";
        document.getElementById("mystartbutton").style.display = "none";
    }
    

    myGameArea.start();
}

function gamearea() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    document.getElementById("gameCanvas").appendChild(this.canvas);

    this.context = this.canvas.getContext("2d");
    this.pause = false;
    this.frameNo = 0;

    this.start = function () {    
        this.interval = setInterval(updateGameArea, 20);

        window.addEventListener('keydown', function (e) {
            e.preventDefault();
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    },
    this.stop = function () {
        clearInterval(this.interval);
    },
    this.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y, type) {

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
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = color;
            ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
            ctx.restore();
        }
    }
    this.newPos = function () {
        if (this.type != "torpedo") {
            this.angle += this.moveAngle * Math.PI / 180;
        }

        this.y += this.speed * Math.sin(this.angle);
        this.x += this.speed * Math.cos(this.angle);
    }
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
    }
}

function calculateAngleToGamePiece(piece) {
    a = piece.x - this.myGamePiece.x;
    b = piece.y - this.myGamePiece.y;
    c = Math.sqrt(a * a + b * b);

    angleC = 90 *  Math.PI / 180;
    angleA = Math.asin(a * Math.sin(c) / c);
    angleB = Math.asin(b * Math.sin(c) / c);

    return 1.5 * Math.PI + angleB;
}

function updateGameArea() {
    var x, y, min, max, height, gap;

    if (myScore.score >= 25) {
        // End Successfully
        clearInterval(this.timerInterval);
        myGameArea.clear();
        myGameArea.stop();
        
        document.getElementById("successLabel").style.display = "block";

        return;
    }

    for (i = 0; i < myObstacles.length; i += 1) {
        var obstacle = myObstacles[i];
        if (myGamePiece.crashWith(obstacle)) {
            // TODO: failed
            myGameArea.stop();
            
            document.getElementById("myrestartbutton").style.display = "block";
            return;
        }
        // hit an enemy
        for (j = 0; j < myTorpedos.length; j += 1) {
            if (obstacle.crashWith(myTorpedos[j])) {
                myObstacles.splice(i, 1);
                myTorpedos.splice(j, 1);
                myScore.score += 1;
            }
        }
    }
    if (myGameArea.pause == false) {
        myGameArea.clear();
        myGameArea.frameNo += 1;
        myGamePiece.moveAngle = 0;

        myScore.text = "Score: " + myScore.score;
        myScore.update();

        // add enemies
        if (myGameArea.frameNo == 1 || everyinterval(50)) {
            x = myGameArea.canvas.width;
            
            min = 0;
            max = myGameArea.canvas.height;
            y = Math.floor(Math.random() * (max - min + 1) + min);
            var enemy = new component(GAME_PIECE_HEIGHT, GAME_PIECE_HEIGHT, OBSTACLE_COLOR, x, y, "enemy");
            enemy.angle = calculateAngleToGamePiece(enemy);

            myObstacles.push(enemy);
        }

        // move enemies
        for (i = 0; i < myObstacles.length; i += 1) {
            myObstacles[i].x = Math.sin(myObstacles[i].angle) * OBSTACLE_SPEED;
            myObstacles[i].y = Math.cos(myObstacles[i].angle) * OBSTACLE_SPEED;
            myObstacles[i].update();
        }

        // move torpedos
        for (i = 0; i < myTorpedos.length; i += 1) {
            myTorpedos[i].newPos();
            myTorpedos[i].update();
        }
        torpedoState += 1;

        // reset game piece
        myGamePiece.moveAngle = 0;
        myGamePiece.speed = 0;

        // handle keyboard events
        if (myGameArea.keys && myGameArea.keys[KEY_LEFT]) { rotateLeft(); }
        if (myGameArea.keys && myGameArea.keys[KEY_RIGHT]) { rotateRight(); }
        if (myGameArea.keys && myGameArea.keys[KEY_SPACE]) { fireTorpedo(); }

        // update game piece
        myGamePiece.newPos();
        myGamePiece.update();
    }
}

function fireTorpedo() {
    if (torpedoState > torpedoRate) {
        torpedoState = 0;
        var torpedo = new component(TORPEDO_HEIGHT, TORPEDO_HEIGHT, TORPEDO_COLOR, myGamePiece.x, myGamePiece.y, "torpedo");

        torpedo.angle = myGamePiece.angle;
        torpedo.speed = TORPEDO_SPEED;

        myTorpedos.push(torpedo);
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) { return true; }
    return false;
}

function rotateRight() {
    myGamePiece.moveAngle = 2;
}

function rotateLeft() {
    myGamePiece.moveAngle = -2;
}

function clearmove(e) {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
}