/**
 * Initializes and wires the Instructions overlay UI:
 * builds pages, caches elements, and attaches all handlers.
 * No-op if required elements are missing.
 * @param {object} app - The application context
 * @returns {void}
 */
function wireInstructionsOverlay(app) {
    initializeInstructionsState(app);
    const elements = getInstructionsElements();
    if (!elements) return;
    attachInstructionsHandlers(app, elements);
}

/**
 * Prepares the instructions state on the app:
 * - app.instructionsPages from app.buildInstructionsPages()
 * - app.currentInstructionsPage = 0
 * @param {object} app - The application context
 * @returns {void}
 */
function initializeInstructionsState(app) {
    app.instructionsPages = app.buildInstructionsPages();
    app.currentInstructionsPage = 0;
}

/**
 * Queries and returns all required DOM elements for the overlay,
 * or null if any are missing.
 * @returns {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement} | null}
 */
function getInstructionsElements() {
    const overlay = document.getElementById('instructions-overlay');
    const box = overlay ? overlay.querySelector('.overlay-box') : null;
    const content = document.getElementById('instructions-content');
    const prevBtn = document.getElementById('instructions-prev');
    const nextBtn = document.getElementById('instructions-next');
    const pageIndicator = document.getElementById('instructions-page-indicator');
    const closeBtn = document.getElementById('instructions-close');
    if (!overlay || !box || !content || !prevBtn || !nextBtn || !pageIndicator || !closeBtn) return null;
    return { overlay, content, prevBtn, nextBtn, pageIndicator, closeBtn };
}

/**
 * Renders a specific instructions page by index, clamps the index,
 * updates controls and scroll position.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Required overlay elements
 * @param {number} index - Target page index (0-based)
 * @returns {void}
 */
function renderInstructionsPage(app, elements, index) {
    const total = app.instructionsPages.length;
    const target = Math.max(0, Math.min(index, total - 1));
    app.currentInstructionsPage = target;
    elements.content.innerHTML = app.instructionsPages[target];
    elements.pageIndicator.textContent = 'Page ' + (target + 1) + ' of ' + total;
    elements.prevBtn.disabled = target === 0;
    elements.nextBtn.disabled = target === total - 1;
    elements.overlay.scrollTop = 0;
}

/**
 * Ensures the Instructions overlay is the only open overlay by hiding
 * others and suppressing win/lose overlays.
 * @param {object} app - The application context
 * @returns {void}
 */
function ensureExclusiveOpen(app) {
    app.hideWinLoseOverlays();
    const others = [
        document.getElementById('leaderboard-overlay'),
        document.getElementById('settings-overlay'),
        document.getElementById('start-screen')
    ];
    for (let i = 0; i < others.length; i++) {
        const el = others[i];
        if (el) el.classList.add('hidden');
    }
}

/**
 * Opens the Instructions overlay, suppresses win/lose overlays,
 * optionally closes the hamburger menu, and renders the first page.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Required overlay elements
 * @returns {void}
 */
function openInstructionsOverlay(app, elements) {
    ensureExclusiveOpen(app);
    app.suppressWinLose();
    if (typeof app.closeHamburgerMenu === 'function') app.closeHamburgerMenu();
    elements.overlay.classList.remove('hidden');
    renderInstructionsPage(app, elements, 0);
}

/**
 * Closes the Instructions overlay and restores win/lose actions.
 * If currently in MENU state, re-show the start screen.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Required overlay elements
 * @returns {void}
 */
function closeInstructionsOverlay(app, elements) {
    elements.overlay.classList.add('hidden');
    app.restoreWinLoseActionsOnly();
    if (app.state === GameState.MENU) {
        const start = document.getElementById('start-screen');
        if (start) start.classList.remove('hidden');
    }
}

/**
 * Navigates to the previous instructions page if possible.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Required overlay elements
 * @returns {void}
 */
function goToPreviousPage(app, elements) {
    if (app.currentInstructionsPage > 0) {
        renderInstructionsPage(app, elements, app.currentInstructionsPage - 1);
    }
}

/**
 * Navigates to the next instructions page if possible.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Required overlay elements
 * @returns {void}
 */
function goToNextPage(app, elements) {
    if (app.currentInstructionsPage < app.instructionsPages.length - 1) {
        renderInstructionsPage(app, elements, app.currentInstructionsPage + 1);
    }
}

/**
 * Attaches all handlers for opening, navigating, and closing the overlay.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Required overlay elements
 * @returns {void}
 */
function attachInstructionsHandlers(app, elements) {
    wireOpenLinks(app, elements);
    wireNavigationButtons(app, elements);
    wireOverlayClickToClose(app, elements);
    wireEscapeKeyToClose(app, elements);
}

/**
 * Wires all open-entry points that should display the instructions overlay.
 * Prevents default navigation and opens the overlay.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Required overlay elements
 * @returns {void}
 */
function wireOpenLinks(app, elements) {
    const openIds = ['btn-instructions-go', 'btn-instructions-victory', 'menu-instructions', 'btn-instructions-home'];
    for (let i = 0; i < openIds.length; i++) {
        const link = document.getElementById(openIds[i]);
        if (!link) continue;
        link.addEventListener('click', function (event) {
            event.preventDefault();
            openInstructionsOverlay(app, elements);
        });
    }
}

/**
 * Wires the Previous/Next/Close buttons for page navigation and closing.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Required overlay elements
 * @returns {void}
 */
function wireNavigationButtons(app, elements) {
    elements.prevBtn.addEventListener('click', function () {
        goToPreviousPage(app, elements);
    });
    elements.nextBtn.addEventListener('click', function () {
        goToNextPage(app, elements);
    });
    elements.closeBtn.addEventListener('click', function () {
        closeInstructionsOverlay(app, elements);
    });
}

/**
 * Closes the overlay if the user clicks on the shaded backdrop (outside the box).
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Required overlay elements
 * @returns {void}
 */
function wireOverlayClickToClose(app, elements) {
    elements.overlay.addEventListener('click', function (event) {
        if (event.target === elements.overlay) {
            closeInstructionsOverlay(app, elements);
        }
    });
}

/**
 * Closes the overlay when the Escape key is pressed while it is open.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Required overlay elements
 * @returns {void}
 */
function wireEscapeKeyToClose(app, elements) {
    document.addEventListener('keydown', function (event) {
        const isOpen = !elements.overlay.classList.contains('hidden');
        if (event.key === 'Escape' && isOpen) {
            closeInstructionsOverlay(app, elements);
        }
    });
}