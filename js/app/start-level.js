function startLevel(app, index) {
    if (app.cdTimer) {
        clearInterval(app.cdTimer);
        app.cdTimer = null;
    }
    app.cdRunning = false;
    const cd = document.getElementById('countdown');
    if (cd) {
        cd.style.display = 'none';
        cd.textContent = '';
    }
    if (window.sfx) {
        window.sfx.stop('sys.countdown.tick');
    }

    app.suppressWinLoseOverlay = false;
    app.hideWinLoseOverlays();
    IntervalTracker.clearAll();

    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }

    app.currentLevelIndex = index;
    const factory = app.levelFactories[app.currentLevelIndex];
    const level = factory();

    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.classList.add('hidden');

    app.resetOverlays();
    app.state = GameState.GAME;

    app.world = new World(app.canvas, app.keyboard, level);
    app.showHamburger(true);
    app.setMobileControlsVisible(true);
    if (typeof app.carryOverEnergy !== 'number') {
        app.carryOverEnergy = 100;
    }
    if (app.world && app.world.character) {
        app.world.character.energy = Math.max(0, Math.min(100, app.carryOverEnergy));
        if (app.world.statusBar && typeof app.world.statusBar.setPercentage === 'function') {
            app.world.statusBar.setPercentage(app.world.character.energy);
        }
    }

    app.setHudLevel((app.currentLevelIndex || 0) + 1);

    if (app.world && app.world.character) app.world.character.canControl = false;

    const musicId = 'music.level.loop';
    if (window.sfx) window.sfx.musicTo(musicId, 400);

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

function attachStartLevel(app) {
    app.startLevel = function (index) { return startLevel(app, index); };
}
