function resetOverlaysImpl(app) {
    const ids = ['overlay-gameover', 'overlay-youwin'];
    for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.classList.remove('pop-in');
        }
    }
    const go = document.getElementById('gameover-actions');
    const vi = document.getElementById('victory-actions');
    if (go) go.classList.add('hidden');
    if (vi) vi.classList.add('hidden');
}

function attachResetOverlays(app) {
    app.resetOverlays = function () { return resetOverlaysImpl(app); };
}
