/**
 * Wires up all mobile control buttons (left, right, jump, throw, restart)
 * and initializes their visibility based on input capabilities.
 * @param {object} app - Your game/app instance (should expose a keyboard map or world.keyboard)
 */
function wireMobileButtons(app) {
    const s = document.getElementById('mobile-controls');
    if (!s) return;
    const l = s.querySelector('#btn-left'); const r = s.querySelector('#btn-right');
    const j = s.querySelector('#btn-jump'); const t = s.querySelector('#btn-throw');
    const re = s.querySelector('.is-restart');
    holdBtn(app, l, 'LEFT'); holdBtn(app, r, 'RIGHT');
    jumpBtn(app, j); throwBtn(app, t); restartBtn(app, re);
    hideMobileControls(app);
}

/**
 * Shows the mobile controls container and enables them for coarse pointers.
 * @param {object} app - Your game/app instance (unused, kept for symmetry)
 */
function showMobileControls(app) {
    const s = document.getElementById('mobile-controls');
    if (!s) return;
    s.classList.remove('hidden');
    enableControls(s);
}

/**
 * Hides the mobile controls container.
 * @param {object} app - Your game/app instance (unused, kept for symmetry)
 */
function hideMobileControls(app) {
    const s = document.getElementById('mobile-controls');
    if (!s) return;
    s.classList.add('hidden');
    s.classList.remove('is-active');
}

/**
 * Enables control visuals for coarse pointer devices (touch screens).
 * @param {HTMLElement} s - The mobile controls root element
 */
function enableControls(s) {
    const coarse = matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (coarse) s.classList.add('is-active');
    else s.classList.remove('is-active');
}

/**
 * Resolves the active keyboard state object from different possible locations.
 * @param {object} app - Your game/app instance
 * @returns {object|null} A mutable keyboard map (e.g., { LEFT: boolean, RIGHT: boolean, ... }) or null if not found
 */
function kb(app) {
    if (app?.keyboard) return app.keyboard;
    if (app?.world?.keyboard) return app.world.keyboard;
    if (window.keyboard) return window.keyboard;
    return window.world?.keyboard || null;
}

/**
 * Sets a key state (pressed/released) on the resolved keyboard map.
 * @param {object} app - Your game/app instance
 * @param {string} key - Logical key name to set (e.g., 'LEFT', 'RIGHT', 'SPACE', 'THROW')
 * @param {boolean} down - True to press, false to release
 */
function setKey(app, key, down) {
    const k = kb(app);
    if (k) k[key] = down;
}

/**
 * Simulates a short key tap by pressing and releasing after a delay.
 * @param {object} app - Your game/app instance
 * @param {string} key - Logical key name to tap
 * @param {number} [ms=140] - Duration in milliseconds before releasing
 */
function tap(app, key, ms) {
    const d = typeof ms === 'number' ? ms : 140;
    setKey(app, key, true);
    setTimeout(() => setKey(app, key, false), d);
}

/**
 * Simulates multiple key taps simultaneously and releases them after a delay.
 * @param {object} app - Your game/app instance
 * @param {string[]} keys - Array of logical key names to press
 * @param {number} [ms=140] - Duration in milliseconds before releasing
 */
function tapMany(app, keys, ms) {
    const d = typeof ms === 'number' ? ms : 140;
    const k = kb(app);
    if (!k) return;
    keys.forEach(x => k[x] = true);
    setTimeout(() => keys.forEach(x => k[x] = false), d);
}

/**
 * Adds visual "press" feedback to a button element and prevents default touch/mouse behaviors.
 * @param {HTMLElement} el - Button element to decorate
 */
function pressFx(el) {
    if (!el) return;
    const add = () => el.classList.add('is-pressing');
    const rm = () => el.classList.remove('is-pressing');
    const stop = e => { if (e && e.cancelable) e.preventDefault(); };
    el.addEventListener('pointerdown', e => { stop(e); add(); }, { passive: false });
    ['pointerup', 'pointercancel', 'pointerleave', 'blur', 'mouseout', 'mouseup']
        .forEach(t => el.addEventListener(t, rm));
    el.addEventListener('touchstart', e => { stop(e); add(); }, { passive: false });
    el.addEventListener('touchend', rm);
    el.addEventListener('mousedown', add);
}

/**
 * Wires a "hold" style button: press and hold to keep a key down, release to lift.
 * @param {object} app - Your game/app instance
 * @param {HTMLElement} el - The button element
 * @param {string} key - Logical key to hold while the button is pressed
 */
function holdBtn(app, el, key) {
    if (!el) return;
    pressFx(el);
    const down = e => { e.preventDefault(); setKey(app, key, true); };
    const up = () => setKey(app, key, false);
    el.addEventListener('pointerdown', down, { passive: false });
    ['pointerup', 'pointercancel', 'pointerleave', 'mouseout', 'mouseup'].forEach(t => el.addEventListener(t, up));
    el.addEventListener('touchstart', down, { passive: false });
    el.addEventListener('touchend', up);
    el.addEventListener('mousedown', down);
}

/**
 * Wires a "jump" button: taps SPACE when triggered.
 * @param {object} app - Your game/app instance
 * @param {HTMLElement} el - The jump button element
 */
function jumpBtn(app, el) {
    if (!el) return;
    pressFx(el);
    const fire = e => { e.preventDefault(); tap(app, 'SPACE'); };
    el.addEventListener('pointerdown', fire, { passive: false });
    el.addEventListener('touchstart', fire, { passive: false });
    el.addEventListener('click', fire);
}

/**
 * Wires a "throw" button: taps multiple keys to perform a throw action.
 * @param {object} app - Your game/app instance
 * @param {HTMLElement} el - The throw button element
 */
function throwBtn(app, el) {
    if (!el) return;
    pressFx(el);
    const fire = e => { e.preventDefault(); tapMany(app, ['W', 'D', 'THROW']); };
    el.addEventListener('pointerdown', fire, { passive: false });
    el.addEventListener('touchstart', fire, { passive: false });
    el.addEventListener('click', fire);
}

/**
 * Wires a "restart" button that triggers a game restart with fallbacks.
 * @param {object} app - Your game/app instance
 * @param {HTMLElement} el - The restart button element
 */
function restartBtn(app, el) {
    if (!el) return;
    pressFx(el);
    const fire = e => { if (e) { e.preventDefault(); e.stopPropagation(); } doRestart(app); };
    el.addEventListener('pointerdown', fire, { passive: false });
    el.addEventListener('touchstart', fire, { passive: false });
    el.addEventListener('click', fire);
}

/**
 * Attempts to restart the game using several known hooks, with graceful fallbacks.
 * @param {object} app - Your game/app instance
 */
function doRestart(app) {
    if (window.performRestart) { window.performRestart(); return; }
    if (window.restartGame) { window.restartGame(); return; }
    if (window.resetGame) { window.resetGame(); return; }
    if (app?.restartToLevel1) { app.restartToLevel1(); return; }
    cleanup(app);
    if (tryStartLevel(app, 0)) return;
    if (location?.reload) location.reload();
}

/**
 * Tries to dispose/stop running systems to prepare for a clean restart.
 * Safe to call even if parts are missing.
 * @param {object} app - Your game/app instance
 */
function cleanup(app) {
    try { window.IntervalTracker?.clearAll?.(); } catch (_) { }
    try { app?.world?.dispose?.(); } catch (_) { }
    try { app?.stop?.(); } catch (_) { }
}

/**
 * Attempts to start a given level via global or app methods.
 * @param {object} app - Your game/app instance
 * @param {number} i - Level index to start
 * @returns {boolean} True if a start method was found and invoked
 */
function tryStartLevel(app, i) {
    try { if (window.startLevel) { window.startLevel(i); return true; } } catch (_) { }
    try { if (app?.startLevel) { app.startLevel(i); return true; } } catch (_) { }
    return false;
}

window.wireMobileButtons = wireMobileButtons;