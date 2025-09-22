/**
 * Handles navigation back to the home/menu screen:
 * prevents default navigation, clears run data/overlays, and shows the main menu.
 * @param {object} app - The application context
 * @param {Event|MouseEvent} [event] - Optional triggering event to prevent default
 * @returns {void}
 */
function handleGoHome(app, event) {
    if (event) event.preventDefault();
    app.resetRunTotals();
    app.clearRunOverlayResults();
    app.resetOverlays();
    app.hideWinLoseOverlays();
    app.showMenu();
}

/**
 * Wires up "Go Home" actions for all relevant UI elements.
 * Attaches click handlers that route through handleGoHome(app, ev).
 * No-op if elements are missing.
 * @param {object} app - The application context
 * @returns {void}
 */
function wireHomeActions(app) {
    const buttonGoFromGame = document.getElementById('btn-home-go');
    const buttonHome = document.getElementById('btn-home');
    const menuHome = document.getElementById('menu-home');
    const handler = function (ev) { handleGoHome(app, ev); };
    if (buttonGoFromGame) buttonGoFromGame.addEventListener('click', handler);
    if (menuHome) menuHome.addEventListener('click', handler);
    if (buttonHome) buttonHome.addEventListener('click', handler);
}