document.getElementById("joinForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    var form = event.currentTarget;
    var button = form.querySelector("button[type=submit]");
    var error = document.getElementById("joinError");
    var inviteCode = document.getElementById("group-code-input").value.trim();
    if (!inviteCode || button.disabled) {
        return;
    }

    error.hidden = true;
    button.disabled = true;
    try {
        var response = await fetch("/api/sessions/join", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-SpaceChristmas-Request": "1"
            },
            body: JSON.stringify({ inviteCode: inviteCode })
        });
        if (!response.ok) {
            error.textContent = response.status === 401 || response.status === 403 || response.status === 404
                ? "That invite code could not be joined. Check the code and try again."
                : "Unable to join the crew right now. Please try again.";
            error.hidden = false;
            return;
        }

        form.hidden = true;
        document.getElementById("stations").hidden = false;
    } catch (e) {
        error.textContent = "Unable to reach the server. Check your connection and try again.";
        error.hidden = false;
    } finally {
        button.disabled = false;
    }
});
