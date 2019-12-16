let charSpacing = 20;

function loadScreen() {
    var mainContainer = document.getElementById("gameCanvas");
    var canvas = document.createElement("canvas");
    canvas.id = "mainCanvas";
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    mainContainer.appendChild(canvas);
}

class BrailleMessage {
    constructor(message, location) {
        this.characters = [];
        this.baseX = location.x;
        this.location = location;

        for (var i = 0; i < message.length; i++) {
            if (message[i] == " " || message[i] == "." || message[i] == ",") {
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
            dotPath.arc(this.dotPositions[dot].x + this.positionOffset.x, this.dotPositions[dot].y + this.positionOffset.y, 2, 0, 2*Math.PI);
            context.fill(dotPath);
        }

        for (var i = 0; i < this.openDots.length; i++) {
            var dot = this.openDots[i];
            var dotPath = new Path2D();
            dotPath.arc(this.dotPositions[dot].x + this.positionOffset.x, this.dotPositions[dot].y + this.positionOffset.y, 2, 0, 2*Math.PI);
            context.stroke(dotPath);
        }

        context.restore();
    }
}