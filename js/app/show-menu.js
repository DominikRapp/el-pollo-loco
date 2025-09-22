/**
 * Attaches a bound showMenu() method to the app so it can be called without arguments.
 * @param {object} app - Game application object
 */
function attachShowMenu(app) {
    app.showMenu = function () { return showMenu(app); };
}

/**
 * Transitions the app back to the main menu: clears countdown, stops sounds,
 * disposes world, clears intervals, updates UI, and switches music.
 * @param {object} app - Game application object
 */
function showMenu(app) {
    clearCountdownState(app);
    stopCountdownSound();
    disposeWorldIfPossible(app);
    IntervalTracker.clearAll();
    setMenuStateAndUi(app);
    switchToMenuMusic();
}

/**
 * Clears any active countdown timer and hides the countdown element.
 * @param {object} app - Game application object
 */
function clearCountdownState(app) {
    if (app.cdTimer) {
        clearInterval(app.cdTimer);
        app.cdTimer = null;
    }
    app.cdRunning = false;
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    countdownElement.style.display = 'none';
    countdownElement.textContent = '';
}

/**
 * Stops the countdown ticking sound if the SFX system is available.
 */
function stopCountdownSound() {
    const sfxInstance = window.sfx;
    if (sfxInstance) sfxInstance.stop('sys.countdown.tick');
}

/**
 * Disposes the current world if present and a dispose() function exists.
 * @param {object} app - Game application object
 */
function disposeWorldIfPossible(app) {
    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }
}

/**
 * Sets the app state and menu UI: switches to MENU state, hides controls,
 * shows the start screen, and hides the HUD level indicator.
 * @param {object} app - Game application object
 */
function setMenuStateAndUi(app) {
    app.state = GameState.MENU;
    app.showHamburger(false);
    app.setMobileControlsVisible(false);
    const startScreen = document.getElementById('start-screen');
    app.show(startScreen);
    app.hideHudLevel();
}

/**
 * Crossfades music to the menu loop if the SFX system supports it.
 */
function switchToMenuMusic() {
    const sfxInstance = window.sfx;
    if (sfxInstance) sfxInstance.musicTo('music.menu.loop', 500);
}