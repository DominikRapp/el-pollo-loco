/**
 * Main render canvas element.
 * @type {HTMLCanvasElement|undefined}
 */
let canvas;

/**
 * Current game world instance.
 * @type {object|undefined}
 */
let world;

/**
 * Global keyboard state used by input handlers.
 * @type {Keyboard}
 */
let keyboard = new Keyboard();

/**
 * Global sound manager instance (also exposed as window.sfx).
 * @type {SoundManager|null}
 */
let sfx = null;

/**
 * Initializes canvas, audio (including mute state), and the App instance.
 * Should be called once on page load.
 * @returns {void}
 */
function init() {
    canvas = document.getElementById('canvas');
    sfx = new SoundManager();
    sfx.init();
    window.sfx = sfx;
    if (typeof setMuted === 'function') {
        setMuted(isMuted());
    } else {
        const muted = localStorage.getItem('muted') === '1';
        sfx.setMuted(muted);
    }
    app = new App();
    app.init(canvas, keyboard);
}

/**
 * One-time unlock handler for audio on first user interaction,
 * and stops intro music if still on INTRO state.
 * Removes its own event listeners after running once.
 * @returns {void}
 */
const onFirstInteract = () => {
    if (window.sfx && typeof window.sfx.unlock === 'function') window.sfx.unlock();
    if (window.app && app.state === GameState.INTRO && window.sfx) {
        window.sfx.stopAll('music.');
    }
    window.removeEventListener('pointerdown', onFirstInteract);
    window.removeEventListener('keydown', onFirstInteract);
};

window.addEventListener('pointerdown', onFirstInteract);
window.addEventListener('keydown', onFirstInteract);

/**
 * Global keydown handler: maps keys to the keyboard state and triggers shortcuts.
 * Honors areGameShortcutsEnabled() before acting on gameplay keys.
 * @param {KeyboardEvent} event - Keydown event
 * @returns {void}
 */
document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const k = event.key || '';
    const kc = event.keyCode || 0;
    const lower = k.toLowerCase();
    if (kc === 13 || lower === 'enter') { handleEnterOnStart(); return; }
    if (kc === 27 || lower === 'escape') { handleEscCloseOverlays(); return; }
    if (kc === 77 || lower === 'm') {
        keyboard.MUTE = true;
        if (areGameShortcutsEnabled()) toggleMuteGlobal();
        return;
    }
    if (!areGameShortcutsEnabled()) return;
    if (kc === 65 || lower === 'a' || kc === 37 || lower === 'arrowleft') keyboard.LEFT = true;
    if (kc === 68 || lower === 'd' || kc === 39 || lower === 'arrowright') keyboard.RIGHT = true;
    if (kc === 32 || lower === ' ') keyboard.SPACE = true;
    if (kc === 87 || lower === 'w') {
        keyboard.THROW = true;
        if (typeof world !== 'undefined' && world && world.character) world.character.tryThrow();
    }
    if (kc === 82 || lower === 'r') {
        keyboard.RESTART = true;
        if (typeof performRestart === 'function') performRestart();
    }
    if (kc === 66 || lower === 'b') {
        keyboard.LEADERBOARD = true;
        if (typeof openLeaderboard === 'function') openLeaderboard();
    }
    if (kc === 73 || lower === 'i') {
        keyboard.INSTRUCTIONS = true;
        if (typeof openInstructions === 'function') openInstructions();
    }
    if (kc === 79 || lower === 'o') {
        keyboard.SETTINGS = true;
        if (typeof openSettings === 'function') openSettings();
    }
    if (kc === 72 || lower === 'h') {
        keyboard.HOME = true;
        if (typeof goHome === 'function') goHome();
    }
    if (kc === 70 || lower === 'f') {
        keyboard.FULLSCREEN = true;
        if (typeof toggleFullscreen === 'function') toggleFullscreen();
    }
});

/**
 * Global keyup handler: releases keys in the keyboard state.
 * Honors areGameShortcutsEnabled() before acting on gameplay keys.
 * @param {KeyboardEvent} event - Keyup event
 * @returns {void}
 */
document.addEventListener('keyup', (event) => {
    const k = event.key || '';
    const kc = event.keyCode || 0;
    const lower = k.toLowerCase();
    if (kc === 77 || lower === 'm') { keyboard.MUTE = false; return; }
    if (!areGameShortcutsEnabled()) return;
    if (kc === 65 || lower === 'a' || kc === 37 || lower === 'arrowleft') keyboard.LEFT = false;
    if (kc === 68 || lower === 'd' || kc === 39 || lower === 'arrowright') keyboard.RIGHT = false;
    if (kc === 32 || lower === ' ') keyboard.SPACE = false;
    if (kc === 87 || lower === 'w') keyboard.THROW = false;
    if (kc === 82 || lower === 'r') keyboard.RESTART = false;
    if (kc === 66 || lower === 'b') keyboard.LEADERBOARD = false;
    if (kc === 73 || lower === 'i') keyboard.INSTRUCTIONS = false;
    if (kc === 79 || lower === 'o') keyboard.SETTINGS = false;
    if (kc === 72 || lower === 'h') keyboard.HOME = false;
    if (kc === 70 || lower === 'f') keyboard.FULLSCREEN = false;
});

/**
 * Clears all gameplay-related key flags on the global keyboard state.
 * @returns {void}
 */
function clearKeys() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.SPACE = false;
    keyboard.THROW = false;
    keyboard.RESTART = false;
    keyboard.LEADERBOARD = false;
    keyboard.INSTRUCTIONS = false;
    keyboard.SETTINGS = false;
    keyboard.HOME = false;
    keyboard.FULLSCREEN = false;
}

/**
 * Checks whether the given event target is an editable field.
 * @param {EventTarget|Element|null|undefined} t - Event target
 * @returns {boolean} True if INPUT, TEXTAREA, or contentEditable
 */
function isEditableTarget(t) {
    if (!t) return false;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return true;
    if (t.isContentEditable === true) return true;
    return false;
}

/**
 * Whether gameplay shortcuts should be active (only in GAME state).
 * @returns {boolean} True if app exists and state is GameState.GAME
 */
function areGameShortcutsEnabled() {
    return !!(typeof app !== 'undefined' && app && app.state === GameState.GAME);
}

/**
 * Convenience alias for checking in-game state.
 * @returns {boolean} True if app is in GameState.GAME
 */
function isInGame() {
    return !!(window.app && app.state === GameState.GAME);
}

/**
 * Performs a full restart to level 1.
 * - Hides #gameover-actions and #victory-actions overlays.
 * - Stops the game timer and hides it.
 * - Stops an active countdown if available.
 * - Clears all tracked intervals via IntervalTracker.
 * - Resets carryOverEnergy to 100.
 * - Calls app.restartToLevel1().
 * Safe no-op if the global `app` is missing.
 * @returns {void}
 */
function performRestart() {
    if (!app) return;
    const go = document.getElementById('gameover-actions');
    const vi = document.getElementById('victory-actions');
    if (go) go.classList.add('hidden');
    if (vi) vi.classList.add('hidden');
    if (typeof app.stopTimer === 'function') app.stopTimer();
    if (typeof app.showTimer === 'function') app.showTimer(false);
    if (typeof stopCountdown === 'function') stopCountdown(app);
    IntervalTracker.clearAll();
    app.carryOverEnergy = 100;
    app.restartToLevel1();
}

/**
 * Opens the instructions overlay by simulating a click on the first available trigger.
 * @returns {void}
 */
function openInstructions() {
    const btns = [
        document.getElementById('menu-instructions'),
        document.getElementById('btn-instructions-home'),
        document.getElementById('btn-instructions-go'),
        document.getElementById('btn-instructions-victory')
    ];
    for (const b of btns) { if (b) { b.click(); return; } }
}

/**
 * Opens the leaderboard overlay by simulating a click on a known trigger,
 * or directly unhides the overlay as a fallback.
 * @returns {void}
 */
function openLeaderboard() {
    const btns = [
        document.getElementById('btn-leaderboard-home'),
        document.getElementById('btn-leaderboard-go'),
        document.getElementById('btn-leaderboard-victory')
    ];
    for (const b of btns) { if (b) { b.click(); return; } }
    const ov = document.getElementById('leaderboard-overlay');
    if (ov) ov.classList.remove('hidden');
}

/**
 * Opens the settings overlay by simulating a click on the first available trigger.
 * @returns {void}
 */
function openSettings() {
    const btns = [
        document.getElementById('menu-settings'),
        document.getElementById('btn-settings-home'),
        document.getElementById('btn-settings-go'),
        document.getElementById('btn-settings-victory')
    ];
    for (const b of btns) { if (b) { b.click(); return; } }
}

/**
 * Returns the UI to the home/menu state: clears keys, hides overlays, shows menu.
 * Safe no-op if app is missing.
 * @returns {void}
 */
function goHome() {
    if (!app) return;
    clearKeys();
    app.resetOverlays();
    app.hideWinLoseOverlays();
    app.showMenu();
}

/**
 * Toggles fullscreen mode for the #game-root element (with vendor fallbacks).
 * @returns {void}
 */
function toggleFullscreen() {
    const root = document.getElementById('game-root');
    if (!root) return;
    const isFs = document.fullscreenElement === root || document.webkitFullscreenElement === root || document.msFullscreenElement === root;
    if (isFs) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    } else {
        if (root.requestFullscreen) root.requestFullscreen();
        else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen();
        else if (root.msRequestFullscreen) root.msRequestFullscreen();
    }
}

/**
 * Checks whether the start screen is currently visible.
 * @returns {boolean} True if #start-screen exists and is not hidden
 */
function startScreenVisible() {
    const s = document.getElementById('start-screen');
    return !!s && !s.classList.contains('hidden');
}

/**
 * Handles Enter on the start screen: clicks the Start button if enabled.
 * @returns {void}
 */
function handleEnterOnStart() {
    if (!startScreenVisible()) return;
    const btn = document.getElementById('btn-start');
    if (btn && !btn.disabled) btn.click();
}

/**
 * Checks if an overlay by id is open (element exists and is not hidden).
 * @param {string} id - Element id of the overlay root
 * @returns {boolean} True if overlay is open
 */
function overlayOpen(id) {
    const el = document.getElementById(id);
    return !!el && !el.classList.contains('hidden');
}

/**
 * Clicks an element by id if it exists.
 * @param {string} id - Element id to click
 * @returns {void}
 */
function clickIfExists(id) {
    const el = document.getElementById(id);
    if (el) el.click();
}

/**
 * Handles Escape to close any open overlay (instructions, leaderboard, settings).
 * @returns {void}
 */
function handleEscCloseOverlays() {
    if (overlayOpen('instructions-overlay')) { clickIfExists('instructions-close'); return; }
    if (overlayOpen('leaderboard-overlay')) { clickIfExists('leaderboard-close'); return; }
    if (overlayOpen('settings-overlay')) { clickIfExists('settings-close'); return; }
}

/**
 * Reads the global muted state from localStorage.
 * @returns {boolean} True if muted
 */
function isMuted() {
    return localStorage.getItem('muted') === '1';
}

/**
 * Sets the global muted state: updates localStorage, mutes all <audio>,
 * emits an 'app-mute-changed' event, and forwards to window.sfx if present.
 * @param {boolean} on - True to mute, false to unmute
 * @fires window#app-mute-changed
 * @returns {void}
 */
function setMuted(on) {
    localStorage.setItem('muted', on ? '1' : '0');
    window.__muted = !!on;
    const audios = document.querySelectorAll('audio');
    audios.forEach(a => { a.muted = on; });
    const evt = new CustomEvent('app-mute-changed', { detail: { muted: !!on } });
    window.dispatchEvent(evt);
    if (window.sfx) window.sfx.setMuted(!!on);
}

/**
 * Convenience toggle for the global mute state.
 * @returns {void}
 */
function toggleMuteGlobal() {
    setMuted(!isMuted());
}