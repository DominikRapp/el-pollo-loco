/**
 * Builds and returns the instructions pages markup/data using the template.
 * @returns {*} The value returned by instructionsPagesTemplate()
 */
function buildInstructionsPages() {
    return instructionsPagesTemplate();
}

/**
 * Attaches an instructions builder helper to the app instance.
 * Adds: app.buildInstructionsPages()
 * @param {object} app - Application instance to extend
 * @returns {void}
 */
function attachInstructionsPages(app) {
    app.buildInstructionsPages = function () { return buildInstructionsPages(); };
}