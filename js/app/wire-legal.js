/**
 * Removes the "hidden" class from an overlay.
 * @param {HTMLElement} el Target overlay element.
 * @returns {void}
 */
function showLegalOverlay(el) {
    hideLegalOverlays();
    if (el) el.classList.remove('hidden');
}

/**
 * Adds "hidden" to all legal overlays.
 * @returns {void}
 */
function hideLegalOverlays() {
    ['terms-overlay', 'privacy-overlay', 'imprint-overlay'].forEach(id => {
        const n = document.getElementById(id);
        if (n) n.classList.add('hidden');
    });
}

/**
 * Closes hamburger menu if it is open.
 * @returns {void}
 */
function closeHamburgerIfOpen() {
    const p = document.getElementById('hamburger-menu');
    const b = document.getElementById('hamburger-button');
    if (p && b && !p.classList.contains('hidden') && typeof closeHamburgerMenu === 'function') {
        closeHamburgerMenu(p, b);
    }
}

/**
 * Binds a click to open a specific overlay from a trigger element.
 * @param {string} triggerId Element ID of the trigger (e.g., "menu-legal-terms").
 * @param {string} overlayId Overlay ID to open (e.g., "terms-overlay").
 * @returns {void}
 */
function bindLegalOpen(triggerId, overlayId) {
    const a = document.getElementById(triggerId);
    const o = document.getElementById(overlayId);
    if (!a || !o) return;
    a.addEventListener('click', e => { e.preventDefault(); closeHamburgerIfOpen(); showLegalOverlay(o); });
}

/**
 * Wires all open/close handlers for legal overlays.
 * @returns {void}
 */
function wireLegal() {
    const map = [
        ['menu-legal-terms', 'terms-overlay'], ['menu-legal-privacy', 'privacy-overlay'], ['menu-legal-imprint', 'imprint-overlay'],
        ['home-legal-terms', 'terms-overlay'], ['home-legal-privacy', 'privacy-overlay'], ['home-legal-imprint', 'imprint-overlay']
    ];
    map.forEach(([aId, oId]) => bindLegalOpen(aId, oId));
    ['terms-close', 'privacy-close', 'imprint-close'].forEach(id => {
        const c = document.getElementById(id);
        if (c) c.addEventListener('click', hideLegalOverlays);
    });
}

/**
 * Binds outside-click to close for one overlay.
 * @param {string} overlayId Overlay element ID.
 * @param {string} contentSelectors Selector(s) that count as "inside content".
 * @returns {void}
 */
function bindOutsideClose(overlayId, contentSelectors) {
    const o = document.getElementById(overlayId);
    if (!o) return;
    o.addEventListener('mousedown', e => {
        const c = o.querySelector(contentSelectors);
        if (!c || !c.contains(e.target)) hideLegalOverlays();
    });
}

/**
 * Wires outside-click close for all overlays.
 * @returns {void}
 */
function wireLegalOutsideClose() {
    const sels = '#legal-terms-content,#legal-privacy-content,#legal-imprint-content,#legal-content';
    ['terms-overlay', 'privacy-overlay', 'imprint-overlay'].forEach(id => bindOutsideClose(id, sels));
}

/**
 * Renders a template into the first matching target if available.
 * @param {string} selector CSS selector for target node(s).
 * @param {Function} tplFn Template function returning HTML string.
 * @returns {boolean} True if ready or not needed; false if waiting.
 */
function renderIfPossible(selector, tplFn) {
    const n = document.querySelector(selector);
    if (!n) return true;
    if (n.dataset.filled) return true;
    if (typeof tplFn === 'function') { n.innerHTML = tplFn(); n.dataset.filled = '1'; return true; }
    return false;
}

/**
 * Ensures Terms template is rendered if target exists.
 * @returns {boolean} Ready state.
 */
function renderTermsIfPossible() {
    return renderIfPossible('#legal-terms-content, #terms-overlay #legal-content', templateLegalTerms);
}

/**
 * Ensures Privacy template is rendered if target exists.
 * @returns {boolean} Ready state.
 */
function renderPrivacyIfPossible() {
    return renderIfPossible('#legal-privacy-content, #privacy-overlay #legal-content', templateLegalPrivacy);
}

/**
 * Ensures Imprint template is rendered if target exists.
 * @returns {boolean} Ready state.
 */
function renderImprintIfPossible() {
    return renderIfPossible('#legal-imprint-content, #imprint-overlay #legal-content', templateLegalImprint);
}

/**
 * Boots legal overlays after DOM is ready, with a short retry loop.
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    let tries = 10;
    const tick = () => {
        const ready = renderTermsIfPossible() && renderPrivacyIfPossible() && renderImprintIfPossible();
        if (ready) { wireLegal(); wireLegalOutsideClose(); return; }
        if (tries-- > 0) setTimeout(tick, 50);
    };
    tick();
});