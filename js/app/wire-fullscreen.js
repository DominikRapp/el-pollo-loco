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
 * Updates the visual state of any number of fullscreen toggle buttons
 * so they match whether `root` is currently in fullscreen.
 * - Sets `aria-pressed` to "true"/"false"
 * - Toggles the CSS class `is-on`
 * (It does not change any text content.)
 *
 * @param {HTMLElement} root - The element whose fullscreen state is tracked
 * @param {...(HTMLButtonElement|null)} buttons - One or more buttons to update
 * @returns {void}
 */
function updateFullscreenButtons(root, ...buttons) {
    const on = isFullscreen(root);
    const setBtn = b => {
        if (!b) return;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.classList.toggle('is-on', on);
    };
    buttons.forEach(setBtn);
}

/**
 * Toggles fullscreen for `root` and, once the async operation finishes,
 * updates any provided toggle buttons.
 * - Prevents default on the triggering event (if present).
 * - Uses Promise.finally() when available; otherwise schedules a microtask via setTimeout(0).
 *
 * @param {Event|null} event - The user event that initiated the toggle
 * @param {HTMLElement} root - The element to enter/exit fullscreen on
 * @param {...(HTMLButtonElement|null)} buttons - One or more buttons to sync after the change
 * @returns {void}
 */
function toggleFullscreen(event, root, ...buttons) {
    if (event) event.preventDefault();
    if (!canFullscreen(root)) return;
    const done = () => updateFullscreenButtons(root, ...buttons);
    if (isFullscreen(root)) {
        const p = exitFullscreen();
        if (p && p.finally) p.finally(done); else setTimeout(done, 0);
    } else {
        const p = enterFullscreen(root);
        if (p && p.finally) p.finally(done); else setTimeout(done, 0);
    }
}

/**
 * Wires up fullscreen toggling for the app.
 * Single responsibility: kick off the wiring process.
 *
 * @param {object} app - Application context (unused, kept for API symmetry)
 * @returns {void}
 */
function wireFullscreenToggle() {
    const { root, btnHome, btnGo, btnVictory, btnInline } = getFullscreenElements();
    attachFullscreenWiring(root, btnHome, btnGo, btnVictory, btnInline);
}

/**
 * Collects all DOM elements used for fullscreen controls.
 * Single responsibility: gather references.
 *
 * @returns {{root: HTMLElement|null, btnHome: HTMLElement|null, btnGo: HTMLElement|null, btnVictory: HTMLElement|null, btnInline: HTMLElement|null}}
 */
function getFullscreenElements() {
    const root = document.getElementById('game-root');
    return {
        root,
        btnHome: document.getElementById('btn-fullscreen-home'),
        btnGo: document.getElementById('btn-fullscreen-go'),
        btnVictory: document.getElementById('btn-fullscreen-victory'),
        btnInline: document.getElementById('btn-fullscreen-inline')
    };
}

/**
 * Attaches event listeners to buttons and syncs UI on fullscreen state changes.
 * Single responsibility: wire events + keep UI updated.
 *
 * @param {HTMLElement|null} root
 * @param {HTMLElement|null} btnHome
 * @param {HTMLElement|null} btnGo
 * @param {HTMLElement|null} btnVictory
 * @param {HTMLElement|null} btnInline
 * @returns {void}
 */
function attachFullscreenWiring(root, btnHome, btnGo, btnVictory, btnInline) {
    if (!root) return;
    const handler = ev => toggleFullscreen(ev, root, btnHome, btnGo, btnVictory, btnInline);
    [btnHome, btnGo, btnVictory, btnInline].forEach(b => b && b.addEventListener('click', handler));
    const upd = () => updateFullscreenButtons(root, btnHome, btnGo, btnVictory, btnInline);
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange', 'msfullscreenchange', 'fullscreenerror', 'webkitfullscreenerror'].forEach(t => document.addEventListener(t, upd));
    upd();
}