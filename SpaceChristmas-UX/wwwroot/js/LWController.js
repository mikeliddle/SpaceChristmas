var myGameArea;
var myGamePiece;
var myObstacles = [];
var myTorpedos = [];
var myPhasers = [];
var torpedoRate = 50;
var torpedoState = 51;
var myScore = {};

function restartGame() {
    document.getElementById("myfilter").style.display = "none";
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
    //myGameArea = new gamearea();
    myGamePiece = new component(30, 30, "red", 30, CANVAS_HEIGHT / 2);
    myScore = new component("15px", "Consolas", "white", 220, 25, "text");
    myScore.score = 0;
    this.endTime = new Date();
    this.endTime.setMinutes(this.endTime.getMinutes() + 3);
    myGameArea.start();
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.context = this.canvas.getContext("2d");

        document.getElementById("gameCanvas").appendChild(this.canvas);

        this.pause = false;
        this.frameNo = 0;
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
    stop: function () {
        clearInterval(this.interval);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y, type) {

    this.type = type;
    this.width = width;
    this.height = height;

    if (type == "text") {
        this.text = color;
    }

    this.speed = 0;
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

function updateGameArea() {
    var x, y, min, max, height, gap;

     // TODO: update kill count on screen.

    if (myScore.score >= 25) {
        clearInterval(this.timerInterval);
        // TODO: end game successfully
        myGameArea.stop();
        document.getElementById("myfilter").style.display = "block";
        document.getElementById("myrestartbutton").style.display = "block";
        return;
    }

    for (i = 0; i < myObstacles.length; i += 1) {
        var obstacle = myObstacles[i];
        if (myGamePiece.crashWith(obstacle)) {
            // TODO: failed
            myGameArea.stop();
            document.getElementById("myfilter").style.display = "block";
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

            myObstacles.push(new component(30, 30, "green", x, y, "enemy"));
        }

        // move enemies
        for (i = 0; i < myObstacles.length; i += 1) {
            myObstacles[i].x += -2;
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
        if (myGameArea.keys && myGameArea.keys[KEY_UP]) { firePhaser(); }
        if (myGameArea.keys && myGameArea.keys[KEY_SPACE]) { fireTorpedo(); }

        // update game piece
        myGamePiece.newPos();
        myGamePiece.update();
    }
}

function firePhaser() {

}

function fireTorpedo() {
    if (torpedoState > torpedoRate) {
        torpedoState = 0;
        var torpedo = new component(10, 10, "blue", myGamePiece.x, myGamePiece.y, "torpedo");

        torpedo.angle = myGamePiece.angle;
        torpedo.speed = 10;

        myTorpedos.push(torpedo);
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) { return true; }
    return false;
}

function rotateRight() {
    myGamePiece.moveAngle = 1
}

function rotateLeft() {
    myGamePiece.moveAngle = -1;
}

function clearmove(e) {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
}