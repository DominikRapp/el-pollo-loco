/**
 * Polls for game-over or victory conditions and reacts accordingly.
 * Exits early if the watch should stop, otherwise schedules the next check.
 * @param {object} app - The application context
 * @returns {void}
 */
function loopWinLoseWatch(app) {
    if (shouldExitWinLoseWatch(app)) return;
    if (isWorldGameOver(app)) { handleGameOver(app); return; }
    if (isVictoryConditionMet(app)) { handleVictory(app); return; }
    scheduleNextWinLoseCheck(app);
}

/**
 * Determines whether the win/lose watcher should stop running.
 * Stops when not in GAME state, no world exists, or already handled a result.
 * @param {object} app - The application context
 * @returns {boolean} True if the watcher should exit
 */
function shouldExitWinLoseWatch(app) {
    const notInGame = app.state !== GameState.GAME;
    const noWorld = !app.world;
    const alreadyStopped = app.stoppedForWinOrLose;
    return notInGame || noWorld || alreadyStopped;
}

/**
 * Checks whether the world has reached a game-over state.
 * @param {object} app - The application context
 * @returns {boolean} True if game over
 */
function isWorldGameOver(app) {
    return app.world && app.world.gameOver === true;
}

/**
 * Handles transition into the Game Over state:
 * sets stop flag, stops timer, freezes world (if available), and shows UI.
 * @param {object} app - The application context
 * @returns {void}
 */
function handleGameOver(app) {
    app.stoppedForWinOrLose = true;
    app.stopTimer();
    if (app.world) app.world.canFreezeNow = true;
    showGameOver(app);
}

/**
 * Returns true when victory conditions are satisfied.
 * @param {object} app - The application context
 * @returns {boolean} True if victory
 */
function isVictoryConditionMet(app) {
    return isBossReady(app) && areBottlesCleared(app);
}

/**
 * Verifies that the boss is dead and its death animation has finished.
 * @param {object} app - The application context
 * @returns {boolean} True if boss is ready for victory
 */
function isBossReady(app) {
    const boss = app.world ? app.world.boss : null;
    const hasBoss = !!boss;
    const canReportDeath = hasBoss && boss.isDead;
    const isDeadNow = canReportDeath && boss.isDead();
    const deathAnimDone = hasBoss && boss.deathAnimFinished === true;
    return hasBoss && isDeadNow && deathAnimDone;
}

/**
 * Ensures no bottle splashes are actively playing, i.e., throwable objects
 * are either marked for removal or not splashing anymore.
 * @param {object} app - The application context
 * @returns {boolean} True if all bottle effects are cleared (or none exist)
 */
function areBottlesCleared(app) {
    const items = app.world ? app.world.throwableObjects : null;
    if (!items) return true;
    return items.every(function (item) {
        const marked = item.markForRemoval;
        const notSplashing = !item.isSplashing;
        return marked || notSplashing;
    });
}

/**
 * Handles transition into the Victory state:
 * sets stop flag, stops timer, freezes world and shows the victory UI.
 * @param {object} app - The application context
 * @returns {void}
 */
function handleVictory(app) {
    app.stoppedForWinOrLose = true;
    app.stopTimer();
    if (app.world) app.world.canFreezeNow = true;
    if (app.world && typeof app.world.freezeAll === 'function') app.world.freezeAll();
    showYouWin(app);
}

/**
 * Schedules the next win/lose check after a short delay.
 * @param {object} app - The application context
 * @returns {void}
 */
function scheduleNextWinLoseCheck(app) {
    setTimeout(function () { app.loopWinLoseWatch(); }, 120);
}

/**
 * Attaches the win/lose watcher to the app context:
 * - app.loopWinLoseWatch()
 * @param {object} app - The application context to extend
 * @returns {void}
 */
function attachWinLoseWatch(app) {
    app.loopWinLoseWatch = function () { return loopWinLoseWatch(app); };
}