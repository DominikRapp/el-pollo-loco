function timerShow(app, visible) {
    const el = document.getElementById('hud-timer');
    if (!el) return;
    el.style.display = visible ? 'block' : 'none';
}

function timerLoop(app) {
    if (!app.timerRunning) {
        return;
    }
    const el = document.getElementById('hud-timer');
    if (el) {
        el.textContent = app.formatMs(Date.now() - app.timerStart);
    }
    requestAnimationFrame(() => app.loopTimer());
}

function timerStop(app) {
    app.timerRunning = false;
    app.showTimer(false);
    app.lastElapsedMs = Date.now() - app.timerStart;
}

function attachTimer(app) {
    app.showTimer = function (visible) { timerShow(app, visible); };
    app.loopTimer = function () { timerLoop(app); };
    app.stopTimer = function () { timerStop(app); };
}
