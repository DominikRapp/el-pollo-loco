function showYouWin(app) {
    setVictoryState(app);
    if (app.world && app.world.character) app.world.character.canControl = false;
    const imageElement = document.getElementById('overlay-youwin');
    const actionsElement = document.getElementById('victory-actions');
    const nextButton = document.getElementById('btn-next');
    const homeButton = document.getElementById('btn-home');
    const restartButton = document.getElementById('btn-restart-win');
    if (!imageElement || !actionsElement) return;
    waitUntilCalm(app, function () {
        startWinAfterCalm(app, imageElement, actionsElement, nextButton, homeButton, restartButton);
    });
}

function startWinAfterCalm(app, imageElement, actionsElement, nextButton, homeButton, restartButton) {
    freezeWorldIfAvailable(app);
    setupWinButtonsVisibility(app, nextButton, homeButton);
    actionsElement.classList.add('hidden');
    playVictorySounds();
    showWinImage(imageElement);
    scheduleWinReveal(app, imageElement, actionsElement, nextButton, homeButton, restartButton);
}

function setVictoryState(app) {
    app.state = GameState.VICTORY;
    app.setMobileControlsVisible(false);
    app.showHamburger(false);
    app.stopTimer();
}

function waitUntilCalm(app, callback) {
    function poll() {
        if (isBossAnimationDone(app) && areBottlesCalm(app)) {
            setTimeout(callback, 150);
            return;
        }
        setTimeout(poll, 80);
    }
    poll();
}

function isBossAnimationDone(app) {
    if (!app.world || !app.world.boss) return true;
    return app.world.boss.deathAnimFinished === true;
}

function areBottlesCalm(app) {
    const list = (app.world && app.world.throwableObjects) ? app.world.throwableObjects : [];
    for (const bottleObject of list) {
        const moving = bottleObject.isSplashing || bottleObject.moveInterval || bottleObject.splashInterval;
        if (!bottleObject.markForRemoval && moving) return false;
    }
    return true;
}

function freezeWorldIfAvailable(app) {
    if (!app.world) return;
    if (typeof app.world.freezeAll === 'function') app.world.freezeAll();
}

function setupWinButtonsVisibility(app, nextButton, homeButton) {
    if (homeButton) {
        homeButton.classList.remove('hidden');
        homeButton.style.display = '';
    }
    if (!nextButton) return;
    if (app.currentLevelIndex < app.levelFactories.length - 1) nextButton.classList.remove('hidden');
    else nextButton.classList.add('hidden');
}

function playVictorySounds() {
    const sfxInstance = window.sfx;
    if (!sfxInstance) return;
    sfxInstance.stop('music.boss.loop');
    sfxInstance.stop('music.level.loop');
    sfxInstance.play('sys.win.sting');
}

function showWinImage(imageElement) {
    imageElement.classList.remove('hidden');
    imageElement.style.display = 'block';
    imageElement.style.opacity = '1';
    imageElement.style.transform = 'translate(-50%, -50%) scale(1)';
}

function scheduleWinReveal(app, imageElement, actionsElement, nextButton, homeButton, restartButton) {
    const startTime = performance.now();
    const waitMilliseconds = 2000;
    function onFrame(now) {
        if (now - startTime >= waitMilliseconds) {
            finishWinReveal(app, imageElement, actionsElement, nextButton, homeButton, restartButton);
            return;
        }
        requestAnimationFrame(onFrame);
    }
    requestAnimationFrame(onFrame);
}

function finishWinReveal(app, imageElement, actionsElement, nextButton, homeButton, restartButton) {
    hideWinImage(imageElement);
    actionsElement.classList.remove('hidden');
    actionsElement.style.display = '';
    submitWinResults(app, actionsElement);
    switchToMenuMusic();
    wireRestartButton(app, actionsElement, restartButton);
    wireNextButton(app, actionsElement, nextButton);
    wireHomeButton(app, actionsElement, homeButton);
}

function hideWinImage(imageElement) {
    imageElement.classList.add('hidden');
    imageElement.style.display = 'none';
    imageElement.style.opacity = '0';
    imageElement.style.transform = 'translate(-50%, -50%) scale(0.6)';
}

function submitWinResults(app, actionsElement) {
    const summary = buildVictorySummary(app);
    ensureVictoryResultsContainer(actionsElement);
    LeaderboardFlow.showLevelIntermediate({
        containerId: 'victory-results',
        name: summary.playerName,
        level: summary.levelNumber,
        timeMs: summary.timeMilliseconds,
        counts: summary.levelCounts
    });
    LeaderboardFlow.showTotalFinal({
        name: summary.playerName,
        highestLevel: summary.levelNumber,
        totalTimeMs: app.totalTimeMs,
        counts: app.totalCounts
    });
}

function buildVictorySummary(app) {
    const playerName = app.userName || localStorage.getItem('playerName') || 'Player';
    const levelNumber = app.getCurrentLevelNumber();
    const timeMilliseconds = app.lastElapsedMs || 0;
    const levelCounts = app.collectLevelCounts(true);
    app.addLevelResult(levelNumber, timeMilliseconds, levelCounts);
    return { playerName, levelNumber, timeMilliseconds, levelCounts };
}

function ensureVictoryResultsContainer(actionsElement) {
    const boxRoot = actionsElement.querySelector('.overlay-box');
    if (!boxRoot) return;
    let results = boxRoot.querySelector('#victory-results');
    if (results) return;
    results = document.createElement('div');
    results.id = 'victory-results';
    const heading = boxRoot.querySelector('h2');
    if (heading && heading.nextSibling) boxRoot.insertBefore(results, heading.nextSibling);
    else boxRoot.appendChild(results);
}

function switchToMenuMusic() {
    const sfxInstance = window.sfx;
    if (sfxInstance && typeof sfxInstance.musicTo === 'function') {
        sfxInstance.musicTo('music.menu.loop', 500);
    }
}

function wireRestartButton(app, actionsElement, restartButton) {
    if (!restartButton) return;
    restartButton.onclick = function () {
        actionsElement.classList.add('hidden');
        IntervalTracker.clearAll();
        app.carryOverEnergy = 100;
        app.restartToLevel1();
    };
}

function wireNextButton(app, actionsElement, nextButton) {
    if (!nextButton) return;
    nextButton.onclick = function () {
        actionsElement.classList.add('hidden');
        IntervalTracker.clearAll();
        app.carryOverEnergy = (app.world && app.world.character) ? app.world.character.energy : 100;
        app.startLevel(app.currentLevelIndex + 1);
    };
}

function wireHomeButton(app, actionsElement, homeButton) {
    if (!homeButton) return;
    homeButton.onclick = function () {
        actionsElement.classList.add('hidden');
        IntervalTracker.clearAll();
        app.carryOverEnergy = 100;
        app.resetRunTotals();
        app.clearRunOverlayResults();
        app.showMenu();
    };
}
