/**
 * Attaches a helper to reset/hide overlay UI elements on the app object.
 * @param {object} app - Application object to extend
 * @returns {void}
 */
function attachResetOverlays(app) {
    app.resetOverlays = function () { return resetOverlays(app); };
}

/**
 * Hides game-over and victory overlays and their action sections.
 * @param {object} app - Application object (currently unused, kept for symmetry)
 * @returns {void}
 */
function resetOverlays(app) {
    hideOverlaysByIds(['overlay-gameover', 'overlay-youwin']);
    hideActionSections();
}

/**
 * Hides a list of overlay elements by their DOM ids and removes the 'pop-in' class.
 * Safely skips missing elements.
 * @param {string[]} idList - Array of element ids to hide
 * @returns {void}
 */
function hideOverlaysByIds(idList) {
    for (const elementId of idList) {
        const element = document.getElementById(elementId);
        if (!element) continue;
        element.style.display = 'none';
        element.classList.remove('pop-in');
    }
}

/**
 * Hides the action button sections for both game-over and victory states by adding 'hidden'.
 * Safely no-ops if an element is missing.
 * @returns {void}
 */
function hideActionSections() {
    const gameOverActions = document.getElementById('gameover-actions');
    const victoryActions = document.getElementById('victory-actions');
    if (gameOverActions) gameOverActions.classList.add('hidden');
    if (victoryActions) victoryActions.classList.add('hidden');
}