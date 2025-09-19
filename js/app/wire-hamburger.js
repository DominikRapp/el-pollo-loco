function wireHamburgerMenu(app) {
    const menuRoot = document.getElementById('hamburger-root');
    const menuButton = document.getElementById('hamburger-button');
    const menuPanel = document.getElementById('hamburger-menu');
    if (!menuRoot || !menuButton || !menuPanel) return;
    setupHamburgerMenu(menuRoot, menuButton, menuPanel);
}

function setupHamburgerMenu(menuRoot, menuButton, menuPanel) {
    const onButtonClick = function (event) { handleMenuButtonClick(event, menuPanel, menuButton); };
    const onDocClick = function (event) { handleDocumentClick(event, menuRoot, menuPanel, menuButton); };
    menuButton.addEventListener('click', onButtonClick);
    document.addEventListener('click', onDocClick);
    attachLinkCloseHandlers(menuPanel, menuButton);
}

function openHamburgerMenu(menuPanel, menuButton) {
    menuPanel.classList.remove('hidden');
    menuButton.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
}

function closeHamburgerMenu(menuPanel, menuButton) {
    menuPanel.classList.add('hidden');
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
}

function toggleHamburgerMenu(menuPanel, menuButton) {
    const isHidden = menuPanel.classList.contains('hidden');
    if (isHidden) openHamburgerMenu(menuPanel, menuButton);
    else closeHamburgerMenu(menuPanel, menuButton);
}

function handleMenuButtonClick(event, menuPanel, menuButton) {
    event.stopPropagation();
    toggleHamburgerMenu(menuPanel, menuButton);
}

function handleDocumentClick(event, menuRoot, menuPanel, menuButton) {
    const clickedInside = menuRoot.contains(event.target);
    if (!clickedInside) closeHamburgerMenu(menuPanel, menuButton);
}

function attachLinkCloseHandlers(menuPanel, menuButton) {
    const links = menuPanel.querySelectorAll('a');
    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function () { closeHamburgerMenu(menuPanel, menuButton); });
    }
}