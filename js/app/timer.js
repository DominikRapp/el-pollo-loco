function showTimerElement(app, isVisible) {
    const timerElement = document.getElementById('hud-timer');
    if (!timerElement) return;
    timerElement.style.display = isVisible ? 'block' : 'none';
}

function runTimerLoop(app) {
    if (!app.timerRunning) return;
    const timerElement = document.getElementById('hud-timer');
    if (timerElement) {
        timerElement.textContent = app.formatMs(Date.now() - app.timerStart);
    }
    requestAnimationFrame(function () { app.loopTimer(); });
}

function stopTimer(app) {
    app.timerRunning = false;
    app.showTimer(false);
    app.lastElapsedMs = Date.now() - app.timerStart;
}

function attachTimer(app) {
    app.showTimer = function (isVisible) { showTimerElement(app, isVisible); };
    app.loopTimer = function () { runTimerLoop(app); };
    app.stopTimer = function () { stopTimer(app); };
}
