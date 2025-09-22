/**
 * Starts a specific level by index: resets UI/intervals, builds the world,
 * applies energy, locks control, plays music, and begins after a countdown.
 * @param {object} app - The game application context
 * @param {number} index - Zero-based level index to start
 */
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

/**
 * Stops any active countdown timer and clears the countdown UI.
 * @param {object} app - The game application context
 */
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

/**
 * Resets win/lose overlays and clears all tracked intervals.
 * @param {object} app - The game application context
 */
function resetOverlaysAndIntervals(app) {
    app.suppressWinLoseOverlay = false;
    app.hideWinLoseOverlays();
    IntervalTracker.clearAll();
}

/**
 * Disposes the current world if it exists and has a dispose method.
 * @param {object} app - The game application context
 */
function disposeCurrentWorldIfAny(app) {
    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }
}

/**
 * Creates a level instance using the level factory at the provided index
 * and stores the index as current.
 * @param {object} app - The game application context
 * @param {number} index - Zero-based level index
 * @returns {object} level - The created level object
 * @throws {Error} If the level factory is missing or not callable
 */
function createLevelFromFactory(app, index) {
    app.currentLevelIndex = index;
    const factory = app.levelFactories[app.currentLevelIndex];
    const level = factory();
    return level;
}

/**
 * Hides the start screen overlay if present in the DOM.
 */
function hideStartScreen() {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.classList.add('hidden');
}

/**
 * Resets overlays through the app API and sets the game state to running.
 * @param {object} app - The game application context
 */
function resetAndSetGameState(app) {
    app.resetOverlays();
    app.state = GameState.GAME;
}

/**
 * Creates a new World instance bound to the app canvas/keyboard and level.
 * @param {object} app - The game application context
 * @param {object} level - The level configuration/object
 */
function createWorldWithLevel(app, level) {
    app.world = new World(app.canvas, app.keyboard, level);
}

/**
 * Shows the gameplay UI components appropriate for in-game state.
 * @param {object} app - The game application context
 */
function showGameUi(app) {
    app.showHamburger(true);
    app.setMobileControlsVisible(true);
}

/**
 * Ensures there is a numeric carry-over energy value (defaults to 100).
 * @param {object} app - The game application context
 */
function ensureCarryOverEnergy(app) {
    if (typeof app.carryOverEnergy !== 'number') {
        app.carryOverEnergy = 100;
    }
}

/**
 * Applies the carry-over energy to the player character and updates HUD bar.
 * Value is clamped between 0 and 100.
 * @param {object} app - The game application context
 */
function applyEnergyToCharacter(app) {
    if (app.world && app.world.character) {
        const energy = Math.max(0, Math.min(100, app.carryOverEnergy));
        app.world.character.energy = energy;
        if (app.world.statusBar && typeof app.world.statusBar.setPercentage === 'function') {
            app.world.statusBar.setPercentage(app.world.character.energy);
        }
    }
}

/**
 * Updates the HUD to display the human-friendly level number (1-based).
 * @param {object} app - The game application context
 */
function updateHudLevel(app) {
    app.setHudLevel((app.currentLevelIndex || 0) + 1);
}

/**
 * Temporarily disables character control (e.g., during countdown).
 * @param {object} app - The game application context
 */
function lockCharacterControl(app) {
    if (app.world && app.world.character) {
        app.world.character.canControl = false;
    }
}

/**
 * Starts the level background music with a short fade.
 */
function playLevelMusic() {
    const musicId = 'music.level.loop';
    if (window.sfx) window.sfx.musicTo(musicId, 400);
}

/**
 * Callback invoked when the countdown completes.
 * @callback CountdownDone
 */

/**
 * Starts a 3-second countdown, then enables control, timers, and loop watchers.
 * @param {object} app - The game application context
 */
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

/**
 * Attaches a convenience method app.startLevel(index) bound to this app.
 * @param {object} app - The game application context
 */
function attachStartLevel(app) {
    app.startLevel = function (index) { return startLevel(app, index); };
}