function loopWinLoseWatch(app) {
    if (shouldExitWinLoseWatch(app)) return;
    if (isWorldGameOver(app)) { handleGameOver(app); return; }
    if (isVictoryConditionMet(app)) { handleVictory(app); return; }
    scheduleNextWinLoseCheck(app);
}

function shouldExitWinLoseWatch(app) {
    const notInGame = app.state !== GameState.GAME;
    const noWorld = !app.world;
    const alreadyStopped = app.stoppedForWinOrLose;
    return notInGame || noWorld || alreadyStopped;
}

function isWorldGameOver(app) {
    return app.world && app.world.gameOver === true;
}

function handleGameOver(app) {
    app.stoppedForWinOrLose = true;
    app.stopTimer();
    if (app.world) app.world.canFreezeNow = true;
    showGameOver(app);
}

function isVictoryConditionMet(app) {
    return isBossReady(app) && areBottlesCleared(app);
}

function isBossReady(app) {
    const boss = app.world ? app.world.boss : null;
    const hasBoss = !!boss;
    const canReportDeath = hasBoss && boss.isDead;
    const isDeadNow = canReportDeath && boss.isDead();
    const deathAnimDone = hasBoss && boss.deathAnimFinished === true;
    return hasBoss && isDeadNow && deathAnimDone;
}

function areBottlesCleared(app) {
    const items = app.world ? app.world.throwableObjects : null;
    if (!items) return true;
    return items.every(function (item) {
        const marked = item.markForRemoval;
        const notSplashing = !item.isSplashing;
        return marked || notSplashing;
    });
}

function handleVictory(app) {
    app.stoppedForWinOrLose = true;
    app.stopTimer();
    if (app.world) app.world.canFreezeNow = true;
    if (app.world && typeof app.world.freezeAll === 'function') app.world.freezeAll();
    showYouWin(app);
}

function scheduleNextWinLoseCheck(app) {
    setTimeout(function () { app.loopWinLoseWatch(); }, 120);
}

function attachWinLoseWatch(app) {
    app.loopWinLoseWatch = function () { return loopWinLoseWatch(app); };
}
