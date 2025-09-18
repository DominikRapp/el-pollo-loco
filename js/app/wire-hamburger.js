function wireHamburgerMenu(app) {
    const menuRoot = document.getElementById('hamburger-root');
    const menuButton = document.getElementById('hamburger-button');
    const menuPanel = document.getElementById('hamburger-menu');

    if (!menuRoot || !menuButton || !menuPanel) {
        return;
    }

    const openMenu = () => {
        menuPanel.classList.remove('hidden');
        menuButton.classList.add('open');
        menuButton.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
        menuPanel.classList.add('hidden');
        menuButton.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = () => {
        const isHidden = menuPanel.classList.contains('hidden');
        if (isHidden) {
            openMenu();
        } else {
            closeMenu();
        }
    };

    menuButton.addEventListener('click', function (event) {
        event.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', function (event) {
        const clickedInside = menuRoot.contains(event.target);
        if (!clickedInside) {
            closeMenu();
        }
    });

    const links = menuPanel.querySelectorAll('a');
    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function () {
            closeMenu();
        });
    }
}
