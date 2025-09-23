/**
 * Checks whether the given root element is currently in fullscreen mode.
 * Supports standard and vendor-prefixed fullscreen APIs.
 * @param {HTMLElement} root - The root element to check
 * @returns {boolean} True if the element is the active fullscreen element
 */
function isFullscreen(root) {
    return document.fullscreenElement === root || document.webkitFullscreenElement === root || document.msFullscreenElement === root || document.mozFullScreenElement === root;
}

/**
 * Determines whether the given element can enter fullscreen using
 * any supported (standard or prefixed) API.
 * @param {HTMLElement} root - The element to test
 * @returns {boolean} True if a fullscreen request method is available
 */
function canFullscreen(root) {
    return !!(root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen || root.mozRequestFullScreen);
}

/**
 * Requests fullscreen on the given element using the first available method.
 * @param {HTMLElement} root - The element to make fullscreen
 * @returns {Promise<void>|undefined} A promise in modern browsers; undefined in older prefixed implementations
 */
function enterFullscreen(root) {
    if (root.requestFullscreen) return root.requestFullscreen();
    if (root.webkitRequestFullscreen) return root.webkitRequestFullscreen();
    if (root.msRequestFullscreen) return root.msRequestFullscreen();
    if (root.mozRequestFullScreen) return root.mozRequestFullScreen();
}

/**
 * Exits fullscreen using the first available method.
 * @returns {Promise<void>|undefined} A promise in modern browsers; undefined in older prefixed implementations
 */
function exitFullscreen() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    if (document.msExitFullscreen) return document.msExitFullscreen();
    if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
}

/**
 * Updates the UI state of one or more fullscreen toggle buttons to reflect
 * the current fullscreen status of the root element.
 * @param {HTMLElement} root - The root element being toggled
 * @param {HTMLButtonElement|null} btnHome - Optional button on the home screen
 * @param {HTMLButtonElement|null} btnGo - Optional in-game button
 * @param {HTMLButtonElement|null} btnVictory - Optional victory screen button
 * @returns {void}
 */
function updateFullscreenButtons(root, btnHome, btnGo, btnVictory) {
    const on = isFullscreen(root);
    const setBtn = b => {
        if (!b) return;
        b.textContent = 'Fullscreen';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.classList.toggle('is-on', on);
    };
    setBtn(btnHome);
    setBtn(btnGo);
    setBtn(btnVictory);
}

/**
 * Toggles fullscreen for the given root element and updates buttons afterwards.
 * Uses promises when available; falls back to a microtask via setTimeout(0).
 * @param {Event|null} event - Click or user event that initiated the toggle
 * @param {HTMLElement} root - The root element to toggle fullscreen on
 * @param {HTMLButtonElement|null} btnHome - Optional home button
 * @param {HTMLButtonElement|null} btnGo - Optional in-game button
 * @param {HTMLButtonElement|null} btnVictory - Optional victory button
 * @returns {void}
 */
function toggleFullscreen(event, root, btnHome, btnGo, btnVictory) {
    if (event) event.preventDefault();
    if (!canFullscreen(root)) return;
    const done = () => updateFullscreenButtons(root, btnHome, btnGo, btnVictory);
    if (isFullscreen(root)) {
        const p = exitFullscreen();
        if (p && p.finally) p.finally(done); else setTimeout(done, 0);
    } else {
        const p = enterFullscreen(root);
        if (p && p.finally) p.finally(done); else setTimeout(done, 0);
    }
}

/**
 * Wires up the fullscreen toggle for the app:
 * - Binds click handlers to available buttons
 * - Subscribes to fullscreenchange events (including prefixed variants)
 * - Initializes the button state
 * @param {object} app - The application context (unused here but kept for symmetry)
 * @returns {void}
 */
function wireFullscreenToggle(app) {
    const root = document.getElementById('game-root');
    const btnHome = document.getElementById('btn-fullscreen-home');
    const btnGo = document.getElementById('btn-fullscreen-go');
    const btnVictory = document.getElementById('btn-fullscreen-victory');
    if (!root) return;
    const handler = ev => toggleFullscreen(ev, root, btnHome, btnGo, btnVictory);
    if (btnHome) btnHome.addEventListener('click', handler);
    if (btnGo) btnGo.addEventListener('click', handler);
    if (btnVictory) btnVictory.addEventListener('click', handler);
    const upd = () => updateFullscreenButtons(root, btnHome, btnGo, btnVictory);
    ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange', 'mozfullscreenchange'].forEach(t => document.addEventListener(t, upd));
    upd();
}