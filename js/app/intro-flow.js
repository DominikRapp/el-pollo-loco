function startIntro(app) {
    app.state = GameState.INTRO;
    beginIntroWhenAudioReady(app);
}

function beginIntroWhenAudioReady(app) {
    if (isSfxReady()) {
        beginIntro(app);
        return;
    }
    registerSfxReadyOnce(function () { beginIntro(app); });
}

function isSfxReady() {
    const sfxInstance = window.sfx;
    if (!sfxInstance) return false;
    if (sfxInstance.ready === true) return true;
    if (sfxInstance.pools && sfxInstance.pools.size > 0) return true;
    return false;
}

function registerSfxReadyOnce(callback) {
    function onReady() {
        window.removeEventListener('sfx-ready', onReady);
        callback();
    }
    window.addEventListener('sfx-ready', onReady);
}

function beginIntro(app) {
    app.intro = new IntroPepe(app.canvas.height);
    playIntroMusicIfAvailable();
    loopIntro(app);
}

function playIntroMusicIfAvailable() {
    const sfxInstance = window.sfx;
    if (!sfxInstance) return;
    sfxInstance.stopAll('music.');
    sfxInstance.play('music.intro');
}

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

function stopIntroMusicIfPlaying() {
    const sfxInstance = window.sfx;
    if (sfxInstance) sfxInstance.stop('music.intro');
}
