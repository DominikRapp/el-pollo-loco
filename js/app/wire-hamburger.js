/**
 * Wires the hamburger menu: finds DOM elements and sets up handlers.
 * No-op if required elements are missing.
 * @param {object} app - The application context (not used, kept for symmetry)
 * @returns {void}
 */
function wireHamburgerMenu(app) {
    const menuRoot = document.getElementById('hamburger-root');
    const menuButton = document.getElementById('hamburger-button');
    const menuPanel = document.getElementById('hamburger-menu');
    if (!menuRoot || !menuButton || !menuPanel) return;
    setupHamburgerMenu(menuRoot, menuButton, menuPanel);
}

/**
 * Attaches click handlers for toggling the menu and closing it on outside clicks.
 * Also binds link clicks within the menu to close the panel.
 * @param {HTMLElement} menuRoot - Container element for the menu
 * @param {HTMLButtonElement} menuButton - The hamburger toggle button
 * @param {HTMLElement} menuPanel - The menu panel element
 * @returns {void}
 */
function setupHamburgerMenu(menuRoot, menuButton, menuPanel) {
    const onButtonClick = function (event) { handleMenuButtonClick(event, menuPanel, menuButton); };
    const onDocClick = function (event) { handleDocumentClick(event, menuRoot, menuPanel, menuButton); };
    menuButton.addEventListener('click', onButtonClick);
    document.addEventListener('click', onDocClick);
    attachLinkCloseHandlers(menuPanel, menuButton);
}

/**
 * Opens the hamburger menu panel and updates button state/ARIA.
 * @param {HTMLElement} menuPanel - The menu panel to show
 * @param {HTMLButtonElement} menuButton - The toggle button to update
 * @returns {void}
 */
function openHamburgerMenu(menuPanel, menuButton) {
    menuPanel.classList.remove('hidden');
    menuButton.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
}

/**
 * Closes the hamburger menu panel and updates button state/ARIA.
 * @param {HTMLElement} menuPanel - The menu panel to hide
 * @param {HTMLButtonElement} menuButton - The toggle button to update
 * @returns {void}
 */
function closeHamburgerMenu(menuPanel, menuButton) {
    menuPanel.classList.add('hidden');
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
}

/**
 * Toggles the hamburger menu open/closed based on current visibility.
 * @param {HTMLElement} menuPanel - The menu panel to toggle
 * @param {HTMLButtonElement} menuButton - The toggle button to update
 * @returns {void}
 */
function toggleHamburgerMenu(menuPanel, menuButton) {
    const isHidden = menuPanel.classList.contains('hidden');
    if (isHidden) openHamburgerMenu(menuPanel, menuButton);
    else closeHamburgerMenu(menuPanel, menuButton);
}

/**
 * Handles clicks on the hamburger button: prevents event bubbling
 * and toggles the menu panel.
 * @param {MouseEvent} event - The click event
 * @param {HTMLElement} menuPanel - The menu panel
 * @param {HTMLButtonElement} menuButton - The toggle button
 * @returns {void}
 */
function handleMenuButtonClick(event, menuPanel, menuButton) {
    event.stopPropagation();
    toggleHamburgerMenu(menuPanel, menuButton);
}

/**
 * Handles document-level clicks to close the menu when clicking outside.
 * @param {MouseEvent} event - The click event
 * @param {HTMLElement} menuRoot - The menu root container
 * @param {HTMLElement} menuPanel - The menu panel
 * @param {HTMLButtonElement} menuButton - The toggle button
 * @returns {void}
 */
function handleDocumentClick(event, menuRoot, menuPanel, menuButton) {
    const clickedInside = menuRoot.contains(event.target);
    if (!clickedInside) closeHamburgerMenu(menuPanel, menuButton);
}

/**
 * Attaches click handlers to all anchor links within the menu panel
 * to automatically close the panel after navigation.
 * @param {HTMLElement} menuPanel - The menu panel containing links
 * @param {HTMLButtonElement} menuButton - The toggle button to update
 * @returns {void}
 */
function attachLinkCloseHandlers(menuPanel, menuButton) {
    const links = menuPanel.querySelectorAll('a');
    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function () { closeHamburgerMenu(menuPanel, menuButton); });
    }
}