async function loadScreen() {
    var error = document.getElementById("masterError");
    try {
        var response = await fetch("/api/sessions/current", { credentials: "same-origin" });
        if (response.status === 404) {
            response = await fetch("/api/sessions", {
                method: "POST",
                credentials: "same-origin",
                headers: { "X-SpaceChristmas-Request": "1" }
            });
        }
        if (response.status === 401 || response.status === 403) {
            window.location.assign("/Admin/Login");
            return;
        }
        if (!response.ok) {
            throw new Error("Session request failed");
        }

        var session = await response.json();
        if (!session.InviteCode) {
            throw new Error("Session invite code missing");
        }
        document.getElementById("inviteCode").textContent = session.InviteCode;
        document.getElementById("masterControls").disabled = false;
    } catch (e) {
        error.textContent = "Unable to load a crew session. Refresh to try again.";
        error.hidden = false;
        document.getElementById("inviteCode").textContent = "Unavailable";
    }
}

document.addEventListener("DOMContentLoaded", loadScreen);
document.getElementById("logoutButton").addEventListener("click", async function () {
    var button = this;
    button.disabled = true;
    try {
        var response = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
            headers: { "X-SpaceChristmas-Request": "1" }
        });
        if (!response.ok) {
            throw new Error("Logout failed");
        }
        window.location.assign("/Admin/Login");
    } catch (e) {
        var error = document.getElementById("masterError");
        error.textContent = "Unable to sign out. Please try again.";
        error.hidden = false;
        button.disabled = false;
    }
});

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

function updateSecurityStatus(evt) {
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

function updateEngineeringStatus(evt) {
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