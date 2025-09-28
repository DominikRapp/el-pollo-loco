/**
 * Shows or hides the HUD timer element.
 * @param {object} app - The application context
 * @param {boolean} isVisible - Whether the timer should be visible
 * @returns {void}
 */
function showTimerElement(app, isVisible) {
    const timerElement = document.getElementById('hud-timer');
    if (!timerElement) return;
    timerElement.style.display = isVisible ? 'block' : 'none';
}


/**
 * Updates the timer while running and schedules the next frame.
 * @param {object} app - The application context
 * @returns {void}
 */
function runTimerLoop(app) {
    if (!app.timerRunning) return;
    updateTimerText(app);
    scheduleNextTimerFrame(app);
}

/**
 * Updates the HUD timer text using elapsed time since app.timerStart.
 * @param {object} app - The application context
 * @returns {void}
 */
function updateTimerText(app) {
    const el = document.getElementById('hud-timer');
    if (el) el.textContent = app.formatMs(Date.now() - app.timerStart);
}

/**
 * Requests the next timer frame and loops via app.loopTimer().
 * @param {object} app - The application context
 * @returns {void}
 */
function scheduleNextTimerFrame(app) {
    requestAnimationFrame(function () { app.loopTimer(); });
}

/**
 * Stops the running timer, hides the HUD timer and records the last elapsed ms.
 * @param {object} app - The application context
 * @returns {void}
 */
function stopTimer(app) {
    app.timerRunning = false;
    app.showTimer(false);
    app.lastElapsedMs = Date.now() - app.timerStart;
}

/**
 * Attaches timer helpers to the app context:
 * - app.showTimer(isVisible)
 * - app.loopTimer()
 * - app.stopTimer()
 * @param {object} app - The application context to extend
 * @returns {void}
 */
function attachTimer(app) {
    app.showTimer = function (isVisible) { showTimerElement(app, isVisible); };
    app.loopTimer = function () { runTimerLoop(app); };
    app.stopTimer = function () { stopTimer(app); };
}