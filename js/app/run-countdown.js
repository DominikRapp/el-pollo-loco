/**
 * Starts a visible countdown. Prevents re-entrancy while a countdown is running.
 * Falls back to invoking onDone immediately if the countdown element is missing.
 * @param {object} app - App object with state fields (cdRunning, cdTimer) and optional __cdRafId
 * @param {number} seconds - Number of whole seconds to count down from
 * @param {Function} [onDone] - Callback invoked when the countdown finishes
 * @returns {void}
 */
function runCountdown(app, seconds, onDone) {
    if (app.cdRunning) return;
    app.cdRunning = true;
    clearExistingCountdownTimer(app);
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) {
        app.cdRunning = false;
        invokeCallback(onDone);
        return;
    }
    showCountdownStart(countdownElement, seconds);
    playCountdownTickSound();
    startCountdownInterval(app, countdownElement, seconds, onDone);
}

/**
 * Clears a previously running countdown interval, if any.
 * @param {object} app - App object containing cdTimer
 * @returns {void}
 */
function clearExistingCountdownTimer(app) {
    if (app.cdTimer) {
        clearInterval(app.cdTimer);
        app.cdTimer = null;
    }
}

/**
 * Safely invokes a callback if it is a function.
 * @param {Function} [callback] - Optional function to invoke
 * @returns {void}
 */
function invokeCallback(callback) {
    if (typeof callback === 'function') callback();
}

/**
 * Shows the countdown element and sets its initial text to the starting seconds.
 * @param {HTMLElement} countdownElement - The DOM element displaying the countdown
 * @param {number} seconds - Starting seconds to display
 * @returns {void}
 */
function showCountdownStart(countdownElement, seconds) {
    countdownElement.style.display = 'flex';
    countdownElement.textContent = String(seconds);
}

/**
 * Plays a countdown tick sound using the global SFX system if available.
 * @returns {void}
 */
function playCountdownTickSound() {
    const sfxInstance = window.sfx;
    if (!sfxInstance) return;
    sfxInstance.stop('sys.countdown.tick');
    sfxInstance.play('sys.countdown.tick');
}

/**
 * Begins the interval that updates the countdown once per second.
 * @param {object} app - App object to store the interval id in app.cdTimer
 * @param {HTMLElement} countdownElement - The DOM element displaying the countdown
 * @param {number} seconds - Total seconds to count down
 * @param {Function} [onDone] - Callback invoked when the countdown completes
 * @returns {void}
 */
function startCountdownInterval(app, countdownElement, seconds, onDone) {
    let remainingSeconds = seconds;
    app.cdTimer = setInterval(function () {
        remainingSeconds -= 1;
        handleCountdownTick(app, countdownElement, remainingSeconds, onDone);
    }, 1000);
}

/**
 * Handles each tick of the countdown, updating text and completing when it reaches zero.
 * @param {object} app - App object containing cdTimer
 * @param {HTMLElement} countdownElement - Countdown display element
 * @param {number} remainingSeconds - Seconds remaining after this tick
 * @param {Function} [onDone] - Callback invoked after the final short "Go!" display
 * @returns {void}
 */
function handleCountdownTick(app, countdownElement, remainingSeconds, onDone) {
    if (remainingSeconds > 0) {
        countdownElement.textContent = String(remainingSeconds);
        return;
    }
    countdownElement.textContent = 'Go!';
    clearInterval(app.cdTimer);
    app.cdTimer = null;
    setTimeout(function () {
        finishCountdown(app, countdownElement, onDone);
    }, 600);
}

/**
 * Finalizes the countdown: hides the element, clears running state, and invokes callback.
 * @param {object} app - App object with cdRunning flag
 * @param {HTMLElement} countdownElement - Countdown display element
 * @param {Function} [onDone] - Callback to invoke after finishing
 * @returns {void}
 */
function finishCountdown(app, countdownElement, onDone) {
    countdownElement.style.display = 'none';
    app.cdRunning = false;
    invokeCallback(onDone);
}

/**
 * Immediately stops any active countdown and hides the countdown element.
 * Also cancels a pending animation frame id stored at app.__cdRafId and stops countdown sounds (if available).
 * @param {object} app - App object with cdRunning, __cdRafId
 * @returns {void}
 */
function stopCountdown(app) {
    app.cdRunning = false;
    if (app.__cdRafId) cancelAnimationFrame(app.__cdRafId);
    app.__cdRafId = null;
    const el = document.getElementById('countdown');
    if (el) el.classList.add('hidden');
    if (typeof stopCountdownSound === 'function') stopCountdownSound();
}