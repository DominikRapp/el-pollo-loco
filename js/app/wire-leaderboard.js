/**
 * Initializes and wires the Leaderboard overlay UI:
 * sets initial state, finds elements, and attaches handlers.
 * No-op if required elements are missing.
 * @param {object} app - The application context
 * @returns {void}
 */
function wireLeaderboardOverlay(app) {
    initializeLeaderboardState(app);
    const elements = getLeaderboardElements();
    if (!elements) return;
    attachLeaderboardHandlers(app, elements);
}

/**
 * Prepares the leaderboard state on the app:
 * - app.leaderboardPages = []
 * - app.currentLeaderboardPage = 0
 * @param {object} app - The application context
 * @returns {void}
 */
function initializeLeaderboardState(app) {
    app.leaderboardPages = [];
    app.currentLeaderboardPage = 0;
}

/**
 * Queries and returns all required DOM elements for the leaderboard overlay,
 * or null if any are missing.
 * @returns {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement} | null}
 */
function getLeaderboardElements() {
    const overlay = document.getElementById('leaderboard-overlay');
    const box = overlay ? overlay.querySelector('.overlay-box') : null;
    const content = document.getElementById('leaderboard-content');
    const prevBtn = document.getElementById('leaderboard-prev');
    const nextBtn = document.getElementById('leaderboard-next');
    const pageIndicator = document.getElementById('leaderboard-page-indicator');
    const closeBtn = document.getElementById('leaderboard-close');
    if (!overlay || !box || !content || !prevBtn || !nextBtn || !pageIndicator || !closeBtn) return null;
    return { overlay, content, prevBtn, nextBtn, pageIndicator, closeBtn };
}

/**
 * Renders a specific leaderboard page by index, clamps the index,
 * updates controls and scroll position.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Overlay elements
 * @param {number} index - Target page index (0-based)
 * @returns {void}
 */
function renderLeaderboardPage(app, elements, index) {
    const total = app.leaderboardPages.length;
    const target = Math.max(0, Math.min(index, total - 1));
    app.currentLeaderboardPage = target;
    elements.content.innerHTML = app.leaderboardPages[target] || '<p>No data.</p>';
    elements.pageIndicator.textContent = 'Page ' + (target + 1) + ' of ' + total;
    elements.prevBtn.disabled = target === 0;
    elements.nextBtn.disabled = target === total - 1;
    elements.overlay.scrollTop = 0;
}

/**
 * Ensures the Leaderboard overlay is the only open overlay by hiding
 * others and suppressing win/lose overlays.
 * @param {object} app - The application context
 * @returns {void}
 */
function ensureExclusiveOpen(app) {
    app.hideWinLoseOverlays();
    const others = [
        document.getElementById('instructions-overlay'),
        document.getElementById('settings-overlay'),
        document.getElementById('start-screen')
    ];
    for (let i = 0; i < others.length; i++) {
        const el = others[i];
        if (el) el.classList.add('hidden');
    }
}

/**
 * Asynchronously loads leaderboard pages and renders the first page.
 * Shows a loading indicator and a fallback message on failure.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Overlay elements
 * @returns {Promise<void>}
 */
async function loadLeaderboardPages(app, elements) {
    elements.content.innerHTML = '<p>Loading…</p>';
    try {
        const pages = await LeaderboardView.buildPages();
        app.leaderboardPages = pages;
        renderLeaderboardPage(app, elements, 0);
    } catch (e) {
        elements.content.innerHTML = '<p>Failed to load.</p>';
    }
}

/**
 * Opens the Leaderboard overlay, suppresses win/lose overlays,
 * optionally closes the hamburger menu, and triggers page loading.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Overlay elements
 * @returns {void}
 */
function openLeaderboardOverlay(app, elements) {
    ensureExclusiveOpen(app);
    app.suppressWinLose();
    if (typeof app.closeHamburgerMenu === 'function') app.closeHamburgerMenu();
    elements.overlay.classList.remove('hidden');
    loadLeaderboardPages(app, elements);
}

/**
 * Closes the Leaderboard overlay and restores win/lose actions.
 * If currently in MENU state, re-show the start screen.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement}} elements - Overlay container
 * @returns {void}
 */
function closeLeaderboardOverlay(app, elements) {
    elements.overlay.classList.add('hidden');
    app.restoreWinLoseActionsOnly();
    if (app.state === GameState.MENU) {
        const start = document.getElementById('start-screen');
        if (start) start.classList.remove('hidden');
    }
}

/**
 * Navigates to the previous leaderboard page if possible.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Overlay elements
 * @returns {void}
 */
function goToPreviousLeaderboardPage(app, elements) {
    if (app.currentLeaderboardPage > 0) {
        renderLeaderboardPage(app, elements, app.currentLeaderboardPage - 1);
    }
}

/**
 * Navigates to the next leaderboard page if possible.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Overlay elements
 * @returns {void}
 */
function goToNextLeaderboardPage(app, elements) {
    if (app.currentLeaderboardPage < app.leaderboardPages.length - 1) {
        renderLeaderboardPage(app, elements, app.currentLeaderboardPage + 1);
    }
}

/**
 * Attaches all handlers for opening, navigating, and closing the leaderboard overlay.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement, content: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, pageIndicator: HTMLElement, closeBtn: HTMLButtonElement}} elements - Overlay elements
 * @returns {void}
 */
function attachLeaderboardHandlers(app, elements) {
    wireLeaderboardOpenLinks(app, elements);
    wireLeaderboardNavigation(app, elements);
    wireLeaderboardOverlayClick(app, elements);
    wireLeaderboardEscapeKey(app, elements);
}

/**
 * Wires all entry points that should open the leaderboard overlay.
 * Prevents default navigation and opens the overlay.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement}} elements - Overlay elements
 * @returns {void}
 */
function wireLeaderboardOpenLinks(app, elements) {
    const openIds = ['btn-leaderboard-go', 'btn-leaderboard-victory', 'btn-leaderboard-home'];
    for (let i = 0; i < openIds.length; i++) {
        const link = document.getElementById(openIds[i]);
        if (!link) continue;
        link.addEventListener('click', function (event) {
            event.preventDefault();
            openLeaderboardOverlay(app, elements);
        });
    }
}

/**
 * Wires Previous/Next/Close buttons for page navigation and closing.
 * @param {object} app - The application context
 * @param {{prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, closeBtn: HTMLButtonElement}} elements - Overlay elements
 * @returns {void}
 */
function wireLeaderboardNavigation(app, elements) {
    elements.prevBtn.addEventListener('click', function () {
        goToPreviousLeaderboardPage(app, elements);
    });
    elements.nextBtn.addEventListener('click', function () {
        goToNextLeaderboardPage(app, elements);
    });
    elements.closeBtn.addEventListener('click', function () {
        closeLeaderboardOverlay(app, elements);
    });
}

/**
 * Closes the overlay if the user clicks on the shaded backdrop (outside the box).
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement}} elements - Overlay elements
 * @returns {void}
 */
function wireLeaderboardOverlayClick(app, elements) {
    elements.overlay.addEventListener('click', function (event) {
        if (event.target === elements.overlay) {
            closeLeaderboardOverlay(app, elements);
        }
    });
}

/**
 * Closes the overlay when the Escape key is pressed while it is open.
 * @param {object} app - The application context
 * @param {{overlay: HTMLElement}} elements - Overlay elements
 * @returns {void}
 */
function wireLeaderboardEscapeKey(app, elements) {
    document.addEventListener('keydown', function (event) {
        const isOpen = !elements.overlay.classList.contains('hidden');
        if (event.key === 'Escape' && isOpen) {
            closeLeaderboardOverlay(app, elements);
        }
    });
}