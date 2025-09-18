function hideWinLoseOverlaysImpl(app) {
    const goImg = document.getElementById('overlay-gameover');
    const viImg = document.getElementById('overlay-youwin');
    const goAct = document.getElementById('gameover-actions');
    const viAct = document.getElementById('victory-actions');
    const hideEl = (el) => { if (el) { el.classList.add('hidden'); el.style.display = 'none'; el.classList.remove('pop-in'); } };
    hideEl(goImg);
    hideEl(viImg);
    hideEl(goAct);
    hideEl(viAct);
}

function attachWinLoseUtils(app) {
    app.hideWinLoseOverlays = function () { hideWinLoseOverlaysImpl(app); };
    app.suppressWinLose = function () {
        app.suppressWinLoseOverlay = true;
        hideWinLoseOverlaysImpl(app);
    };
    app.restoreWinLoseActionsOnly = function () {
        if (!app.suppressWinLoseOverlay) return;
        app.suppressWinLoseOverlay = false;
        if (app.state === GameState.GAMEOVER) {
            const actions = document.getElementById('gameover-actions');
            if (actions) { actions.classList.remove('hidden'); actions.style.display = ''; }
        } else if (app.state === GameState.VICTORY) {
            const actions = document.getElementById('victory-actions');
            if (actions) { actions.classList.remove('hidden'); actions.style.display = ''; }
        }
    };
}
