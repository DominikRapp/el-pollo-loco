function startGame(app) {
    IntervalTracker.clearAll();
    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }

    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.classList.add('hidden');

    app.state = GameState.GAME;

    const makeLevel = app.levels[app.currentLevelIndex];
    const level = makeLevel();
    app.world = new World(app.canvas, app.keyboard, level);
    app.showHamburger(true);
    app.setMobileControlsVisible(true);

    app.setHudLevel((app.currentLevelIndex || 0) + 1);

    if (app.world && app.world.character) app.world.character.canControl = false;

    runCountdown(app, 3, () => {
        if (app.world && app.world.character) app.world.character.canControl = true;
        app.timerStart = Date.now();
        app.timerRunning = true;
        app.stoppedForWinOrLose = false;
        app.showTimer(true);
        app.loopTimer();
        app.loopWinLoseWatch();
    });
}
