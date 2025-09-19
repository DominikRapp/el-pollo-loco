function attachHudUtils(app) {
    app.setHudLevel = function (levelNumber) { return setHudLevel(app, levelNumber); };
    app.hideHudLevel = function () { return hideHudLevel(app); };
    app.setMobileControlsVisible = function (isVisible) { return setMobileControlsVisible(app, isVisible); };
}

function setHudLevel(appInstance, levelNumber) {
    const element = document.getElementById('hud-level');
    if (!element) return;
    element.textContent = 'Level ' + levelNumber;
    element.style.display = 'block';
}

function hideHudLevel(appInstance) {
    const element = document.getElementById('hud-level');
    if (element) element.style.display = 'none';
}

function setMobileControlsVisible(appInstance, isVisible) {
    const element = document.getElementById('mobile-controls');
    if (element) element.classList.toggle('is-active', !!isVisible);
}
