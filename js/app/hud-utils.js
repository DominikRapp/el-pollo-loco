function hudSetLevel(app, n) {
    const el = document.getElementById('hud-level');
    if (el) {
        el.textContent = 'Level ' + n;
        el.style.display = 'block';
    }
}

function hudHideLevel(app) {
    const el = document.getElementById('hud-level');
    if (el) {
        el.style.display = 'none';
    }
}

function hudSetMobileVisible(app, visible) {
    const el = document.getElementById('mobile-controls');
    if (el) el.classList.toggle('is-active', !!visible);
}

function attachHudUtils(app) {
    app.setHudLevel = function (n) { return hudSetLevel(app, n); };
    app.hideHudLevel = function () { return hudHideLevel(app); };
    app.setMobileControlsVisible = function (visible) { return hudSetMobileVisible(app, visible); };
}
