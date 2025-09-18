function collectLevelCountsFn(app, completed) {
    let boss = 0, chicken = 0, chickenSmall = 0, bottle = 0, coin = 0;
    if (app && app.world && app.world.stats) {
        boss = Number(app.world.stats.boss || 0);
        chicken = Number(app.world.stats.chicken || 0);
        chickenSmall = Number(app.world.stats.chickenSmall || 0);
        bottle = Number(app.world.stats.bottle || 0);
        coin = Number(app.world.stats.coin || 0);
    }
    return { levelComplete: completed ? 1 : 0, boss, chicken, chickenSmall, bottle, coin };
}

function addLevelResultFn(app, level, timeMs, counts) {
    app.runResults.push({ level, timeMs, counts });
    app.totalTimeMs += Number(timeMs || 0);
    app.totalCounts.levelComplete += Number(counts.levelComplete || 0);
    app.totalCounts.boss += Number(counts.boss || 0);
    app.totalCounts.chicken += Number(counts.chicken || 0);
    app.totalCounts.chickenSmall += Number(counts.chickenSmall || 0);
    app.totalCounts.bottle += Number(counts.bottle || 0);
    app.totalCounts.coin += Number(counts.coin || 0);
}

function resetRunTotalsFn(app) {
    app.runResults = [];
    app.totalCounts = { levelComplete: 0, boss: 0, chicken: 0, chickenSmall: 0, bottle: 0, coin: 0 };
    app.totalTimeMs = 0;
}

function clearRunOverlayResultsFn(app) {
    const ids = ['go-results', 'victory-results'];
    for (const id of ids) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    }
}

function attachRunStats(app) {
    app.collectLevelCounts = function (completed) { return collectLevelCountsFn(app, completed); };
    app.addLevelResult = function (level, timeMs, counts) { return addLevelResultFn(app, level, timeMs, counts); };
    app.resetRunTotals = function () { return resetRunTotalsFn(app); };
    app.clearRunOverlayResults = function () { return clearRunOverlayResultsFn(app); };
}
