﻿var flightArea;
var shipPieceForFlight;
var barriers = [];
var myTimerLabel = {};

function loadScreen() {

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
    startThrusterFlight()
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

function FlightArea() {
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
        })
        window.addEventListener('keyup', function (e) {
            flightArea.keys[e.keyCode] = (e.type == "keydown");
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

function flightComponent(width, height, color, x, y, type) {

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
        ctx = flightArea.context;
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

function updateFlightArea() {
    var x, y, min, max, height, gap;

    this.currentTime = new Date().getTime();
    var _endTime = this.endTime.getTime();

    var difference = _endTime - this.currentTime;

    var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((difference % (1000 * 60)) / 1000);
    var centiseconds = Math.floor((difference % (1000 * 60) / 10));

    if (difference < 0) {
        // End Successfully
        clearInterval(this.timerInterval);
        flightArea.clear();
        flightArea.stop();
        
        document.getElementById("successLabel").style.display = "block";
        return;
    }

    for (i = 0; i < barriers.length; i += 1) {
        if (shipPieceForFlight.crashWith(barriers[i])) {
            // TODO: failed
            flightArea.stop();
            
            document.getElementById("myrestartbutton").style.display = "block";
            return;
        }
    }
    if (flightArea.pause == false) {
        flightArea.clear();
        flightArea.frameNo += 1;

        myTimerLabel.text = ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2) + "." + centiseconds;
        myTimerLabel.update();

        if (flightArea.frameNo == 1 || everyinterval(150)) {
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

function everyinterval(n) {
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