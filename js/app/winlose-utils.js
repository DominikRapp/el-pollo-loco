function hideElement(element) {
    if (!element) return;
    element.classList.add('hidden');
    element.style.display = 'none';
    element.classList.remove('pop-in');
}

function hideWinLoseOverlaysInternal(app) {
    const gameOverImage = document.getElementById('overlay-gameover');
    const victoryImage = document.getElementById('overlay-youwin');
    const gameOverActions = document.getElementById('gameover-actions');
    const victoryActions = document.getElementById('victory-actions');
    hideElement(gameOverImage);
    hideElement(victoryImage);
    hideElement(gameOverActions);
    hideElement(victoryActions);
}

function hideWinLoseOverlays(app) {
    hideWinLoseOverlaysInternal(app);
}

function suppressWinLoseAndHide(app) {
    app.suppressWinLoseOverlay = true;
    hideWinLoseOverlaysInternal(app);
}

function restoreWinLoseActionsOnly(app) {
    if (!app.suppressWinLoseOverlay) return;
    app.suppressWinLoseOverlay = false;
    if (app.state === GameState.GAMEOVER) {
        const actions = document.getElementById('gameover-actions');
        if (actions) { actions.classList.remove('hidden'); actions.style.display = ''; }
    } else if (app.state === GameState.VICTORY) {
        const actions = document.getElementById('victory-actions');
        if (actions) { actions.classList.remove('hidden'); actions.style.display = ''; }
    }
}

function attachWinLoseUtils(app) {
    app.hideWinLoseOverlays = function () { hideWinLoseOverlays(app); };
    app.suppressWinLose = function () { suppressWinLoseAndHide(app); };
    app.restoreWinLoseActionsOnly = function () { restoreWinLoseActionsOnly(app); };
}
