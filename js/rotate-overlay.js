/**
 * Initializes the rotate overlay: sets initial state and
 * keeps it in sync on DOM ready, resize, and orientation changes.
 * @returns {void}
 */
function initRotateOverlay() {
    const apply = () => updateRotateOverlay();
    document.addEventListener('DOMContentLoaded', apply);
    addEventListener('resize', apply);
    addEventListener('orientationchange', apply);
    apply();
}

/** Returns the #rotate-overlay element or null if missing. */
function getRotateOverlay() {
    return document.getElementById('rotate-overlay');
}

/** Detects touch-capable, coarse-pointer devices (e.g., phones/tablets). */
function isTouchDevice() {
    return matchMedia('(hover: none) and (pointer: coarse)').matches;
}

/** Detects current portrait orientation. */
function isPortrait() {
    return matchMedia('(orientation: portrait)').matches;
}

/** Shows or hides the overlay and updates aria-hidden accordingly. */
function setOverlayVisibility(overlay, show) {
    overlay.style.display = show ? 'flex' : 'none';
    overlay.setAttribute('aria-hidden', String(!show));
}

/** Calculates whether the overlay should be visible and applies it. */
function updateRotateOverlay() {
    const overlay = getRotateOverlay();
    if (!overlay) return;
    const show = isTouchDevice() && isPortrait();
    setOverlayVisibility(overlay, show);
}