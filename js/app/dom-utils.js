/**
 * Removes the 'hidden' CSS class from an element to make it visible.
 * No-op if the element is null/undefined.
 * @param {object} app - Application instance (unused, reserved for symmetry)
 * @param {HTMLElement} [element] - Target DOM element
 * @returns {void}
 */
function domShow(app, element) {
    if (element) element.classList.remove('hidden');
}

/**
 * Adds the 'hidden' CSS class to an element to hide it.
 * No-op if the element is null/undefined.
 * @param {object} app - Application instance (unused, reserved for symmetry)
 * @param {HTMLElement} [element] - Target DOM element
 * @returns {void}
 */
function domHide(app, element) {
    if (element) element.classList.add('hidden');
}

/**
 * Attaches simple DOM visibility helpers to the app object.
 * Adds: app.show(element), app.hide(element)
 * @param {object} app - Application instance to extend
 * @returns {void}
 */
function attachDomUtils(app) {
    app.show = function (element) { return domShow(app, element); };
    app.hide = function (element) { return domHide(app, element); };
}