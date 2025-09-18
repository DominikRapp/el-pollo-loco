function restartToLevel1(app) {
    app.resetRunTotals();
    app.clearRunOverlayResults();
    app.carryOverEnergy = 100;
    if (app.world && typeof app.world.dispose === 'function') {
        app.world.dispose();
    }
    app.startLevel(0);
}

function attachRestart(app) {
    app.restartToLevel1 = function () { return restartToLevel1(app); };
}
