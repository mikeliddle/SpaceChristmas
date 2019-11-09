var myGameArea;
var myGamePiece;
var myObstacles = [];
var myTorpedos = [];
var myPhasers = [];
var myscore;

function restartGame() {
    document.getElementById("myfilter").style.display = "none";
    document.getElementById("myrestartbutton").style.display = "none";
    myGameArea.stop();
    myGameArea.clear();
    myGameArea = {};
    myGamePiece = {};
    myObstacles = [];
    myscore = {};
    document.getElementById("gameCanvas").innerHTML = "";
    startGame()
}

function startGame() {
    //myGameArea = new gamearea();
    myGamePiece = new component(30, 30, "red", 30, CANVAS_HEIGHT / 2);
    myTimerLabel = new component("15px", "Consolas", "white", 220, 25, "text");
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
    this.speed = 0;
    this.angle = 0;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = color;
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();
    }
    this.newPos = function () {
        this.angle += this.moveAngle * Math.PI / 180;
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
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

     // TODO: update timer on screen.

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
        myGamePiece.moveAngle = 0;

        for (i = 0; i < myObstacles.length; i += 1) {
            myObstacles[i].x += -1;
            myObstacles[i].update();
        }

        myGamePiece.moveAngle = 0;
        myGamePiece.speed = 0;

        if (myGameArea.keys && myGameArea.keys[KEY_LEFT]) { rotateLeft(); }
        if (myGameArea.keys && myGameArea.keys[KEY_RIGHT]) { rotateRight(); }
        if (myGameArea.keys && myGameArea.keys[KEY_UP]) { firePhaser(); }
        if (myGameArea.keys && myGameArea.keys[KEY_SPACE]) { fireTorpedo(); }

        myGamePiece.newPos();
        myGamePiece.update();
    }
}

function firePhaser() {

}

function fireTorpedo() {
    myTorpedos.push({

    })
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