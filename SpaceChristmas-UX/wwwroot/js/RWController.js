﻿var myGameArea;
var myGamePiece;
var myObstacles = [];
var myTimerLabel;

function loadScreen() {

}

function restartGame() {
    document.getElementById("myfilter").style.display = "none";
    document.getElementById("myrestartbutton").style.display = "none";
    myGameArea.stop();
    myGameArea.clear();
    myGameArea = {};
    myGamePiece = {};
    myObstacles = [];
    myTimerLabel = {};
    document.getElementById("gameCanvas").innerHTML = "";
    startGame()
}

function startGame() {
    myGameArea = new gamearea();
    myGamePiece = new component(30, 30, "red", 10, 75);
    myTimerLabel = new component("15px", "Consolas", "white", 10, 25, "text");
    this.endTime = new Date();
    this.endTime.setMinutes(this.endTime.getMinutes() + 3);
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

        this.interval = setInterval(updateGameArea, 10);

        this.timerInterval = setInterval(function () {
            this.currentTime = new Date().getTime();
        }, 10); // update every 1/10.
        window.addEventListener('keydown', function (e) {
            e.preventDefault();
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    }
    this.stop = function () {
        clearInterval(this.interval);
        clearInterval(this.timerInterval);
        this.pause = true;
    }
    this.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y, type) {

    this.type = type;
    if (type == "text") {
        this.text = color;
    }
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
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

function updateGameArea() {
    var x, y, min, max, height, gap;

    this.currentTime = new Date().getTime();
    var _endTime = this.endTime.getTime();

    var difference = _endTime - this.currentTime;

    var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((difference % (1000 * 60)) / 1000);
    var centiseconds = Math.floor((difference % (1000 * 60) / 10));

    if (difference < 0) {
        clearInterval(this.timerInterval);
        // TODO: end game successfully
        myGameArea.stop();
        document.getElementById("myfilter").style.display = "block";
        document.getElementById("myrestartbutton").style.display = "block";
        return;
    }

    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            // TODO: failed
            myGameArea.stop();
            document.getElementById("myfilter").style.display = "block";
            document.getElementById("myrestartbutton").style.display = "block";
            return;
        }
    }
    if (myGameArea.pause == false) {
        myGameArea.clear();
        myGameArea.frameNo += 1;

        myTimerLabel.text = minutes + ":" + ("0" + seconds).slice(-2) + "." + centiseconds;
        myTimerLabel.update();

        if (myGameArea.frameNo == 1 || everyinterval(150)) {
            x = myGameArea.canvas.width;
            y = myGameArea.canvas.height - 100;
            min = 60;
            max = 200;
            height = Math.floor(Math.random() * (max - min + 1) + min);
            min = 50;
            max = 200;
            gap = Math.floor(Math.random() * (max - min + 1) + min);
            myObstacles.push(new component(10, height, "green", x, 0));
            myObstacles.push(new component(10, x - height - gap, "green", x, height + gap));
        }
        for (i = 0; i < myObstacles.length; i += 1) {
            myObstacles[i].x += -1;
            myObstacles[i].update();
        }

        if (myGameArea.keys && myGameArea.keys[KEY_LEFT]) { moveleft(null); }
        if (myGameArea.keys && myGameArea.keys[KEY_RIGHT]) { moveright(null); }
        if (myGameArea.keys && myGameArea.keys[KEY_UP]) { moveup(null); }
        if (myGameArea.keys && myGameArea.keys[KEY_DOWN]) { movedown(null); }

        myGamePiece.x += myGamePiece.speedX;
        myGamePiece.y += myGamePiece.speedY;
        myGamePiece.speedX = 0;
        myGamePiece.speedY = 0;
        myGamePiece.update();
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) { return true; }
    return false;
}

function moveup(e) {
    myGamePiece.speedY = -1;
}

function movedown() {
    myGamePiece.speedY = 1;
}

function moveleft() {
    myGamePiece.speedX = -1;
}

function moveright() {
    myGamePiece.speedX = 1;
}

function clearmove(e) {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
}