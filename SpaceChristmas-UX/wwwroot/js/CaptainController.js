function alertBattleStations() {
    var event = {
        "Name": "prepareTacticalCombat",
        "Id": uuid(),
        "Timestamp": getUTCDatetime(),
        "Scope": "all",
        "Status": "Issued"
    };

    eventList.push(event);
    eventQueue.push(event);
    
    postEvent(event);
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

function firstLoad() {
    document.getElementById("gameCanvas").innerHTML = '<table class="captainControls">' +
        '<tr><td>' +
                '<h1 class="text-success" id="AlertColor">Alert Status: <span id="AlertText">1</span></h1>' +
            '</td></tr><tr><td></td></tr>' +
        '<tr><td>' +
                '<button class="btn btn-outline-success" onclick="document.getElementById(\'AlertColor\').className = \'text-success\'; document.getElementById(\'AlertText\').innerHTML = 1;">Alert 1!</button>' +
            '</td></tr>' +
        '<tr><td>' +
                '<button class="btn btn-outline-primary" onclick="document.getElementById(\'AlertColor\').className = \'text-primary\'; document.getElementById(\'AlertText\').innerHTML = 2;">Alert 2!</button>' +
            '</td></tr>' +
        '<tr><td>' +
                '<button class="btn btn-outline-warning" onclick="document.getElementById(\'AlertColor\').className = \'text-warning\'; document.getElementById(\'AlertText\').innerHTML = 3;">Alert 3!</button>' +
            '</td></tr>' +
        '<tr><td>' +
                '<button class="btn btn-outline-danger" onclick="document.getElementById(\'AlertColor\').className = \'text-danger\'; document.getElementById(\'AlertText\').innerHTML = 4; document.getElementById(\'battleStationsButton\').disabled = false;">Alert 4!</button>' +
            '</td><td>' +
                '<button id="battleStationsButton" class="btn btn-outline-danger" onclick="alertBattleStations()" disabled>Battle Stations!</button>' +
            '</td></tr>' +
        '</table>';
}

function eventLoop() {
    if (eventQueue.length > 0) {
        var event = eventQueue[0];
        eventQueue.splice(0, 1);

        if (event.Name === "prepareTacticalCombat") {
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
        } else if (event.Name === "startTacticalCombat") {
            startTacticalCombat();
        } else if (event.Name === "tacticalCombatSuccess") {
            tearDownView();
            firstLoad();
        } else if (event.Name === "firstLoad") {
            //tearDownView();
            firstLoad();
        }
    }
}