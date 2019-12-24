function sendMessage(evt) {
    var event = {
        "Name": "newMessage",
        "Id": uuid(),
        "Scope": "communications",
        "TimeStamp": getUTCDatetime(),
        "Status": "pending",
        "Value": evt.toElement.innerText
    };

    postEvent(event);
}

function triggerThrusterFlight() {
    var event = {
        "Name": "prepareThrusterFlight",
        "Id": uuid(),
        "Scope": "rightWing",
        "TimeStamp": getUTCDatetime(),
        "Status": "pending"
    };

    postEvent(event);
}

function updateSecurityStatus(text) {
    var event = {
        "Name": "newMessage",
        "Id": uuid(),
        "Scope": "security",
        "TimeStamp": getUTCDatetime(),
        "Status": "pending",
        "Value": evt.toElement.innerText
    };

    postEvent(event);
}

function updateEngineeringStatus(text) {
    var event = {
        "Name": "newMessage",
        "Id": uuid(),
        "Scope": "engineering",
        "TimeStamp": getUTCDatetime(),
        "Status": "pending",
        "Value": evt.toElement.innerText
    };

    postEvent(event);
}