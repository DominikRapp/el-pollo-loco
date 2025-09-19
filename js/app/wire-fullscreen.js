function isFullscreen(root) {
    return document.fullscreenElement === root
        || document.webkitFullscreenElement === root
        || document.msFullscreenElement === root;
}

function canFullscreen(root) {
    return !!(root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen);
}

function enterFullscreen(root) {
    if (root.requestFullscreen) return root.requestFullscreen();
    if (root.webkitRequestFullscreen) return root.webkitRequestFullscreen();
    if (root.msRequestFullscreen) return root.msRequestFullscreen();
}

function exitFullscreen() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    if (document.msExitFullscreen) return document.msExitFullscreen();
}

function updateFullscreenButtons(root, btnHome, btnGo, btnVictory) {
    const on = isFullscreen(root);
    const setBtn = function (btn) {
        if (!btn) return;
        btn.textContent = on ? 'Fullscreen' : 'Fullscreen';
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    setBtn(btnHome);
    setBtn(btnGo);
    setBtn(btnVictory);
}

function toggleFullscreen(event, root, btnHome, btnGo, btnVictory) {
    if (event) event.preventDefault();
    if (!canFullscreen(root)) return;
    const doUpdate = function () { updateFullscreenButtons(root, btnHome, btnGo, btnVictory); };
    if (isFullscreen(root)) {
        const p = exitFullscreen();
        if (p && typeof p.finally === 'function') p.finally(doUpdate); else setTimeout(doUpdate, 0);
    } else {
        const p = enterFullscreen(root);
        if (p && typeof p.finally === 'function') p.finally(doUpdate); else setTimeout(doUpdate, 0);
    }
}

function wireFullscreenToggle(app) {
    const root = document.getElementById('game-root');
    const btnHome = document.getElementById('btn-fullscreen-home');
    const btnGo = document.getElementById('btn-fullscreen-go');
    const btnVictory = document.getElementById('btn-fullscreen-victory');
    if (!root) return;
    const handler = function (ev) { toggleFullscreen(ev, root, btnHome, btnGo, btnVictory); };
    if (btnHome) btnHome.addEventListener('click', handler);
    if (btnGo) btnGo.addEventListener('click', handler);
    if (btnVictory) btnVictory.addEventListener('click', handler);
    document.addEventListener('fullscreenchange', function () { updateFullscreenButtons(root, btnHome, btnGo, btnVictory); });
    document.addEventListener('webkitfullscreenchange', function () { updateFullscreenButtons(root, btnHome, btnGo, btnVictory); });
    document.addEventListener('msfullscreenchange', function () { updateFullscreenButtons(root, btnHome, btnGo, btnVictory); });
    updateFullscreenButtons(root, btnHome, btnGo, btnVictory);
}
