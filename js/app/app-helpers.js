/**
 * Attaches helper methods to the given app object.
 * Adds: app.getCurrentLevelNumber(), app.getElapsedMs()
 * @param {object} app - The application instance to extend
 */
function attachAppHelpers(app) {
    app.getCurrentLevelNumber = function () { return getCurrentLevelNumber(app); };
    app.getElapsedMs = function () { return getElapsedMilliseconds(app); };
}

/**
 * Returns the 1-based current level number derived from app.currentLevelIndex.
 * Defaults to 1 if the index is missing.
 * @param {object} app - The application instance
 * @returns {number} Current level number (1-based)
 */
function getCurrentLevelNumber(app) {
    const index = app.currentLevelIndex || 0;
    return index + 1;
}

/**
 * Calculates elapsed milliseconds since app.timerStart if the timer is running.
 * Returns 0 when the timer is not running.
 * @param {object} app - The application instance
 * @param {boolean} app.timerRunning - Whether the timer is active
 * @param {number} app.timerStart - Epoch milliseconds when the timer started
 * @returns {number} Elapsed time in milliseconds
 */
function getElapsedMilliseconds(app) {
    if (!app.timerRunning) return 0;
    return Date.now() - app.timerStart;
}