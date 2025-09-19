function attachRunStats(app) {
    app.collectLevelCounts = function (completed) { return collectLevelCounts(app, completed); };
    app.addLevelResult = function (levelNumber, timeMilliseconds, counts) { return addLevelResult(app, levelNumber, timeMilliseconds, counts); };
    app.resetRunTotals = function () { return resetRunTotals(app); };
    app.clearRunOverlayResults = function () { return clearRunOverlayResults(app); };
}

function collectLevelCounts(app, completed) {
    const stats = app && app.world && app.world.stats ? app.world.stats : {};
    const boss = Number(stats.boss || 0);
    const chicken = Number(stats.chicken || 0);
    const chickenSmall = Number(stats.chickenSmall || 0);
    const bottle = Number(stats.bottle || 0);
    const coin = Number(stats.coin || 0);
    return { levelComplete: completed ? 1 : 0, boss, chicken, chickenSmall, bottle, coin };
}

function addLevelResult(app, levelNumber, timeMilliseconds, counts) {
    app.runResults.push({ level: levelNumber, timeMs: timeMilliseconds, counts });
    app.totalTimeMs += Number(timeMilliseconds || 0);
    app.totalCounts.levelComplete += Number(counts.levelComplete || 0);
    app.totalCounts.boss += Number(counts.boss || 0);
    app.totalCounts.chicken += Number(counts.chicken || 0);
    app.totalCounts.chickenSmall += Number(counts.chickenSmall || 0);
    app.totalCounts.bottle += Number(counts.bottle || 0);
    app.totalCounts.coin += Number(counts.coin || 0);
}

function resetRunTotals(app) {
    app.runResults = [];
    app.totalCounts = { levelComplete: 0, boss: 0, chicken: 0, chickenSmall: 0, bottle: 0, coin: 0 };
    app.totalTimeMs = 0;
}

function clearRunOverlayResults(app) {
    const elementIds = ['go-results', 'victory-results'];
    for (const elementId of elementIds) {
        const element = document.getElementById(elementId);
        if (element) element.innerHTML = '';
    }
}