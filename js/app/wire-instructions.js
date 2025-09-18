function wireInstructionsOverlay(app) {
    app.instructionsPages = app.buildInstructionsPages();
    app.currentInstructionsPage = 0;

    const overlay = document.getElementById('instructions-overlay');
    const box = overlay ? overlay.querySelector('.overlay-box') : null;
    const content = document.getElementById('instructions-content');
    const prevBtn = document.getElementById('instructions-prev');
    const nextBtn = document.getElementById('instructions-next');
    const pageIndicator = document.getElementById('instructions-page-indicator');
    const closeBtn = document.getElementById('instructions-close');

    if (!overlay || !box || !content || !prevBtn || !nextBtn || !pageIndicator || !closeBtn) {
        return;
    }

    const renderPage = (index) => {
        const total = app.instructionsPages.length;
        const target = Math.max(0, Math.min(index, total - 1));
        app.currentInstructionsPage = target;
        content.innerHTML = app.instructionsPages[target];
        pageIndicator.textContent = 'Page ' + (target + 1) + ' of ' + total;
        prevBtn.disabled = target === 0;
        nextBtn.disabled = target === total - 1;
        overlay.scrollTop = 0;
    };

    const ensureExclusiveOpen = () => {
        app.hideWinLoseOverlays();
        const others = [
            document.getElementById('leaderboard-overlay'),
            document.getElementById('settings-overlay'),
            document.getElementById('start-screen')
        ];
        for (const el of others) { if (el) el.classList.add('hidden'); }
    };

    const openOverlay = () => {
        ensureExclusiveOpen();
        app.suppressWinLose();
        if (typeof app.closeHamburgerMenu === 'function') app.closeHamburgerMenu();
        overlay.classList.remove('hidden');
        renderPage(0);
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
        if (app.currentInstructionsPage > 0) renderPage(app.currentInstructionsPage - 1);
    };

    const goNext = () => {
        if (app.currentInstructionsPage < app.instructionsPages.length - 1) renderPage(app.currentInstructionsPage + 1);
    };

    const openLinks = [
        document.getElementById('btn-instructions-go'),
        document.getElementById('btn-instructions-victory'),
        document.getElementById('menu-instructions'),
        document.getElementById('btn-instructions-home')
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
