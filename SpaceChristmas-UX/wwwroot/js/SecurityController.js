function firstLoad() {
}

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

function tearDownView() {
    document.getElementById("gameCanvas").innerHTML = "";
}

function scanShips(text) {
    document.getElementById("gameCanvas").innerHTML = `<h3>${document.getElementById("placeholder").value}</h3>`;
}

function addButton(label, text) {
    tearDownView();

    var button = document.createElement("button");
    button.innerHTML = label;
    var placeholder = document.createElement("input");
    placeholder.id = "placeholder";
    placeholder.value = text;
    placeholder.hidden = true;
    button.onclick = scanShips;
    button.style = "margin-top: 30px;";
    button.className += "btn btn-primary";

    var container = document.getElementById("gameCanvas");
    container.appendChild(button);
    container.appendChild(placeholder);
}

function eventLoop() {
    if (eventQueue.length > 0) {
        var event = eventQueue[0];
        eventQueue.splice(0, 1);

        if (event.Name === "prepareTacticalCombat" || event.name === "prepareTacticalCombat") {
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
                    "Status": 0
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
        } else if (event.Name === "ScanLocalNeeded" || event.name === "ScanLocalNeeded") {
            addButton("Scan Ship", event.Value);
        } else if (event.Name === "ScanShipsNeeded" || event.name === "ScanShipsNeeded") {
            addButton("Scan Other Ships", event.Value);
        }
    }
}