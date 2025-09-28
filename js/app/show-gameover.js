/**
 * Shows the Game Over overlay and orchestrates the reveal flow.
 * @param {object} app - Game application object with state, world, UI hooks, and leaderboard helpers
 */
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

/**
 * Puts the app into GAMEOVER state and stops time/controls suitable for that state.
 * @param {object} app - Game application object
 */
function setGameOverState(app) {
    app.state = GameState.GAMEOVER;
    app.setMobileControlsVisible(false);
    app.stopTimer();
}

/**
 * Disables user control on the current character if available.
 * @param {object} app - Game application object
 */
function disablePlayerControl(app) {
    if (app.world && app.world.character) app.world.character.canControl = false;
}

/**
 * Hides the hamburger UI (root & menu), and resets the toggle button state.
 */
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

/**
 * Stops level/boss music and plays the game-over sting if SFX is present.
 */
function playGameOverSounds() {
    const sfx = window.sfx;
    if (!sfx) return;
    sfx.stop('music.boss.loop');
    sfx.stop('music.level.loop');
    sfx.play('sys.gameover.sting');
}

/**
 * Reveals the Game Over image element with visible styles.
 * @param {HTMLElement} imageElement - Image element to show
 */
function showGameOverImage(imageElement) {
    imageElement.classList.remove('hidden');
    imageElement.style.display = 'block';
    imageElement.style.opacity = '1';
    imageElement.style.transform = 'translate(-50%, -50%) scale(1)';
}

/**
 * Hides the actions container instantly.
 * @param {HTMLElement} actionsElement - Actions container element
 */
function hideActions(actionsElement) {
    actionsElement.classList.add('hidden');
}

/**
 * Waits a fixed delay, then finishes the reveal (hide image, freeze world, show actions).
 * @param {object} app - Game application object
 * @param {HTMLElement} imageElement - Game Over image element
 * @param {HTMLElement} actionsElement - Actions container element
 */
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

/**
 * Finalizes the Game Over sequence: hide image, freeze world, show actions, switch music, wire restart.
 * @param {object} app - Game application object
 * @param {HTMLElement} imageElement - Game Over image element
 * @param {HTMLElement} actionsElement - Actions container element
 */
function finishGameOverReveal(app, imageElement, actionsElement) {
    hideGameOverImage(imageElement);
    freezeWorldIfAvailable(app);
    showActions(app, actionsElement);
    switchToMenuMusic();
    wireGameOverRestartButton(app, actionsElement);
}

/**
 * Hides the Game Over image element with hidden styles.
 * @param {HTMLElement} imageElement - Image element to hide
 */
function hideGameOverImage(imageElement) {
    imageElement.classList.add('hidden');
    imageElement.style.display = 'none';
    imageElement.style.opacity = '0';
    imageElement.style.transform = 'translate(-50%, -50%) scale(0.6)';
}

/**
 * Freezes the world if present by enabling freeze flag and invoking freezeAll() if provided.
 * @param {object} app - Game application object
 */
function freezeWorldIfAvailable(app) {
    if (!app.world) return;
    app.world.canFreezeNow = true;
    if (typeof app.world.freezeAll === 'function') app.world.freezeAll();
}

/**
 * Shows actions UI, records the level result, and renders intermediate/final leaderboard views.
 * @param {object} app - Game application object
 * @param {HTMLElement} actionsElement - Actions container element
 */
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

/**
 * Ensures there is a #go-results container inside the overlay box to render results into.
 * @param {HTMLElement} actionsElement - Actions container element
 */
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

/**
 * Crossfades/changes music to the menu loop if the SFX API supports it.
 */
function switchToMenuMusic() {
    const sfx = window.sfx;
    if (sfx && typeof sfx.musicTo === 'function') sfx.musicTo('music.menu.loop', 500);
}

/**
 * Wires the Restart button click handler.
 * @param {object} app
 * @param {HTMLElement} actionsElement
 * @returns {void}
 */
function wireGameOverRestartButton(app, actionsElement) {
    const restartButton = document.getElementById('btn-restart');
    if (!restartButton) return;
    restartButton.onclick = function () { handleGameOverRestart(app, actionsElement); };
}

/**
 * Handles the Game Over restart action.
 * @param {object} app
 * @param {HTMLElement} actionsElement
 * @returns {void}
 */
function handleGameOverRestart(app, actionsElement) {
    actionsElement.classList.add('hidden');
    IntervalTracker.clearAll();
    app.carryOverEnergy = 100;
    app.restartToLevel1();
}