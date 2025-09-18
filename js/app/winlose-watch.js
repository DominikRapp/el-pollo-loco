function loopWinLoseWatch(app) {
    if (app.state !== GameState.GAME || !app.world || app.stoppedForWinOrLose) return;

    if (app.world.gameOver === true) {
        app.stoppedForWinOrLose = true;
        app.stopTimer();
        showGameOver(app);
        return;
    }

    const boss = app.world.boss;
    const bossReady = !!(boss && boss.isDead && boss.isDead() && boss.deathAnimFinished === true);
    const bottlesClear = !app.world.throwableObjects || app.world.throwableObjects.every(b => b.markForRemoval || !b.isSplashing);

    if (bossReady && bottlesClear) {
        app.stoppedForWinOrLose = true;
        app.stopTimer();
        if (app.world) app.world.canFreezeNow = true;
        if (app.world && typeof app.world.freezeAll === 'function') app.world.freezeAll();
        showYouWin(app);
        return;
    }

    setTimeout(() => app.loopWinLoseWatch(), 120);
}

function attachWinLoseWatch(app) {
    app.loopWinLoseWatch = function () { return loopWinLoseWatch(app); };
}
