/**
 * Wires the small inline mute/unmute button left of the hamburger.
 * Keeps the icon and accessibility state in sync by:
 * - toggling the CSS class "is-muted"
 * - setting aria-pressed to "true"/"false"
 * - updating the title to "Mute"/"Unmute"
 * Relies on global isMuted(), toggleMuteGlobal(), and the "app-mute-changed" event.
 *
 * @param {object} app - Application context (not used here)
 * @returns {void}
 */
function wireMuteInline(app) {
    const btn = document.getElementById('btn-mute-inline');
    if (!btn) return;
    function sync() {
        const on = isMuted();
        btn.classList.toggle('is-muted', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.title = on ? 'Unmute' : 'Mute';
    }
    btn.addEventListener('click', ev => {
        ev.preventDefault();
        toggleMuteGlobal();
    });
    window.addEventListener('app-mute-changed', sync);
    sync();
}