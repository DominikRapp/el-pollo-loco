let canvas;
let world;
let keyboard = new Keyboard();
let sfx = null;

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

const onFirstInteract = () => {
    if (window.sfx && typeof window.sfx.unlock === 'function') window.sfx.unlock();
    if (window.app && app.state === GameState.INTRO && window.sfx) {
        window.sfx.stopAll('music.');
        window.sfx.play('music.intro');
    }
    window.removeEventListener('pointerdown', onFirstInteract);
    window.removeEventListener('keydown', onFirstInteract);
};

window.addEventListener('pointerdown', onFirstInteract);
window.addEventListener('keydown', onFirstInteract);

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

function isEditableTarget(t) {
    if (!t) return false;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return true;
    if (t.isContentEditable === true) return true;
    return false;
}

function areGameShortcutsEnabled() {
    return !!(typeof app !== 'undefined' && app && app.state === GameState.GAME);
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
    if (overlayOpen('leaderboard-overlay')) { clickIfExists('leaderboard-close'); return; }
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