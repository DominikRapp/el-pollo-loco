function handleGoHome(app, event) {
    if (event) event.preventDefault();
    app.resetRunTotals();
    app.clearRunOverlayResults();
    app.resetOverlays();
    app.hideWinLoseOverlays();
    app.showMenu();
}

function wireHomeActions(app) {
    const buttonGoFromGame = document.getElementById('btn-home-go');
    const buttonHome = document.getElementById('btn-home');
    const menuHome = document.getElementById('menu-home');
    const handler = function (ev) { handleGoHome(app, ev); };
    if (buttonGoFromGame) buttonGoFromGame.addEventListener('click', handler);
    if (menuHome) menuHome.addEventListener('click', handler);
    if (buttonHome) buttonHome.addEventListener('click', handler);
}
