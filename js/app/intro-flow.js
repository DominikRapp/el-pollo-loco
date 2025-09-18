function startIntro(app) {
    app.state = GameState.INTRO;

    const go = () => {
        app.intro = new IntroPepe(app.canvas.height);
        if (window.sfx) {
            window.sfx.stopAll('music.');
            window.sfx.play('music.intro');
        }
        loopIntro(app);
    };

    const s = window.sfx;
    if (s && (s.ready === true || (s.pools && s.pools.size > 0))) {
        go();
    } else {
        const onReady = () => {
            window.removeEventListener('sfx-ready', onReady);
            go();
        };
        window.addEventListener('sfx-ready', onReady);
    }
}

function loopIntro(app) {
    if (app.state !== GameState.INTRO) return;
    app.ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);
    app.intro.update();
    app.intro.draw(app.ctx);
    if (app.intro.done) {
        if (window.sfx) {
            window.sfx.stop('music.intro');
        }
        app.showMenu();
        return;
    }
    requestAnimationFrame(() => loopIntro(app));
}
