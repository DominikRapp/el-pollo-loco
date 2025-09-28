/** Checks if the current browser is Firefox. */
function isFirefox() {
    return /firefox/i.test(navigator.userAgent);
}

/** Returns the current viewport width in CSS pixels. */
function getViewportWidth() {
    return window.innerWidth;
}

/** Returns the current viewport height in CSS pixels. */
function getViewportHeight() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
}

/**
 * Computes the UI scale relative to a base size, clamped to a max of 1.
 * Uses the smaller ratio to preserve aspect on both axes.
 */
function computeScale(baseW, baseH, vw, vh) {
    const rw = vw / baseW;
    const rh = vh / baseH;
    const s = Math.min(rw, rh);
    return s > 1 ? 1 : s;
}

/** Applies the given scale to the CSS custom property `--ui-scale`. */
function applyUiScale(scale) {
    document.documentElement.style.setProperty('--ui-scale', String(scale));
}

/** Recalculates and applies the current Firefox UI scale. */
function updateFirefoxScale() {
    const vw = getViewportWidth();
    const vh = getViewportHeight();
    const scale = computeScale(1080, 720, vw, vh);
    applyUiScale(scale);
}

/**
 * Initializes Firefox-specific scaling and keeps it in sync
 * on resize and orientation changes. No-ops on non-Firefox.
 */
function initFirefoxScale() {
    if (!isFirefox()) return;
    updateFirefoxScale();
    addEventListener('resize', updateFirefoxScale);
    addEventListener('orientationchange', updateFirefoxScale);
}