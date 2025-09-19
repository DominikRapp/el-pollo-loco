function attachShowMenu(app) {
    app.showMenu = function () { return showMenu(app); };
}

function showMenu(app) {
    clearCountdownState(app);
    stopCountdownSound();
    disposeWorldIfPossible(app);
    IntervalTracker.clearAll();
    setMenuStateAndUi(app);
    switchToMenuMusic();
}

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

function stopCountdownSound() {
    const sfxInstance = window.sfx;
    if (sfxInstance) sfxInstance.stop('sys.countdown.tick');
}

function disposeWorldIfPossible(app) {
    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }
}

function setMenuStateAndUi(app) {
    app.state = GameState.MENU;
    app.showHamburger(false);
    app.setMobileControlsVisible(false);
    const startScreen = document.getElementById('start-screen');
    app.show(startScreen);
    app.hideHudLevel();
}

function switchToMenuMusic() {
    const sfxInstance = window.sfx;
    if (sfxInstance) sfxInstance.musicTo('music.menu.loop', 500);
}