document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    var form = event.currentTarget;
    var button = form.querySelector("button[type=submit]");
    var error = document.getElementById("loginError");
    if (button.disabled) {
        return;
    }

    error.hidden = true;
    button.disabled = true;
    try {
        var response = await fetch("/api/auth/login", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-SpaceChristmas-Request": "1"
            },
            body: JSON.stringify({ password: document.getElementById("adminPassword").value })
        });
        if (response.ok) {
            window.location.assign("/Master");
            return;
        }
        error.textContent = response.status === 429
            ? "Too many sign-in attempts. Try again in a few minutes."
            : response.status === 401 || response.status === 403
            ? "Incorrect password. Please try again."
            : "Unable to sign in right now. Please try again.";
        error.hidden = false;
    } catch (e) {
        error.textContent = "Unable to reach the server. Check your connection and try again.";
        error.hidden = false;
    } finally {
        button.disabled = false;
    }
});
