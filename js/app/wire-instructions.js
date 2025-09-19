function wireInstructionsOverlay(app) {
    initializeInstructionsState(app);
    const elements = getInstructionsElements();
    if (!elements) return;
    attachInstructionsHandlers(app, elements);
}

function initializeInstructionsState(app) {
    app.instructionsPages = app.buildInstructionsPages();
    app.currentInstructionsPage = 0;
}

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

function openInstructionsOverlay(app, elements) {
    ensureExclusiveOpen(app);
    app.suppressWinLose();
    if (typeof app.closeHamburgerMenu === 'function') app.closeHamburgerMenu();
    elements.overlay.classList.remove('hidden');
    renderInstructionsPage(app, elements, 0);
}

function closeInstructionsOverlay(app, elements) {
    elements.overlay.classList.add('hidden');
    app.restoreWinLoseActionsOnly();
    if (app.state === GameState.MENU) {
        const start = document.getElementById('start-screen');
        if (start) start.classList.remove('hidden');
    }
}

function goToPreviousPage(app, elements) {
    if (app.currentInstructionsPage > 0) {
        renderInstructionsPage(app, elements, app.currentInstructionsPage - 1);
    }
}

function goToNextPage(app, elements) {
    if (app.currentInstructionsPage < app.instructionsPages.length - 1) {
        renderInstructionsPage(app, elements, app.currentInstructionsPage + 1);
    }
}

function attachInstructionsHandlers(app, elements) {
    wireOpenLinks(app, elements);
    wireNavigationButtons(app, elements);
    wireOverlayClickToClose(app, elements);
    wireEscapeKeyToClose(app, elements);
}

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

function wireOverlayClickToClose(app, elements) {
    elements.overlay.addEventListener('click', function (event) {
        if (event.target === elements.overlay) {
            closeInstructionsOverlay(app, elements);
        }
    });
}

function wireEscapeKeyToClose(app, elements) {
    document.addEventListener('keydown', function (event) {
        const isOpen = !elements.overlay.classList.contains('hidden');
        if (event.key === 'Escape' && isOpen) {
            closeInstructionsOverlay(app, elements);
        }
    });
}