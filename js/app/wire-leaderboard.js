function wireLeaderboardOverlay(app) {
    app.leaderboardPages = [];
    app.currentLeaderboardPage = 0;

    const overlay = document.getElementById('leaderboard-overlay');
    const box = overlay ? overlay.querySelector('.overlay-box') : null;
    const content = document.getElementById('leaderboard-content');
    const prevBtn = document.getElementById('leaderboard-prev');
    const nextBtn = document.getElementById('leaderboard-next');
    const pageIndicator = document.getElementById('leaderboard-page-indicator');
    const closeBtn = document.getElementById('leaderboard-close');

    if (!overlay || !box || !content || !prevBtn || !nextBtn || !pageIndicator || !closeBtn) {
        return;
    }

    const renderPage = (index) => {
        const total = app.leaderboardPages.length;
        const target = Math.max(0, Math.min(index, total - 1));
        app.currentLeaderboardPage = target;
        content.innerHTML = app.leaderboardPages[target] || '<p>No data.</p>';
        pageIndicator.textContent = 'Page ' + (target + 1) + ' of ' + total;
        prevBtn.disabled = target === 0;
        nextBtn.disabled = target === total - 1;
        overlay.scrollTop = 0;
    };

    const ensureExclusiveOpen = () => {
        app.hideWinLoseOverlays();
        const others = [
            document.getElementById('instructions-overlay'),
            document.getElementById('settings-overlay'),
            document.getElementById('start-screen')
        ];
        for (const el of others) { if (el) el.classList.add('hidden'); }
    };

    const loadPages = async () => {
        content.innerHTML = '<p>Loading…</p>';
        try {
            const pages = await LeaderboardView.buildPages();
            app.leaderboardPages = pages;
            renderPage(0);
        } catch (e) {
            content.innerHTML = '<p>Failed to load.</p>';
        }
    };

    const openOverlay = () => {
        ensureExclusiveOpen();
        app.suppressWinLose();
        if (typeof app.closeHamburgerMenu === 'function') app.closeHamburgerMenu();
        overlay.classList.remove('hidden');
        loadPages();
    };

    const closeOverlay = () => {
        overlay.classList.add('hidden');
        app.restoreWinLoseActionsOnly();
        if (app.state === GameState.MENU) {
            const start = document.getElementById('start-screen');
            if (start) start.classList.remove('hidden');
        }
    };

    const goPrev = () => {
        if (app.currentLeaderboardPage > 0) renderPage(app.currentLeaderboardPage - 1);
    };

    const goNext = () => {
        if (app.currentLeaderboardPage < app.leaderboardPages.length - 1) renderPage(app.currentLeaderboardPage + 1);
    };

    const openLinks = [
        document.getElementById('btn-leaderboard-go'),
        document.getElementById('btn-leaderboard-victory'),
        document.getElementById('btn-leaderboard-home')
    ];
    openLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                openOverlay();
            });
        }
    });

    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);
    closeBtn.addEventListener('click', closeOverlay);

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) closeOverlay();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !overlay.classList.contains('hidden')) closeOverlay();
    });
}
