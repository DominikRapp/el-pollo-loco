function startGame(app) {
    clearIntervalsAndDisposeWorld(app);
    hideStartScreen();
    setGameStateToRunning(app);
    createWorldFromCurrentLevel(app);
    setupGameUi(app);
    lockCharacterControl(app);
    beginCountdownThenStart(app);
}

function clearIntervalsAndDisposeWorld(app) {
    IntervalTracker.clearAll();
    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }
}

function hideStartScreen() {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.classList.add('hidden');
    }
}

function setGameStateToRunning(app) {
    app.state = GameState.GAME;
}

function createWorldFromCurrentLevel(app) {
    const makeLevel = app.levels[app.currentLevelIndex];
    const level = makeLevel();
    app.world = new World(app.canvas, app.keyboard, level);
}

function setupGameUi(app) {
    app.showHamburger(true);
    app.setMobileControlsVisible(true);
    app.setHudLevel((app.currentLevelIndex || 0) + 1);
}

function lockCharacterControl(app) {
    if (app.world && app.world.character) {
        app.world.character.canControl = false;
    }
}

function beginCountdownThenStart(app) {
    runCountdown(app, 3, function () {
        if (app.world && app.world.character) {
            app.world.character.canControl = true;
        }
        app.timerStart = Date.now();
        app.timerRunning = true;
        app.stoppedForWinOrLose = false;
        app.showTimer(true);
        app.loopTimer();
        app.loopWinLoseWatch();
    });
}
