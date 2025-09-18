function wireHomeActions(app) {
        const btnHomeGo = document.getElementById('btn-home-go');
        const btnHomeWin = document.getElementById('btn-home');
        const menuHome = document.getElementById('menu-home');

        const goHome = (ev) => {
            if (ev) ev.preventDefault();

            app.resetRunTotals();
            app.clearRunOverlayResults();

            app.resetOverlays();
            app.hideWinLoseOverlays();
            app.showMenu();
        };

        if (btnHomeGo) btnHomeGo.addEventListener('click', goHome);
        if (menuHome) menuHome.addEventListener('click', goHome);
        if (btnHomeWin) btnHomeWin.addEventListener('click', goHome);
}
