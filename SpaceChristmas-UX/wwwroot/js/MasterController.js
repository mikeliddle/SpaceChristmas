function sendMessage(evt) {
    var event = {
        "Name": "newMessage",
        "Id": uuid(),
        "Scope": "communications",
        "TimeStamp": getUTCDatetime(),
        "Status": 0,
        "Value": evt.innerText
    };

    postEvent(event);
}

function triggerThrusterFlight() {
    var event = {
        "Name": "prepareThrusterFlight",
        "Id": uuid(),
        "Scope": "rightWing",
        "TimeStamp": getUTCDatetime(),
        "Status": 0
    };

    postEvent(event);
}

function updateSecurityStatus(text) {
    var nameAndValue = evt.innerText.split("#");
    
    var event = {
        "Name": nameAndValue[0],
        "Id": uuid(),
        "Scope": "security",
        "TimeStamp": getUTCDatetime(),
        "Status": 0,
        "Value": nameAndValue[1]
    };

    postEvent(event);
}

function updateEngineeringStatus(text) {
    var nameAndValue = evt.innerText.split("#");

    var event = {
        "Name": nameAndValue[0],
        "Id": uuid(),
        "Scope": "engineering",
        "TimeStamp": getUTCDatetime(),
        "Status": 0,
        "Value": nameAndValue[1]
    };

    postEvent(event);
}