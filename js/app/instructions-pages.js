function buildInstructionsPages() {
    return instructionsPagesTemplate();
}

function attachInstructionsPages(app) {
    app.buildInstructionsPages = function () { return buildInstructionsPages(); };
}