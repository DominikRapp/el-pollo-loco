/**
 * Returns the inline mute button element.
 * @returns {HTMLElement|null}
 */
function getMuteInlineButton() {
    return document.getElementById('btn-mute-inline');
}

/**
 * Syncs the inline mute button UI state to the current mute status.
 * @param {HTMLElement} btn
 * @returns {void}
 */
function syncMuteInlineState(btn) {
    const on = isMuted();
    btn.classList.toggle('is-muted', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.title = on ? 'Unmute' : 'Mute';
}

/**
 * Attaches event handlers for toggling and external state updates.
 * @param {HTMLElement} btn
 * @returns {void}
 */
function attachMuteInlineHandlers(btn) {
    btn.addEventListener('click', ev => {
        ev.preventDefault();
        const next = !isMuted();
        setMuted(next);
        saveAndApplyAudio({ muted: next });
        window.dispatchEvent(new CustomEvent('app-mute-changed', { detail: { muted: next } }));
        syncMuteInlineState(btn);
    });
    window.addEventListener('app-mute-changed', () => syncMuteInlineState(btn));
}

/**
 * Wires the small inline mute/unmute button.
 * @param {object} app
 * @returns {void}
 */
function wireMuteInline(app) {
    const btn = getMuteInlineButton();
    if (!btn) return;
    attachMuteInlineHandlers(btn);
    syncMuteInlineState(btn);
}