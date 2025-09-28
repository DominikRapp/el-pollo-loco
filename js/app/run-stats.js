/**
 * Attaches run-stat helpers to the app instance.
 * @param {object} app - Game application object to extend
 * @returns {void}
 */
function attachRunStats(app) {
    app.collectLevelCounts = function (completed) { return collectLevelCounts(app, completed); };
    app.addLevelResult = function (levelNumber, timeMilliseconds, counts) { return addLevelResult(app, levelNumber, timeMilliseconds, counts); };
    app.resetRunTotals = function () { return resetRunTotals(app); };
    app.clearRunOverlayResults = function () { return clearRunOverlayResults(app); };
}

/**
 * Collects counters for the current level from the world's stats and marks completion.
 * @param {object} app - Game application object with world.stats
 * @param {boolean} completed - Whether the level was completed (adds levelComplete=1 if true)
 * @returns {{levelComplete:number, boss:number, chicken:number, chickenSmall:number, bottle:number, coin:number}} Counts snapshot
 */
function collectLevelCounts(app, completed) {
    const stats = app && app.world && app.world.stats ? app.world.stats : {};
    const boss = Number(stats.boss || 0);
    const chicken = Number(stats.chicken || 0);
    const chickenSmall = Number(stats.chickenSmall || 0);
    const bottle = Number(stats.bottle || 0);
    const coin = Number(stats.coin || 0);
    return { levelComplete: completed ? 1 : 0, boss, chicken, chickenSmall, bottle, coin };
}

/**
 * Appends a finished level result and updates aggregate totals.
 * @param {object} app
 * @param {number} levelNumber
 * @param {number} timeMilliseconds
 * @param {{levelComplete?:number,boss?:number,chicken?:number,chickenSmall?:number,bottle?:number,coin?:number}} counts
 * @returns {void}
 */
function addLevelResult(app, levelNumber, timeMilliseconds, counts) {
    pushRunResult(app, levelNumber, timeMilliseconds, counts);
    accumulateTotals(app, timeMilliseconds, counts);
}

/**
 * Pushes a single level result into the run list.
 * @param {object} app
 * @param {number} level
 * @param {number} timeMs
 * @param {object} counts
 * @returns {void}
 */
function pushRunResult(app, level, timeMs, counts) {
    app.runResults.push({ level, timeMs, counts });
}

/**
 * Adds time and counters to the aggregate totals.
 * @param {object} app
 * @param {number} timeMs
 * @param {{levelComplete?:number,boss?:number,chicken?:number,chickenSmall?:number,bottle?:number,coin?:number}} c
 * @returns {void}
 */
function accumulateTotals(app, timeMs, c) {
    app.totalTimeMs += Number(timeMs || 0);
    app.totalCounts.levelComplete += Number(c.levelComplete || 0);
    app.totalCounts.boss += Number(c.boss || 0);
    app.totalCounts.chicken += Number(c.chicken || 0);
    app.totalCounts.chickenSmall += Number(c.chickenSmall || 0);
    app.totalCounts.bottle += Number(c.bottle || 0);
    app.totalCounts.coin += Number(c.coin || 0);
}

/**
 * Resets the cumulative run totals and per-level results.
 * @param {object} app - Game application object to mutate
 * @returns {void}
 */
function resetRunTotals(app) {
    app.runResults = [];
    app.totalCounts = { levelComplete: 0, boss: 0, chicken: 0, chickenSmall: 0, bottle: 0, coin: 0 };
    app.totalTimeMs = 0;
}

/**
 * Clears the HTML of overlay result containers for the current run.
 * @param {object} app - Game application object (not used; present for symmetry)
 * @returns {void}
 */
function clearRunOverlayResults(app) {
    const elementIds = ['go-results', 'victory-results'];
    for (const elementId of elementIds) {
        const element = document.getElementById(elementId);
        if (element) element.innerHTML = '';
    }
}