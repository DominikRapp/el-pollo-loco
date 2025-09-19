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

function clearExistingCountdownTimer(app) {
    if (app.cdTimer) {
        clearInterval(app.cdTimer);
        app.cdTimer = null;
    }
}

function invokeCallback(callback) {
    if (typeof callback === 'function') callback();
}

function showCountdownStart(countdownElement, seconds) {
    countdownElement.style.display = 'flex';
    countdownElement.textContent = String(seconds);
}

function playCountdownTickSound() {
    const sfxInstance = window.sfx;
    if (!sfxInstance) return;
    sfxInstance.stop('sys.countdown.tick');
    sfxInstance.play('sys.countdown.tick');
}

function startCountdownInterval(app, countdownElement, seconds, onDone) {
    let remainingSeconds = seconds;
    app.cdTimer = setInterval(function () {
        remainingSeconds -= 1;
        handleCountdownTick(app, countdownElement, remainingSeconds, onDone);
    }, 1000);
}

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

function finishCountdown(app, countdownElement, onDone) {
    countdownElement.style.display = 'none';
    app.cdRunning = false;
    invokeCallback(onDone);
}
