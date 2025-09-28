/**
 * Shows the "You Win" overlay after ensuring the scene is calm and wires all actions.
 * @param {object} app - Game application object
 */
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

/**
 * Begins the win sequence once the scene is calm: freeze world, set UI, play sounds, show image, schedule reveal.
 * @param {object} app - Game application object
 * @param {HTMLElement} imageElement - The "You Win" overlay image element
 * @param {HTMLElement} actionsElement - The actions container element
 * @param {HTMLElement|null} nextButton - Next level button (may be null)
 * @param {HTMLElement|null} homeButton - Home/menu button (may be null)
 * @param {HTMLElement|null} restartButton - Restart button (may be null)
 */
function startWinAfterCalm(app, imageElement, actionsElement, nextButton, homeButton, restartButton) {
    freezeWorldIfAvailable(app);
    setupWinButtonsVisibility(app, nextButton, homeButton);
    actionsElement.classList.add('hidden');
    playVictorySounds();
    showWinImage(imageElement);
    scheduleWinReveal(app, imageElement, actionsElement, nextButton, homeButton, restartButton);
}

/**
 * Sets the app into VICTORY state and hides gameplay UI.
 * @param {object} app - Game application object
 */
function setVictoryState(app) {
    app.state = GameState.VICTORY;
    app.setMobileControlsVisible(false);
    app.showHamburger(false);
    app.stopTimer();
}

/**
 * Polls until boss death animation is done and throwable items are settled, then calls the callback.
 * @param {object} app - Game application object
 * @param {Function} callback - Function to invoke once calm
 */
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

/**
 * Checks whether the boss death animation has finished (or no boss exists).
 * @param {object} app - Game application object
 * @returns {boolean} True if boss is done or absent
 */
function isBossAnimationDone(app) {
    if (!app.world || !app.world.boss) return true;
    return app.world.boss.deathAnimFinished === true;
}

/**
 * Verifies that thrown bottle objects are no longer moving or splashing.
 * @param {object} app - Game application object
 * @returns {boolean} True if all bottles are calm
 */
function areBottlesCalm(app) {
    const list = (app.world && app.world.throwableObjects) ? app.world.throwableObjects : [];
    for (const bottleObject of list) {
        const moving = bottleObject.isSplashing || bottleObject.moveInterval || bottleObject.splashInterval;
        if (!bottleObject.markForRemoval && moving) return false;
    }
    return true;
}

/**
 * Freezes the game world if available by invoking freezeAll() when present.
 * @param {object} app - Game application object
 */
function freezeWorldIfAvailable(app) {
    if (!app.world) return;
    if (typeof app.world.freezeAll === 'function') app.world.freezeAll();
}

/**
 * Controls the visibility of "Next" and "Home" buttons based on progression.
 * @param {object} app - Game application object
 * @param {HTMLElement|null} nextButton - Next level button (may be null)
 * @param {HTMLElement|null} homeButton - Home/menu button (may be null)
 */
function setupWinButtonsVisibility(app, nextButton, homeButton) {
    if (homeButton) {
        homeButton.classList.remove('hidden');
        homeButton.style.display = '';
    }
    if (!nextButton) return;
    if (app.currentLevelIndex < app.levelFactories.length - 1) nextButton.classList.remove('hidden');
    else nextButton.classList.add('hidden');
}

/**
 * Stops gameplay music and plays the win sting if SFX is present.
 */
function playVictorySounds() {
    const sfxInstance = window.sfx;
    if (!sfxInstance) return;
    sfxInstance.stop('music.boss.loop');
    sfxInstance.stop('music.level.loop');
    sfxInstance.play('sys.win.sting');
}

/**
 * Reveals the win image with visible styles.
 * @param {HTMLElement} imageElement - The "You Win" overlay image element
 */
function showWinImage(imageElement) {
    imageElement.classList.remove('hidden');
    imageElement.style.display = 'block';
    imageElement.style.opacity = '1';
    imageElement.style.transform = 'translate(-50%, -50%) scale(1)';
}

/**
 * After a short delay, finishes the win reveal and wires buttons.
 * @param {object} app - Game application object
 * @param {HTMLElement} imageElement - "You Win" image element
 * @param {HTMLElement} actionsElement - Actions container element
 * @param {HTMLElement|null} nextButton - Next level button (may be null)
 * @param {HTMLElement|null} homeButton - Home button (may be null)
 * @param {HTMLElement|null} restartButton - Restart button (may be null)
 */
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

/**
 * Finalizes the win sequence: hide image, show actions, submit results, switch music, and wire buttons.
 * @param {object} app - Game application object
 * @param {HTMLElement} imageElement - "You Win" image element
 * @param {HTMLElement} actionsElement - Actions container element
 * @param {HTMLElement|null} nextButton - Next level button (may be null)
 * @param {HTMLElement|null} homeButton - Home button (may be null)
 * @param {HTMLElement|null} restartButton - Restart button (may be null)
 */
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

/**
 * Hides the win image with hidden styles.
 * @param {HTMLElement} imageElement - The "You Win" overlay image element
 */
function hideWinImage(imageElement) {
    imageElement.classList.add('hidden');
    imageElement.style.display = 'none';
    imageElement.style.opacity = '0';
    imageElement.style.transform = 'translate(-50%, -50%) scale(0.6)';
}

/**
 * Builds the victory summary, records the level result, and renders leaderboard views.
 * @param {object} app - Game application object
 * @param {HTMLElement} actionsElement - Actions container element
 * @returns {void}
 */
function submitWinResults(app, actionsElement) {
    const s = buildVictorySummary(app);
    addLevelResultFromSummary(app, s);
    ensureVictoryResultsContainer(actionsElement);
    LeaderboardFlow.showLevelIntermediate({ containerId: 'victory-results', name: s.playerName, level: s.levelNumber, timeMs: s.timeMilliseconds, counts: s.levelCounts });
    LeaderboardFlow.showTotalFinal({ name: s.playerName, highestLevel: s.levelNumber, totalTimeMs: app.totalTimeMs, counts: app.totalCounts });
}

/**
 * Adds the level result to the run using a summary.
 * @param {object} app - Game application object
 * @param {{levelNumber:number,timeMilliseconds:number,levelCounts:object}} s - Summary
 * @returns {void}
 */
function addLevelResultFromSummary(app, s) {
    app.addLevelResult(s.levelNumber, s.timeMilliseconds, s.levelCounts);
}

/**
 * Builds victory summary data (no side effects).
 * @param {object} app - Game application object
 * @returns {{playerName:string, levelNumber:number, timeMilliseconds:number, levelCounts:object}}
 */
function buildVictorySummary(app) {
    const playerName = app.userName || localStorage.getItem('playerName') || 'Player';
    const levelNumber = app.getCurrentLevelNumber();
    const timeMilliseconds = app.lastElapsedMs || 0;
    const levelCounts = app.collectLevelCounts(true);
    return { playerName, levelNumber, timeMilliseconds, levelCounts };
}

/**
 * Ensures there is a #victory-results container inside the overlay box to render results into.
 * @param {HTMLElement} actionsElement - Actions container element
 */
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

/**
 * Crossfades/changes music to the menu loop if supported by the SFX API.
 */
function switchToMenuMusic() {
    const sfxInstance = window.sfx;
    if (sfxInstance && typeof sfxInstance.musicTo === 'function') {
        sfxInstance.musicTo('music.menu.loop', 500);
    }
}

/**
 * Wires the Restart button: hides UI, clears intervals, resets energy, restarts to level 1.
 * @param {object} app - Game application object
 * @param {HTMLElement} actionsElement - Actions container element
 * @param {HTMLElement|null} restartButton - Restart button (may be null)
 */
function wireRestartButton(app, actionsElement, restartButton) {
    if (!restartButton) return;
    restartButton.onclick = function () {
        actionsElement.classList.add('hidden');
        IntervalTracker.clearAll();
        app.carryOverEnergy = 100;
        app.restartToLevel1();
    };
}

/**
 * Wires the Next button: hides UI, clears intervals, carries over current energy, starts the next level.
 * @param {object} app - Game application object
 * @param {HTMLElement} actionsElement - Actions container element
 * @param {HTMLElement|null} nextButton - Next button (may be null)
 */
function wireNextButton(app, actionsElement, nextButton) {
    if (!nextButton) return;
    nextButton.onclick = function () {
        actionsElement.classList.add('hidden');
        IntervalTracker.clearAll();
        app.carryOverEnergy = (app.world && app.world.character) ? app.world.character.energy : 100;
        app.startLevel(app.currentLevelIndex + 1);
    };
}

/**
 * Wires the Home button: hides UI, clears intervals, resets energy/totals, and shows the menu.
 * @param {object} app - Game application object
 * @param {HTMLElement} actionsElement - Actions container element
 * @param {HTMLElement|null} homeButton - Home button (may be null)
 */
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