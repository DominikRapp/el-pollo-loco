function wireMobileButtons(app) {
    const root = document.getElementById('game-root');
    const scope = document.getElementById('mobile-controls');
    if (!root || !scope) return;

    const btnLeft = scope.querySelector('.is-left');
    const btnRight = scope.querySelector('.is-right');
    const btnJump = scope.querySelector('.is-jump');
    const btnThrow = scope.querySelector('.is-throw');
    const btnRestartMobile = scope.querySelector('.is-restart');

    const getKb = () => {
        if (app && app.keyboard) return app.keyboard;
        if (app && app.world && app.world.keyboard) return app.world.keyboard;
        if (window.keyboard) return window.keyboard;
        if (window.world && window.world.keyboard) return window.world.keyboard;
        return null;
    };

    const setKey = (k, v = true) => {
        const kb = getKb();
        if (kb) kb[k] = v;
    };

    const tap = (k, ms = 140) => {
        setKey(k, true);
        setTimeout(() => setKey(k, false), ms);
    };

    const tapMany = (keys, ms = 140) => {
        const kb = getKb();
        keys.forEach(k => { if (kb) kb[k] = true; });
        setTimeout(() => keys.forEach(k => { if (kb) kb[k] = false; }), ms);
    };

    const onHold = (el, key) => {
        if (!el) return;
        const start = (e) => { e.preventDefault(); setKey(key, true); };
        const end = () => { setKey(key, false); };
        el.addEventListener('pointerdown', start, { passive: false });
        el.addEventListener('pointerup', end);
        el.addEventListener('pointercancel', end);
        el.addEventListener('pointerleave', end);
        el.addEventListener('touchstart', start, { passive: false });
        el.addEventListener('touchend', end);
        el.addEventListener('mousedown', start);
        el.addEventListener('mouseup', end);
        el.addEventListener('mouseout', end);
    };

    onHold(btnLeft, 'LEFT');
    onHold(btnRight, 'RIGHT');

    if (btnJump) {
        const fire = (e) => { e.preventDefault(); tap('SPACE'); };
        btnJump.addEventListener('pointerdown', fire, { passive: false });
        btnJump.addEventListener('touchstart', fire, { passive: false });
        btnJump.addEventListener('click', fire);
    }

    if (btnThrow) {
        const fire = (e) => {
            e.preventDefault();
            tapMany(['W', 'D', 'THROW']);
        };
        btnThrow.addEventListener('pointerdown', fire, { passive: false });
        btnThrow.addEventListener('touchstart', fire, { passive: false });
        btnThrow.addEventListener('click', fire);
    }

    if (btnRestartMobile) {
        const doRestart = (e) => {
            e.preventDefault();
            if (app && app.state === GameState.GAME) {
                IntervalTracker.clearAll();
                app.carryOverEnergy = 100;
                app.restartToLevel1();
                return;
            }
            const cand = document.querySelector('#btn-restart, #btn-restart-win');
            if (cand) { cand.click(); return; }
            tap('R', 160);
        };
        btnRestartMobile.addEventListener('pointerdown', doRestart, { passive: false });
        btnRestartMobile.addEventListener('touchstart', doRestart, { passive: false });
        btnRestartMobile.addEventListener('click', doRestart);
    }
}
