function getCurrentLevelNumberFn(app) {
    return (app.currentLevelIndex || 0) + 1;
}

function getElapsedMsFn(app) {
    if (!app.timerRunning) return 0;
    return Date.now() - app.timerStart;
}

function attachAppHelpers(app) {
    app.getCurrentLevelNumber = function () { return getCurrentLevelNumberFn(app); };
    app.getElapsedMs = function () { return getElapsedMsFn(app); };
}
