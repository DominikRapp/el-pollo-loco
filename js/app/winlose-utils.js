/**
 * Hides a given DOM element by adding a "hidden" class, removing any "pop-in"
 * class, and setting display to none.
 * @param {HTMLElement|null} element - The element to hide (no-op if null/undefined)
 * @returns {void}
 */
function hideElement(element) {
    if (!element) return;
    element.classList.add('hidden');
    element.style.display = 'none';
    element.classList.remove('pop-in');
}

/**
 * Internal helper to hide both win and lose overlays and their action panels.
 * @param {object} app - The application context
 * @returns {void}
 */
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

/**
 * Public wrapper to hide all win/lose overlays.
 * @param {object} app - The application context
 * @returns {void}
 */
function hideWinLoseOverlays(app) {
    hideWinLoseOverlaysInternal(app);
}

/**
 * Suppresses win/lose overlays and hides any currently visible ones.
 * Sets a flag so future overlay shows are ignored until restored.
 * @param {object} app - The application context
 * @returns {void}
 */
function suppressWinLoseAndHide(app) {
    app.suppressWinLoseOverlay = true;
    hideWinLoseOverlaysInternal(app);
}

/**
 * Re-enables overlay display and restores action buttons for the current state.
 * @param {object} app - The application context
 * @returns {void}
 */
function restoreWinLoseActionsOnly(app) {
    if (!app.suppressWinLoseOverlay) return;
    app.suppressWinLoseOverlay = false;
    if (app.state === GameState.GAMEOVER) {
        showElement(document.getElementById('gameover-actions'));
    } else if (app.state === GameState.VICTORY) {
        showElement(document.getElementById('victory-actions'));
    }
}

/**
 * Shows a given DOM element by removing "hidden" and clearing inline display.
 * @param {HTMLElement|null} element - The element to show (no-op if null/undefined)
 * @returns {void}
 */
function showElement(element) {
    if (!element) return;
    element.classList.remove('hidden');
    element.style.display = '';
}

/**
 * Attaches win/lose overlay utilities to the app context:
 * - app.hideWinLoseOverlays()
 * - app.suppressWinLose()
 * - app.restoreWinLoseActionsOnly()
 * @param {object} app - The application context to extend
 * @returns {void}
 */
function attachWinLoseUtils(app) {
    app.hideWinLoseOverlays = function () { hideWinLoseOverlays(app); };
    app.suppressWinLose = function () { suppressWinLoseAndHide(app); };
    app.restoreWinLoseActionsOnly = function () { restoreWinLoseActionsOnly(app); };
}