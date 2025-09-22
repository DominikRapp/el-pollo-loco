/**
 * Wires the settings overlay: collects DOM refs and attaches open/close handlers.
 * @param {object} app - The game/app instance exposing UI helpers (e.g., hideWinLoseOverlays)
 */
function wireSettingsOverlay(app) {
    const elements = getSettingsElements();
    if (!elements) return;
    attachSettingsOpenLinks(app, elements);
    attachSettingsCloseHandlers(app, elements);
}

/**
 * Resolves and validates all required DOM elements for the settings overlay.
 * @returns {{overlay: HTMLElement, content: HTMLElement, closeBtn: HTMLButtonElement}|null}
 * Returns null if required elements are missing.
 */
function getSettingsElements() {
    const overlay = document.getElementById('settings-overlay');
    const content = document.getElementById('settings-content');
    const closeBtn = document.getElementById('settings-close');
    if (!overlay || !content || !closeBtn) return null;
    return { overlay, content, closeBtn };
}

/**
 * Ensures only the settings overlay is visible by hiding other overlays/screens.
 * @param {object} app - The game/app instance
 */
function ensureSettingsExclusiveOpen(app) {
    app.hideWinLoseOverlays();
    const others = [
        document.getElementById('instructions-overlay'),
        document.getElementById('leaderboard-overlay'),
        document.getElementById('start-screen')
    ];
    for (let i = 0; i < others.length; i++) {
        const el = others[i];
        if (el) el.classList.add('hidden');
    }
}

/**
 * Converts a number in [0..1] to a rounded percentage integer [0..100].
 * Clamps input to [0..1].
 * @param {number} x - Value in 0..1
 * @returns {number} Percentage in 0..100
 */
function percentFrom01(x) {
    return Math.round(Math.max(0, Math.min(1, Number(x || 0))) * 100);
}

/**
 * Converts a percentage [0..100] to a 0..1 value.
 * Clamps input to [0..100].
 * @param {number} n - Percentage number
 * @returns {number} Value in 0..1
 */
function to01FromPercent(n) {
    return Math.max(0, Math.min(1, Number(n || 0) / 100));
}

/**
 * Renders the settings UI controls and wires interactive handlers.
 * @param {HTMLElement} content - The content container where settings are rendered
 */
function renderSettingsControls(content) {
    const state = AudioPrefs.load();
    renderSettingsContent(content, state);
    const refs = getSettingsControlRefs(content);
    wireMuteToggle(refs);
    wireSliders(refs);
}

/**
 * Injects the settings HTML using the provided state.
 * @param {HTMLElement} content - The content container
 * @param {object} st - Settings state used by the template
 */
function renderSettingsContent(content, st) {
    content.innerHTML = settingsTemplate(st);
}

/**
 * Collects references to all interactive settings controls within the content node.
 * @param {HTMLElement} content - The content container
 * @returns {object} Named references to buttons, sliders and value spans
 */
function getSettingsControlRefs(content) {
    const btnMute = content.querySelector('#btn-mute-toggle');
    const sliderMaster = content.querySelector('#slider-master');
    const sliderMusic = content.querySelector('#slider-music');
    const sliderSystem = content.querySelector('#slider-system');
    const sliderCharacters = content.querySelector('#slider-characters');
    const sliderObjects = content.querySelector('#slider-objects');
    const valMaster = content.querySelector('#val-master');
    const valMusic = content.querySelector('#val-music');
    const valSystem = content.querySelector('#val-system');
    const valCharacters = content.querySelector('#val-characters');
    const valObjects = content.querySelector('#val-objects');
    return { btnMute, sliderMaster, sliderMusic, sliderSystem, sliderCharacters, sliderObjects, valMaster, valMusic, valSystem, valCharacters, valObjects };
}

/**
 * Saves audio preferences (patched onto current state) and applies them to the global SFX.
 * @param {Partial<{muted:boolean, master:number, music:number, system:number, characters:number, objects:number}>} patch
 * A partial set of audio prefs (values in 0..1).
 */
function saveAndApplyAudio(patch) {
    const cur = AudioPrefs.fromSfx(window.sfx);
    const saved = AudioPrefs.save({ ...cur, ...patch });
    AudioPrefs.applyToSfx(window.sfx, saved);
}

/**
 * Wires the mute toggle button to flip global mute state and update the label.
 * @param {{btnMute: HTMLButtonElement}} refs - References including the mute button
 * @fires window#app-mute-changed
 */
function wireMuteToggle(refs) {
    if (!refs.btnMute) return;
    function setMuteLabel() { refs.btnMute.textContent = isMuted() ? 'Mute: ON' : 'Mute: OFF'; }
    refs.btnMute.addEventListener('click', function () {
        const next = !isMuted();
        setMuted(next);
        saveAndApplyAudio({ muted: next });
        setMuteLabel();
    });
    window.addEventListener('app-mute-changed', setMuteLabel);
}

/**
 * Wires all volume sliders (master + buses).
 * @param {object} refs - References for sliders and value spans
 */
function wireSliders(refs) {
    wireMasterSlider(refs.sliderMaster, refs.valMaster);
    wireBusSlider(refs.sliderMusic, refs.valMusic, 'music', 'music');
    wireBusSlider(refs.sliderSystem, refs.valSystem, 'system', 'system');
    wireBusSlider(refs.sliderCharacters, refs.valCharacters, 'characters', 'characters');
    wireBusSlider(refs.sliderObjects, refs.valObjects, 'objects', 'objects');
}

/**
 * Wires the master volume slider to update value text, SFX and saved prefs.
 * @param {HTMLInputElement} slider - Range input (0..100)
 * @param {HTMLElement} valueSpan - Element showing the numeric percentage
 */
function wireMasterSlider(slider, valueSpan) {
    if (!slider || !valueSpan) return;
    slider.addEventListener('input', function () {
        const n = Number(slider.value);
        valueSpan.textContent = n + '%';
        if (window.sfx) window.sfx.setMaster(to01FromPercent(n));
        saveAndApplyAudio({ master: to01FromPercent(n) });
    });
}

/**
 * Wires a bus volume slider to update value text, SFX bus, and saved prefs.
 * @param {HTMLInputElement} slider - Range input (0..100)
 * @param {HTMLElement} valueSpan - Element showing the numeric percentage
 * @param {string} busName - Audio bus name in SFX (e.g., 'music')
 * @param {string} keyName - Preference key in saved state (e.g., 'music')
 */
function wireBusSlider(slider, valueSpan, busName, keyName) {
    if (!slider || !valueSpan) return;
    slider.addEventListener('input', function () {
        const n = Number(slider.value);
        valueSpan.textContent = n + '%';
        if (window.sfx) window.sfx.setBusVolume(busName, to01FromPercent(n));
        const patch = {}; patch[keyName] = to01FromPercent(n);
        saveAndApplyAudio(patch);
    });
}

/**
 * Opens the settings overlay, renders controls, and hides competing overlays.
 * @param {object} app - The game/app instance
 * @param {{overlay: HTMLElement, content: HTMLElement, closeBtn: HTMLButtonElement}} elements - Overlay elements
 */
function openSettingsOverlay(app, elements) {
    ensureSettingsExclusiveOpen(app);
    app.suppressWinLose();
    if (typeof app.closeHamburgerMenu === 'function') app.closeHamburgerMenu();
    renderSettingsControls(elements.content);
    elements.overlay.classList.remove('hidden');
}

/**
 * Closes the settings overlay and restores win/lose listeners.
 * When in MENU state, re-shows the start screen.
 * @param {object} app - The game/app instance
 * @param {{overlay: HTMLElement}} elements - Overlay elements
 */
function closeSettingsOverlay(app, elements) {
    elements.overlay.classList.add('hidden');
    app.restoreWinLoseActionsOnly();
    if (app.state === GameState.MENU) {
        const start = document.getElementById('start-screen');
        if (start) start.classList.remove('hidden');
    }
}

/**
 * Attaches click handlers to various "open settings" UI links/buttons.
 * @param {object} app - The game/app instance
 * @param {{overlay: HTMLElement, content: HTMLElement, closeBtn: HTMLButtonElement}} elements - Overlay elements
 */
function attachSettingsOpenLinks(app, elements) {
    const ids = ['btn-settings-go', 'btn-settings-victory', 'menu-settings', 'btn-settings-home'];
    for (let i = 0; i < ids.length; i++) {
        const link = document.getElementById(ids[i]);
        if (!link) continue;
        link.addEventListener('click', function (event) {
            event.preventDefault();
            openSettingsOverlay(app, elements);
        });
    }
}

/**
 * Attaches close handlers: close button, clicking the backdrop, and Escape key.
 * @param {object} app - The game/app instance
 * @param {{overlay: HTMLElement, content: HTMLElement, closeBtn: HTMLButtonElement}} elements - Overlay elements
 */
function attachSettingsCloseHandlers(app, elements) {
    elements.closeBtn.addEventListener('click', function () { closeSettingsOverlay(app, elements); });
    elements.overlay.addEventListener('click', function (event) {
        if (event.target === elements.overlay) closeSettingsOverlay(app, elements);
    });
    document.addEventListener('keydown', function (event) {
        const open = !elements.overlay.classList.contains('hidden');
        if (event.key === 'Escape' && open) closeSettingsOverlay(app, elements);
    });
}