/**
 * Retrieves references to the hamburger UI elements.
 * @param {object} app - Application instance (unused, reserved for symmetry)
 * @returns {{root: HTMLElement|null, button: HTMLElement|null, panel: HTMLElement|null}}
 * Object containing the root container, the toggle button, and the menu panel.
 */
function hamburgerGetElements(app) {
    const root = document.getElementById('hamburger-root');
    const button = document.getElementById('hamburger-button');
    const panel = document.getElementById('hamburger-menu');
    return { root, button, panel };
}

/**
 * Closes the hamburger menu if all required elements exist.
 * Hides the panel, removes the "open" state on the button, and updates aria-expanded.
 * @param {object} app - Application instance with getHamburgerElements()
 * @returns {void}
 */
function hamburgerClose(app) {
    const { root, button, panel } = app.getHamburgerElements();
    if (!root || !button || !panel) { return; }
    panel.classList.add('hidden');
    button.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
}

/**
 * Sets visibility of the hamburger root element.
 * @param {HTMLElement|null} root - Root element of hamburger
 * @param {boolean} visible - Whether root should be visible
 * @returns {void}
 */
function setHamburgerVisibility(root, visible) {
    if (!root) return;
    if (visible) root.classList.remove('hidden');
    else root.classList.add('hidden');
}

/**
 * Shows or hides the hamburger UI and ensures the menu is closed.
 * @param {object} app - Application instance with getHamburgerElements() and closeHamburgerMenu()
 * @param {boolean} visible - Whether the hamburger UI should be visible
 * @returns {void}
 */
function hamburgerShow(app, visible) {
    const { root } = app.getHamburgerElements();
    setHamburgerVisibility(root, visible);
    app.closeHamburgerMenu();
}

/**
 * Attaches hamburger helper methods onto the app instance.
 * Adds:
 *  - app.getHamburgerElements()
 *  - app.closeHamburgerMenu()
 *  - app.showHamburger(visible)
 * @param {object} app - Application instance to extend
 * @returns {void}
 */
function attachHamburgerUtils(app) {
    app.getHamburgerElements = function () { return hamburgerGetElements(app); };
    app.closeHamburgerMenu = function () { return hamburgerClose(app); };
    app.showHamburger = function (visible) { return hamburgerShow(app, visible); };
}