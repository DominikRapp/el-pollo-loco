function attachAppHelpers(app) {
    app.getCurrentLevelNumber = function () { return getCurrentLevelNumber(app); };
    app.getElapsedMs = function () { return getElapsedMilliseconds(app); };
}

function getCurrentLevelNumber(app) {
    const index = app.currentLevelIndex || 0;
    return index + 1;
}

function getElapsedMilliseconds(app) {
    if (!app.timerRunning) return 0;
    return Date.now() - app.timerStart;
}