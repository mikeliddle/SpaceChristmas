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
    var nameAndValue = evt.toElement.innerText.split("#");
    
    var event = {
        "Name": nameAndValue[0],
        "Id": uuid(),
        "Scope": "security",
        "TimeStamp": getUTCDatetime(),
        "Status": "pending",
        "Value": nameAndValue[1]
    };

    postEvent(event);
}

function updateEngineeringStatus(text) {
    var nameAndValue = evt.toElement.innerText.split("#");

    var event = {
        "Name": nameAndValue[0],
        "Id": uuid(),
        "Scope": "engineering",
        "TimeStamp": getUTCDatetime(),
        "Status": "pending",
        "Value": nameAndValue[1]
    };

    postEvent(event);
}