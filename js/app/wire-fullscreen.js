function wireFullscreenToggle(app) {
    const root = document.getElementById('game-root');
    const btnHome = document.getElementById('btn-fullscreen-home');
    const btnGo = document.getElementById('btn-fullscreen-go');
    const btnVictory = document.getElementById('btn-fullscreen-victory');

    if (!root) return;

    const isFs = () => {
        return document.fullscreenElement === root
            || document.webkitFullscreenElement === root
            || document.msFullscreenElement === root;
    };

    const canFs = () => {
        return !!(root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen);
    };

    const enter = () => {
        if (root.requestFullscreen) return root.requestFullscreen();
        if (root.webkitRequestFullscreen) return root.webkitRequestFullscreen();
        if (root.msRequestFullscreen) return root.msRequestFullscreen();
    };

    const exit = () => {
        if (document.exitFullscreen) return document.exitFullscreen();
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
        if (document.msExitFullscreen) return document.msExitFullscreen();
    };

    const update = () => {
        const on = isFs();
        const labelOn = 'Fullscreen';
        const labelOff = 'Fullscreen';
        const set = (btn) => {
            if (!btn) return;
            btn.textContent = on ? labelOn : labelOff;
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        };
        set(btnHome);
        set(btnGo);
        set(btnVictory);
    };

    const toggle = (ev) => {
        if (ev) ev.preventDefault();
        if (!canFs()) return;
        if (isFs()) {
            const p = exit();
            if (p && typeof p.finally === 'function') p.finally(update); else setTimeout(update, 0);
        } else {
            const p = enter();
            if (p && typeof p.finally === 'function') p.finally(update); else setTimeout(update, 0);
        }
    };

    if (btnHome) btnHome.addEventListener('click', toggle);
    if (btnGo) btnGo.addEventListener('click', toggle);
    if (btnVictory) btnVictory.addEventListener('click', toggle);

    document.addEventListener('fullscreenchange', () => update());
    document.addEventListener('webkitfullscreenchange', () => update());
    document.addEventListener('msfullscreenchange', () => update());

    update();
}
