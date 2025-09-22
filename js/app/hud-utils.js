/**
 * Attaches HUD-related helper methods to the app instance.
 * Adds:
 *  - app.setHudLevel(levelNumber)
 *  - app.hideHudLevel()
 *  - app.setMobileControlsVisible(isVisible)
 * @param {object} app - Application instance to extend
 * @returns {void}
 */
function attachHudUtils(app) {
    app.setHudLevel = function (levelNumber) { return setHudLevel(app, levelNumber); };
    app.hideHudLevel = function () { return hideHudLevel(app); };
    app.setMobileControlsVisible = function (isVisible) { return setMobileControlsVisible(app, isVisible); };
}

/**
 * Shows the HUD level indicator and sets its text to "Level X".
 * @param {object} appInstance - Application instance (unused, reserved for symmetry)
 * @param {number} levelNumber - 1-based level number to display
 * @returns {void}
 */
function setHudLevel(appInstance, levelNumber) {
    const element = document.getElementById('hud-level');
    if (!element) return;
    element.textContent = 'Level ' + levelNumber;
    element.style.display = 'block';
}

/**
 * Hides the HUD level indicator, if present.
 * @param {object} appInstance - Application instance (unused, reserved for symmetry)
 * @returns {void}
 */
function hideHudLevel(appInstance) {
    const element = document.getElementById('hud-level');
    if (element) element.style.display = 'none';
}

/**
 * Shows or hides the mobile controls wrapper by toggling the "is-active" class.
 * @param {object} appInstance - Application instance (unused, reserved for symmetry)
 * @param {boolean} isVisible - Whether mobile controls should be visible
 * @returns {void}
 */
function setMobileControlsVisible(appInstance, isVisible) {
    const element = document.getElementById('mobile-controls');
    if (element) element.classList.toggle('is-active', !!isVisible);
}