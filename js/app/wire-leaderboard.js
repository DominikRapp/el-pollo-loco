function wireLeaderboardOverlay(app) {
    initializeLeaderboardState(app);
    const elements = getLeaderboardElements();
    if (!elements) return;
    attachLeaderboardHandlers(app, elements);
}

function initializeLeaderboardState(app) {
    app.leaderboardPages = [];
    app.currentLeaderboardPage = 0;
}

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

function openLeaderboardOverlay(app, elements) {
    ensureExclusiveOpen(app);
    app.suppressWinLose();
    if (typeof app.closeHamburgerMenu === 'function') app.closeHamburgerMenu();
    elements.overlay.classList.remove('hidden');
    loadLeaderboardPages(app, elements);
}

function closeLeaderboardOverlay(app, elements) {
    elements.overlay.classList.add('hidden');
    app.restoreWinLoseActionsOnly();
    if (app.state === GameState.MENU) {
        const start = document.getElementById('start-screen');
        if (start) start.classList.remove('hidden');
    }
}

function goToPreviousLeaderboardPage(app, elements) {
    if (app.currentLeaderboardPage > 0) {
        renderLeaderboardPage(app, elements, app.currentLeaderboardPage - 1);
    }
}

function goToNextLeaderboardPage(app, elements) {
    if (app.currentLeaderboardPage < app.leaderboardPages.length - 1) {
        renderLeaderboardPage(app, elements, app.currentLeaderboardPage + 1);
    }
}

function attachLeaderboardHandlers(app, elements) {
    wireLeaderboardOpenLinks(app, elements);
    wireLeaderboardNavigation(app, elements);
    wireLeaderboardOverlayClick(app, elements);
    wireLeaderboardEscapeKey(app, elements);
}

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

function wireLeaderboardOverlayClick(app, elements) {
    elements.overlay.addEventListener('click', function (event) {
        if (event.target === elements.overlay) {
            closeLeaderboardOverlay(app, elements);
        }
    });
}

function wireLeaderboardEscapeKey(app, elements) {
    document.addEventListener('keydown', function (event) {
        const isOpen = !elements.overlay.classList.contains('hidden');
        if (event.key === 'Escape' && isOpen) {
            closeLeaderboardOverlay(app, elements);
        }
    });
}

