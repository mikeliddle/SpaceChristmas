// Key codes used for event listeners.
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_SPACE = 32;

// Canvas Properties
var CANVAS_WIDTH = 700;
var CANVAS_HEIGHT = 500;

var TORPEDO_HEIGHT = 10;
var TORPEDO_COLOR = "blue";
var TORPEDO_RATE = 30;
var TORPEDO_SPEED = 10;


var GAME_PIECE_COLOR = "green";
var GAME_PIECE_HEIGHT = 30;

var OBSTACLE_COLOR = "red";
var OBSTACLE_WIDTH = 10;
var OBSTACLE_SPEED = 2;

// Elements
var restartStyle = "position: absolute; padding - top: 225px; padding - left: 300px;";
var successStyle = "position:relative;text-align:center;top: 30%;-ms-transform: translateY(-50%);transform: translateY(-50%);";
var instructionStyle = "display:block;text-align:center;padding-top:30px;padding-left:30px;padding-right:30px;width:100%;";
var startButtonStyle = "position:relative;top: 30%;-ms-transform: translateY(-50%);transform: translateY(-50%);text-align:center;display:block;";

var gamePieceVertices = [{ "x": 150, "y": 50 }, { "x": 200, "y": 50 }, { "x": 150, "y": 100 }, { "x": 200, "y": 100 }, { "x": 250, "y": 125 }, { "x": 250, "y": 175 }, { "x": 200, "y": 200 }, { "x": 150, "y": 200 }, { "x": 200, "y": 250 }, { "x": 150, "y": 250 }, { "x": 50, "y": 200 }, { "x": 50, "y": 100 }];