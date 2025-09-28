/**
 * Starts a new game session from the current level.
 * Orchestrates world cleanup, UI prep, countdown, and game loop start.
 * @param {object} app - The game application context
 */
function startGame(app) {
    clearIntervalsAndDisposeWorld(app);
    hideStartScreen();
    setGameStateToRunning(app);
    createWorldFromCurrentLevel(app);
    setupGameUi(app);
    lockCharacterControl(app);
    beginCountdownThenStart(app);
}

/**
 * Clears all running intervals and disposes the current world if present.
 * @param {object} app - The game application context
 * @throws {Error} If IntervalTracker.clearAll throws
 */
function clearIntervalsAndDisposeWorld(app) {
    IntervalTracker.clearAll();
    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }
}

/**
 * Hides the start screen overlay if it exists in the DOM.
 */
function hideStartScreen() {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.classList.add('hidden');
    }
}

/**
 * Switches the app's state machine to the "game is running" state.
 * @param {object} app - The game application context
 */
function setGameStateToRunning(app) {
    app.state = GameState.GAME;
}

/**
 * Creates a new world instance based on the currently selected level.
 * @param {object} app - The game application context
 * @throws {Error} If the current level factory is missing or invalid
 */
function createWorldFromCurrentLevel(app) {
    const makeLevel = app.levels[app.currentLevelIndex];
    if (typeof makeLevel !== 'function') throw new Error('Invalid level factory');
    const level = makeLevel();
    app.world = new World(app.canvas, app.keyboard, level);
}

/**
 * Enables or disables character control if character exists.
 * @param {object} app - The game application context
 * @param {boolean} isEnabled - Whether control should be enabled
 */
function setCharacterControl(app, isEnabled) {
    if (app.world && app.world.character) app.world.character.canControl = isEnabled;
}

/**
 * Starts game timers/flags and shows timer.
 * @param {object} app - The game application context
 */
function startGameTimers(app) {
    app.timerStart = Date.now();
    app.timerRunning = true;
    app.stoppedForWinOrLose = false;
    app.showTimer(true);
}

/**
 * Starts core game loops (timer + win/lose watch).
 * @param {object} app - The game application context
 */
function startGameLoops(app) {
    app.loopTimer();
    app.loopWinLoseWatch();
}

/**
 * Configures gameplay UI elements (hamburger, mobile controls, HUD level).
 * @param {object} app - The game application context
 */
function setupGameUi(app) {
    app.showHamburger(true);
    app.setMobileControlsVisible(true);
    app.setHudLevel((app.currentLevelIndex || 0) + 1);
}

/**
 * Temporarily disables player character control (e.g., during countdown).
 * @param {object} app - The game application context
 */
function lockCharacterControl(app) {
    if (app.world && app.world.character) {
        app.world.character.canControl = false;
    }
}

/**
 * Runs a 3-second countdown, then enables control, starts timers and loops.
 * @param {object} app - The game application context
 */
function beginCountdownThenStart(app) {
    runCountdown(app, 3, function () {
        setCharacterControl(app, true);
        startGameTimers(app);
        startGameLoops(app);
    });
}