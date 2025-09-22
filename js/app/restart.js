/**
 * Restarts the game state to level 1 (index 0).
 * Resets run totals and overlay results, restores energy, disposes current world if present, then starts level 0.
 * @param {object} app - Game application object with resetRunTotals(), clearRunOverlayResults(), startLevel(), and optional world.dispose()
 * @returns {void}
 */
function restartToLevel1(app) {
    app.resetRunTotals();
    app.clearRunOverlayResults();
    app.carryOverEnergy = 100;
    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }
    app.startLevel(0);
}

/**
 * Attaches the restart helper to the app object as app.restartToLevel1().
 * @param {object} app - Game application object to extend
 * @returns {void}
 */
function attachRestart(app) {
    app.restartToLevel1 = function () { return restartToLevel1(app); };
}