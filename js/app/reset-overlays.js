function attachResetOverlays(app) {
    app.resetOverlays = function () { return resetOverlays(app); };
}

function resetOverlays(app) {
    hideOverlaysByIds(['overlay-gameover', 'overlay-youwin']);
    hideActionSections();
}

function hideOverlaysByIds(idList) {
    for (const elementId of idList) {
        const element = document.getElementById(elementId);
        if (!element) continue;
        element.style.display = 'none';
        element.classList.remove('pop-in');
    }
}

function hideActionSections() {
    const gameOverActions = document.getElementById('gameover-actions');
    const victoryActions = document.getElementById('victory-actions');
    if (gameOverActions) gameOverActions.classList.add('hidden');
    if (victoryActions) victoryActions.classList.add('hidden');
}
