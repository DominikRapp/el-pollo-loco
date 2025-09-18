function showMenu(app) {
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
    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }
    IntervalTracker.clearAll();
    app.state = GameState.MENU;
    app.showHamburger(false);
    app.setMobileControlsVisible(false);
    const startScreen = document.getElementById('start-screen');
    app.show(startScreen);
    app.hideHudLevel();
    if (window.sfx) window.sfx.musicTo('music.menu.loop', 500);
}

function attachShowMenu(app) {
    app.showMenu = function () { return showMenu(app); };
}
