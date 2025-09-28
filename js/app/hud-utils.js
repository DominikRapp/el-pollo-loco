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
 * Detects if the current browser is Firefox.
 * @returns {boolean}
 */
function isFirefoxBrowser() {
    return /firefox/i.test(navigator.userAgent);
}

/**
 * Determines if the environment is mobile-like.
 * @returns {boolean}
 */
function isMobileLikeContext() {
    const isTouch = navigator.maxTouchPoints > 0;
    const mqCoarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const smallViewport = window.innerWidth < 900 || window.innerHeight < 700;
    return isTouch || mqCoarse || smallViewport;
}

/**
 * Applies visibility to the mobile controls element.
 * @param {HTMLElement} element
 * @param {boolean} visible
 * @param {boolean} forceFlex
 * @returns {void}
 */
function applyVisibility(element, visible, forceFlex) {
    element.classList.toggle('is-active', visible);
    if (forceFlex) {
        element.style.display = visible ? 'flex' : 'none';
    } else {
        element.style.removeProperty('display');
    }
}

/**
 * Shows or hides the #mobile-controls wrapper.
 * Firefox limits visibility to mobile-like contexts.
 * @param {object} appInstance
 * @param {boolean} isVisible
 * @returns {void}
 */
function setMobileControlsVisible(appInstance, isVisible) {
    const el = document.getElementById('mobile-controls');
    if (!el) return;
    const show = !!isVisible;
    if (isFirefoxBrowser()) {
        const mobile = isMobileLikeContext();
        applyVisibility(el, show && mobile, true);
        return;
    }
    applyVisibility(el, show, false);
}