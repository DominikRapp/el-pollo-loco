let canvas;
let world;
let keyboard = new Keyboard();
let sfx = null;

function init() {
    canvas = document.getElementById('canvas');
    app = new App();
    app.init(canvas, keyboard);

    sfx = new SoundManager();
    sfx.init();
    window.sfx = sfx;

    if (typeof setMuted === 'function') {
        setMuted(isMuted());
    } else {
        const muted = localStorage.getItem('muted') === '1';
        sfx.setMuted(muted);
    }
}

document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (isEditableTarget(event.target)) return;
    if (!areGameShortcutsEnabled()) return;
    if (event.keyCode === 65) keyboard.LEFT = true;
    if (event.keyCode === 37) keyboard.LEFT = true;
    if (event.keyCode === 68) keyboard.RIGHT = true;
    if (event.keyCode === 39) keyboard.RIGHT = true;
    if (event.keyCode === 32) keyboard.SPACE = true;
    if (event.keyCode === 87) keyboard.THROW = true;
    if (event.keyCode === 82) {
        keyboard.RESTART = true;
        performRestart();
    }
    if (event.keyCode === 66) {
        keyboard.SCOREBOARD = true;
        openScoreboard();
    }
    if (event.keyCode === 73) {
        keyboard.INSTRUCTIONS = true;
        openInstructions();
    }
    if (event.keyCode === 79) {
        keyboard.SETTINGS = true;
        openSettings();
    }
    if (event.keyCode === 72) {
        keyboard.HOME = true;
        goHome();
    }
    if (event.keyCode === 70) {
        keyboard.FULLSCREEN = true;
        toggleFullscreen();
    }
    if (event.keyCode === 77) {
        keyboard.MUTE = true;
        toggleMuteGlobal();
    }
});

document.addEventListener('keyup', (event) => {
    if (isEditableTarget(event.target)) return;
    if (!areGameShortcutsEnabled()) return;
    if (event.keyCode === 65) keyboard.LEFT = false;
    if (event.keyCode === 37) keyboard.LEFT = false;
    if (event.keyCode === 68) keyboard.RIGHT = false;
    if (event.keyCode === 39) keyboard.RIGHT = false;
    if (event.keyCode === 32) keyboard.SPACE = false;
    if (event.keyCode === 87) keyboard.THROW = false;
    if (event.keyCode === 82) keyboard.RESTART = false;
    if (event.keyCode === 66) keyboard.SCOREBOARD = false;
    if (event.keyCode === 73) keyboard.INSTRUCTIONS = false;
    if (event.keyCode === 79) keyboard.SETTINGS = false;
    if (event.keyCode === 72) keyboard.HOME = false;
    if (event.keyCode === 70) keyboard.FULLSCREEN = false;
    if (event.keyCode === 77) keyboard.MUTE = false;
});

document.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) handleEnterOnStart();
    if (event.keyCode === 27) handleEscCloseOverlays();
});

function clearKeys() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.SPACE = false;
    keyboard.THROW = false;
    keyboard.RESTART = false;
    keyboard.SCOREBOARD = false;
    keyboard.INSTRUCTIONS = false;
    keyboard.SETTINGS = false;
    keyboard.HOME = false;
    keyboard.FULLSCREEN = false;
}

function isEditableTarget(t) {
    if (!t) return false;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return true;
    if (t.isContentEditable === true) return true;
    return false;
}

function areGameShortcutsEnabled() {
    const start = document.getElementById('start-screen');
    return !!(start && start.classList.contains('hidden'));
}

function isInGame() {
    return !!(window.app && app.state === GameState.GAME);
}

function performRestart() {
    if (!app) return;
    const go = document.getElementById('gameover-actions');
    const vi = document.getElementById('victory-actions');
    if (go) go.classList.add('hidden');
    if (vi) vi.classList.add('hidden');
    IntervalTracker.clearAll();
    app.carryOverEnergy = 100;
    app.restartToLevel1();
}

function openInstructions() {
    const btns = [
        document.getElementById('menu-instructions'),
        document.getElementById('btn-instructions-home'),
        document.getElementById('btn-instructions-go'),
        document.getElementById('btn-instructions-victory')
    ];
    for (const b of btns) { if (b) { b.click(); return; } }
}

function openScoreboard() {
    const btns = [
        document.getElementById('btn-scoreboard-home'),
        document.getElementById('btn-scoreboard-go'),
        document.getElementById('btn-scoreboard-victory')
    ];
    for (const b of btns) { if (b) { b.click(); return; } }
    const ov = document.getElementById('scoreboard-overlay');
    if (ov) ov.classList.remove('hidden');
}

function openSettings() {
    const btns = [
        document.getElementById('menu-settings'),
        document.getElementById('btn-settings-home'),
        document.getElementById('btn-settings-go'),
        document.getElementById('btn-settings-victory')
    ];
    for (const b of btns) { if (b) { b.click(); return; } }
}

function goHome() {
    if (!app) return;
    clearKeys();
    app.resetOverlays();
    app.hideWinLoseOverlays();
    app.showMenu();
}

function toggleFullscreen() {
    const root = document.getElementById('game-root');
    if (!root) return;
    const isFs =
        document.fullscreenElement === root ||
        document.webkitFullscreenElement === root ||
        document.msFullscreenElement === root;

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

function startScreenVisible() {
    const s = document.getElementById('start-screen');
    return !!s && !s.classList.contains('hidden');
}

function handleEnterOnStart() {
    if (!startScreenVisible()) return;
    const btn = document.getElementById('btn-start');
    if (btn && !btn.disabled) btn.click();
}

function overlayOpen(id) {
    const el = document.getElementById(id);
    return !!el && !el.classList.contains('hidden');
}

function clickIfExists(id) {
    const el = document.getElementById(id);
    if (el) el.click();
}

function handleEscCloseOverlays() {
    if (overlayOpen('instructions-overlay')) { clickIfExists('instructions-close'); return; }
    if (overlayOpen('scoreboard-overlay')) { clickIfExists('scoreboard-close'); return; }
    if (overlayOpen('settings-overlay')) { clickIfExists('settings-close'); return; }
}

function isMuted() {
    return localStorage.getItem('muted') === '1';
}

function setMuted(on) {
    localStorage.setItem('muted', on ? '1' : '0');
    window.__muted = !!on;
    const audios = document.querySelectorAll('audio');
    audios.forEach(a => { a.muted = on; });
    const evt = new CustomEvent('app-mute-changed', { detail: { muted: !!on } });
    window.dispatchEvent(evt);
    if (window.sfx) window.sfx.setMuted(!!on);
}

function toggleMuteGlobal() {
    setMuted(!isMuted());
}