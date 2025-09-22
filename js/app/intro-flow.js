/**
 * Puts the app into INTRO state and starts the intro once audio is ready.
 * @param {object} app - Game application object with canvas, ctx, state, and showMenu()
 */
function startIntro(app) {
    app.state = GameState.INTRO;
    beginIntroWhenAudioReady(app);
}

/**
 * Waits until SFX/audio is ready, then begins the intro.
 * @param {object} app - Game application object passed through to beginIntro()
 */
function beginIntroWhenAudioReady(app) {
    if (isSfxReady()) {
        beginIntro(app);
        return;
    }
    registerSfxReadyOnce(function () { beginIntro(app); });
}

/**
 * Checks whether the global SFX system is ready to play sounds.
 * @returns {boolean} True if SFX is ready, otherwise false
 */
function isSfxReady() {
    const sfxInstance = window.sfx;
    if (!sfxInstance) return false;
    if (sfxInstance.ready === true) return true;
    if (sfxInstance.pools && sfxInstance.pools.size > 0) return true;
    return false;
}

/**
 * Subscribes once to the custom "sfx-ready" event and invokes the callback when fired.
 * @param {Function} callback - Function to call once SFX becomes ready
 */
function registerSfxReadyOnce(callback) {
    function onReady() {
        window.removeEventListener('sfx-ready', onReady);
        callback();
    }
    window.addEventListener('sfx-ready', onReady);
}

/**
 * Creates the IntroPepe animation, starts intro music if available, and enters the intro loop.
 * @param {object} app - Game application object with canvas, ctx, and state
 */
function beginIntro(app) {
    app.intro = new IntroPepe(app.canvas.height);
    playIntroMusicIfAvailable();
    loopIntro(app);
}

/**
 * Stops any currently playing music channel before starting the intro.
 * Safe to call even if SFX is missing.
 */
function playIntroMusicIfAvailable() {
    const sfxInstance = window.sfx;
    if (!sfxInstance) return;
    sfxInstance.stopAll('music.');
}

/**
 * Main intro animation loop: updates/draws, handles completion, and schedules next frame.
 * @param {object} app - Game application object with canvas, ctx, state, intro, and showMenu()
 */
function loopIntro(app) {
    if (app.state !== GameState.INTRO) return;
    app.ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);
    app.intro.update();
    app.intro.draw(app.ctx);
    if (app.intro.done) {
        stopIntroMusicIfPlaying();
        app.showMenu();
        return;
    }
    requestAnimationFrame(function () { loopIntro(app); });
}

/**
 * Stops the intro music if the SFX system is present.
 */
function stopIntroMusicIfPlaying() {
    const sfxInstance = window.sfx;
    if (sfxInstance) sfxInstance.stop('music.intro');
}