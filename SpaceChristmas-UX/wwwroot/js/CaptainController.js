function alertBattleStations() {
    var event = {
        Name: "prepareTacticalCombat",
        Id: uuid(),
        Timetamp: getUTCDatetime(),
        Scope: "all",
        Status: 0
    };

    eventList.push(event);
    eventQueue.push(event);
    
    postEvent(event);
}

function loadScreen() {
    eventQueue.push({
        Name: "firstLoad",
        TimeStamp: getUTCDatetime(),
        Id: uuid(),
        Scope: "_local",
        Status: 0
    });
    setInterval(eventLoop, 100);
    setInterval(poll, 1000);
}

function changeAlertFromLocal(to) {
    var event = {
        Name: "alertStatusChanged",
        TimeStamp: getUTCDatetime(),
        Scope: "all",
        Value: "" + to,
        Id: uuid(),
        Status: 0
    };

    eventQueue.push(event);
    postEvent(event);
}

function changeAlert(to) {
    if (to == 4) {
        document.getElementById('battleStationsButton').disabled = false;
    } else {
        document.getElementById('battleStationsButton').disabled = true;
    }

    document.getElementById("AlertText").innerHTML = to;

    switch(to) {
        case "1":
            document.getElementById("AlertColor").className = "text-success";
            break;
        case "2":
            document.getElementById("AlertColor").className = "text-primary";
            break;
        case "3":
            document.getElementById("AlertColor").className = "text-warning";
            break;
        case "4":
            document.getElementById("AlertColor").className = "text-danger";
            break;
        default:
            break;
    }
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
                '<button class="btn btn-outline-success" onclick="changeAlertFromLocal(1);">Alert 1!</button>' +
            '</td></tr>' +
        '<tr><td>' +
                '<button class="btn btn-outline-primary" onclick="changeAlertFromLocal(2);">Alert 2!</button>' +
            '</td></tr>' +
        '<tr><td>' +
                '<button class="btn btn-outline-warning" onclick="changeAlertFromLocal(3);">Alert 3!</button>' +
            '</td></tr>' +
        '<tr><td>' +
                '<button class="btn btn-outline-danger" onclick="changeAlertFromLocal(4); ">Alert 4!</button>' +
            '</td><td>' +
                '<button id="battleStationsButton" class="btn btn-outline-danger" onclick="alertBattleStations()" disabled>Battle Stations!</button>' +
            '</td></tr>' +
        '</table>';
}

function eventLoop() {
    if (eventQueue.length > 0) {
        var event = eventQueue[0];
        eventQueue.splice(0, 1);

        if (event.name === "prepareTacticalCombat" || event.Name === "prepareTacticalCombat" ) {
            tearDownView();

            var instructionContainer = newContainer("instructionLabel", instructionStyle);
            instructionContainer.innerHTML = "<h3>Use the left and right arrow keys to rotate the gun alignment. Use the space bar to fire torpedos.</h3>";

            var startContainer = newContainer("mystartbutton", startButtonStyle);
            var startButton = newButton("Start");
            startButton.classList.add("btn");
            startButton.classList.add("btn-primary");
            startButton.onclick = function () {
                eventQueue.push({
                    Name: "startTacticalCombat",
                    TimeStamp: getUTCDatetime(),
                    Id: uuid(),
                    Scope: "_local",
                    Status: 0
                });
            };

            startContainer.appendChild(startButton);

            document.getElementById("gameCanvas").appendChild(instructionContainer);
            document.getElementById("gameCanvas").appendChild(startContainer);
        } else if (event.name === "startTacticalCombat" || event.Name === "startTacticalCombat" ) {
            startTacticalCombat();
        } else if (event.name === "tacticalCombatSuccess" || event.Name === "tacticalCombatSuccess" ) {
            tearDownView();
            firstLoad();
        } else if (event.name === "firstLoad" || event.Name === "firstLoad" ) {
            //tearDownView();
            firstLoad();
        } else if (event.name === "alertStatusChanged" || event.Name === "alertStatusChanged" ) {
            changeAlert(event.Value);
        }
    }
}