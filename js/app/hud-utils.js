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
 * Shows or hides the #mobile-controls wrapper.
 * - Always toggles the "is-active" class based on the desired visibility.
 * - In Firefox, visibility is additionally limited to “mobile-like” contexts
 *   (touch/coarse pointer or small viewport), and the inline style
 *   display is set to "flex" or "none".
 * @param {object} appInstance - Application instance (currently unused)
 * @param {boolean} isVisible - Desired visibility of the mobile controls
 * @returns {void}
 */
function setMobileControlsVisible(appInstance, isVisible) {
    const element = document.getElementById('mobile-controls');
    if (!element) return;
    const isFirefox = /firefox/i.test(navigator.userAgent);
    const wantsVisible = !!isVisible;
    if (isFirefox) {
        const isTouch = navigator.maxTouchPoints > 0;
        const mqCoarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        const smallViewport = window.innerWidth < 900 || window.innerHeight < 700;
        const isMobileLike = isTouch || mqCoarse || smallViewport;
        const show = wantsVisible && isMobileLike;
        element.classList.toggle('is-active', show);
        element.style.display = show ? 'flex' : 'none';
        return;
    }
    element.classList.toggle('is-active', wantsVisible);
}