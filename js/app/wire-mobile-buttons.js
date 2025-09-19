function wireMobileButtons(app) {
    const root = document.getElementById('game-root');
    const scope = document.getElementById('mobile-controls');
    if (!root || !scope) return;
    const buttonLeft = scope.querySelector('.is-left');
    const buttonRight = scope.querySelector('.is-right');
    const buttonJump = scope.querySelector('.is-jump');
    const buttonThrow = scope.querySelector('.is-throw');
    const buttonRestart = scope.querySelector('.is-restart');
    wireHoldButton(app, buttonLeft, 'LEFT');
    wireHoldButton(app, buttonRight, 'RIGHT');
    wireJumpButton(app, buttonJump);
    wireThrowButton(app, buttonThrow);
    wireRestartButton(app, buttonRestart);
}

function getKeyboardRef(app) {
    if (app && app.keyboard) return app.keyboard;
    if (app && app.world && app.world.keyboard) return app.world.keyboard;
    if (window.keyboard) return window.keyboard;
    if (window.world && window.world.keyboard) return window.world.keyboard;
    return null;
}

function setKeyFlag(app, key, isDown) {
    const keyboard = getKeyboardRef(app);
    if (keyboard) keyboard[key] = isDown;
}

function tapKey(app, key, ms) {
    const delay = typeof ms === 'number' ? ms : 140;
    setKeyFlag(app, key, true);
    setTimeout(function () { setKeyFlag(app, key, false); }, delay);
}

function tapManyKeys(app, keys, ms) {
    const delay = typeof ms === 'number' ? ms : 140;
    const keyboard = getKeyboardRef(app);
    if (!keyboard) return;
    keys.forEach(function (k) { keyboard[k] = true; });
    setTimeout(function () { keys.forEach(function (k) { keyboard[k] = false; }); }, delay);
}

function wireHoldButton(app, element, key) {
    if (!element) return;
    const start = function (e) { e.preventDefault(); setKeyFlag(app, key, true); };
    const end = function () { setKeyFlag(app, key, false); };
    element.addEventListener('pointerdown', start, { passive: false });
    element.addEventListener('pointerup', end);
    element.addEventListener('pointercancel', end);
    element.addEventListener('pointerleave', end);
    element.addEventListener('touchstart', start, { passive: false });
    element.addEventListener('touchend', end);
    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', end);
    element.addEventListener('mouseout', end);
}

function wireJumpButton(app, element) {
    if (!element) return;
    const fire = function (e) { e.preventDefault(); tapKey(app, 'SPACE'); };
    element.addEventListener('pointerdown', fire, { passive: false });
    element.addEventListener('touchstart', fire, { passive: false });
    element.addEventListener('click', fire);
}

function wireThrowButton(app, element) {
    if (!element) return;
    const fire = function (e) { e.preventDefault(); tapManyKeys(app, ['W', 'D', 'THROW']); };
    element.addEventListener('pointerdown', fire, { passive: false });
    element.addEventListener('touchstart', fire, { passive: false });
    element.addEventListener('click', fire);
}

function handleRestart(app, event) {
    if (event) event.preventDefault();
    if (app && app.state === GameState.GAME) {
        IntervalTracker.clearAll();
        app.carryOverEnergy = 100;
        app.restartToLevel1();
        return;
    }
    const candidate = document.querySelector('#btn-restart, #btn-restart-win');
    if (candidate) { candidate.click(); return; }
    tapKey(app, 'R', 160);
}

function wireRestartButton(app, restartButton) {
    if (!restartButton) return;
    restartButton.addEventListener('pointerdown', function (e) { handleRestart(app, e); }, { passive: false });
    restartButton.addEventListener('touchstart', function (e) { handleRestart(app, e); }, { passive: false });
    restartButton.addEventListener('click', function (e) { handleRestart(app, e); });
}
