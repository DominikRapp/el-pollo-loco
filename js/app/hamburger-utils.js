function hamburgerGetElements(app) {
    const root = document.getElementById('hamburger-root');
    const button = document.getElementById('hamburger-button');
    const panel = document.getElementById('hamburger-menu');
    return { root, button, panel };
}

function hamburgerClose(app) {
    const { root, button, panel } = app.getHamburgerElements();
    if (!root || !button || !panel) { return; }
    panel.classList.add('hidden');
    button.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
}

function hamburgerShow(app, visible) {
    const { root } = app.getHamburgerElements();
    if (!root) { return; }
    if (visible) {
        root.classList.remove('hidden');
        app.closeHamburgerMenu();
    } else {
        root.classList.add('hidden');
        app.closeHamburgerMenu();
    }
}

function attachHamburgerUtils(app) {
    app.getHamburgerElements = function () { return hamburgerGetElements(app); };
    app.closeHamburgerMenu = function () { return hamburgerClose(app); };
    app.showHamburger = function (visible) { return hamburgerShow(app, visible); };
}
