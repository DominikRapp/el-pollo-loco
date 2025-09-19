function startLevel(app, index) {
    stopAndResetCountdown(app);
    resetOverlaysAndIntervals(app);
    disposeCurrentWorldIfAny(app);
    const level = createLevelFromFactory(app, index);
    hideStartScreen();
    resetAndSetGameState(app);
    createWorldWithLevel(app, level);
    showGameUi(app);
    ensureCarryOverEnergy(app);
    applyEnergyToCharacter(app);
    updateHudLevel(app);
    lockCharacterControl(app);
    playLevelMusic();
    startAfterCountdown(app);
}

function stopAndResetCountdown(app) {
    if (app.cdTimer) {
        clearInterval(app.cdTimer);
        app.cdTimer = null;
    }
    app.cdRunning = false;
    const countdown = document.getElementById('countdown');
    if (countdown) {
        countdown.style.display = 'none';
        countdown.textContent = '';
    }
    if (window.sfx) window.sfx.stop('sys.countdown.tick');
}

function resetOverlaysAndIntervals(app) {
    app.suppressWinLoseOverlay = false;
    app.hideWinLoseOverlays();
    IntervalTracker.clearAll();
}

function disposeCurrentWorldIfAny(app) {
    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }
}

function createLevelFromFactory(app, index) {
    app.currentLevelIndex = index;
    const factory = app.levelFactories[app.currentLevelIndex];
    const level = factory();
    return level;
}

function hideStartScreen() {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.classList.add('hidden');
}

function resetAndSetGameState(app) {
    app.resetOverlays();
    app.state = GameState.GAME;
}

function createWorldWithLevel(app, level) {
    app.world = new World(app.canvas, app.keyboard, level);
}

function showGameUi(app) {
    app.showHamburger(true);
    app.setMobileControlsVisible(true);
}

function ensureCarryOverEnergy(app) {
    if (typeof app.carryOverEnergy !== 'number') {
        app.carryOverEnergy = 100;
    }
}

function applyEnergyToCharacter(app) {
    if (app.world && app.world.character) {
        const energy = Math.max(0, Math.min(100, app.carryOverEnergy));
        app.world.character.energy = energy;
        if (app.world.statusBar && typeof app.world.statusBar.setPercentage === 'function') {
            app.world.statusBar.setPercentage(app.world.character.energy);
        }
    }
}

function updateHudLevel(app) {
    app.setHudLevel((app.currentLevelIndex || 0) + 1);
}

function lockCharacterControl(app) {
    if (app.world && app.world.character) {
        app.world.character.canControl = false;
    }
}

function playLevelMusic() {
    const musicId = 'music.level.loop';
    if (window.sfx) window.sfx.musicTo(musicId, 400);
}

function startAfterCountdown(app) {
    runCountdown(app, 3, function () {
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
