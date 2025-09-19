function showGameOver(app) {
    setGameOverState(app);
    disablePlayerControl(app);
    hideHamburgerUi();
    const imageElement = document.getElementById('overlay-gameover');
    const actionsElement = document.getElementById('gameover-actions');
    if (!imageElement || !actionsElement) return;
    playGameOverSounds();
    showGameOverImage(imageElement);
    hideActions(actionsElement);
    scheduleGameOverReveal(app, imageElement, actionsElement);
}

function setGameOverState(app) {
    app.state = GameState.GAMEOVER;
    app.setMobileControlsVisible(false);
    app.stopTimer();
}

function disablePlayerControl(app) {
    if (app.world && app.world.character) app.world.character.canControl = false;
}

function hideHamburgerUi() {
    const root = document.getElementById('hamburger-root');
    const button = document.getElementById('hamburger-button');
    const menu = document.getElementById('hamburger-menu');
    if (root) root.classList.add('hidden');
    if (menu) menu.classList.add('hidden');
    if (!button) return;
    button.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
}

function playGameOverSounds() {
    const sfx = window.sfx;
    if (!sfx) return;
    sfx.stop('music.boss.loop');
    sfx.stop('music.level.loop');
    sfx.play('sys.gameover.sting');
}

function showGameOverImage(imageElement) {
    imageElement.classList.remove('hidden');
    imageElement.style.display = 'block';
    imageElement.style.opacity = '1';
    imageElement.style.transform = 'translate(-50%, -50%) scale(1)';
}

function hideActions(actionsElement) {
    actionsElement.classList.add('hidden');
}

function scheduleGameOverReveal(app, imageElement, actionsElement) {
    const startTime = performance.now();
    const waitMilliseconds = 2000;
    function onFrame(now) {
        if (now - startTime >= waitMilliseconds) {
            finishGameOverReveal(app, imageElement, actionsElement);
            return;
        }
        requestAnimationFrame(onFrame);
    }
    requestAnimationFrame(onFrame);
}

function finishGameOverReveal(app, imageElement, actionsElement) {
    hideGameOverImage(imageElement);
    freezeWorldIfAvailable(app);
    showActions(app, actionsElement);
    switchToMenuMusic();
    wireGameOverRestartButton(app, actionsElement);
}

function hideGameOverImage(imageElement) {
    imageElement.classList.add('hidden');
    imageElement.style.display = 'none';
    imageElement.style.opacity = '0';
    imageElement.style.transform = 'translate(-50%, -50%) scale(0.6)';
}

function freezeWorldIfAvailable(app) {
    if (!app.world) return;
    app.world.canFreezeNow = true;
    if (typeof app.world.freezeAll === 'function') app.world.freezeAll();
}

function showActions(app, actionsElement) {
    actionsElement.classList.remove('hidden');
    actionsElement.style.display = '';
    const playerName = app.userName || localStorage.getItem('playerName') || 'Player';
    const levelNumber = app.getCurrentLevelNumber();
    const timeMilliseconds = app.lastElapsedMs || 0;
    const levelCounts = app.collectLevelCounts(false);
    app.addLevelResult(levelNumber, timeMilliseconds, levelCounts);
    ensureGoResultsContainer(actionsElement);
    LeaderboardFlow.showLevelIntermediate({ containerId: 'go-results', name: playerName, level: levelNumber, timeMs: timeMilliseconds, counts: levelCounts });
    LeaderboardFlow.showTotalFinal({ name: playerName, highestLevel: levelNumber, totalTimeMs: app.totalTimeMs, counts: app.totalCounts });
}

function ensureGoResultsContainer(actionsElement) {
    const boxRoot = actionsElement.querySelector('.overlay-box');
    if (!boxRoot) return;
    let results = boxRoot.querySelector('#go-results');
    if (results) return;
    results = document.createElement('div');
    results.id = 'go-results';
    const heading = boxRoot.querySelector('h2');
    if (heading && heading.nextSibling) boxRoot.insertBefore(results, heading.nextSibling);
    else boxRoot.appendChild(results);
}

function switchToMenuMusic() {
    const sfx = window.sfx;
    if (sfx && typeof sfx.musicTo === 'function') sfx.musicTo('music.menu.loop', 500);
}

function wireGameOverRestartButton(app, actionsElement) {
    const restartButton = document.getElementById('btn-restart');
    if (!restartButton) return;
    restartButton.onclick = function () {
        actionsElement.classList.add('hidden');
        IntervalTracker.clearAll();
        app.carryOverEnergy = 100;
        app.restartToLevel1();
    };
}
