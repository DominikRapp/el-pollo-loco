function wireSettingsOverlay(app) {
    const elements = getSettingsElements();
    if (!elements) return;
    attachSettingsOpenLinks(app, elements);
    attachSettingsCloseHandlers(app, elements);
}

function getSettingsElements() {
    const overlay = document.getElementById('settings-overlay');
    const content = document.getElementById('settings-content');
    const closeBtn = document.getElementById('settings-close');
    if (!overlay || !content || !closeBtn) return null;
    return { overlay, content, closeBtn };
}

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

function percentFrom01(x) {
    return Math.round(Math.max(0, Math.min(1, Number(x || 0))) * 100);
}

function to01FromPercent(n) {
    return Math.max(0, Math.min(1, Number(n || 0) / 100));
}

function renderSettingsControls(content) {
    const state = AudioPrefs.load();
    renderSettingsContent(content, state);
    const refs = getSettingsControlRefs(content);
    wireMuteToggle(refs);
    wireSliders(refs);
}

function renderSettingsContent(content, st) {
    content.innerHTML = settingsTemplate(st);
}


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

function saveAndApplyAudio(patch) {
    const cur = AudioPrefs.fromSfx(window.sfx);
    const saved = AudioPrefs.save({ ...cur, ...patch });
    AudioPrefs.applyToSfx(window.sfx, saved);
}

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

function wireSliders(refs) {
    wireMasterSlider(refs.sliderMaster, refs.valMaster);
    wireBusSlider(refs.sliderMusic, refs.valMusic, 'music', 'music');
    wireBusSlider(refs.sliderSystem, refs.valSystem, 'system', 'system');
    wireBusSlider(refs.sliderCharacters, refs.valCharacters, 'characters', 'characters');
    wireBusSlider(refs.sliderObjects, refs.valObjects, 'objects', 'objects');
}

function wireMasterSlider(slider, valueSpan) {
    if (!slider || !valueSpan) return;
    slider.addEventListener('input', function () {
        const n = Number(slider.value);
        valueSpan.textContent = n + '%';
        if (window.sfx) window.sfx.setMaster(to01FromPercent(n));
        saveAndApplyAudio({ master: to01FromPercent(n) });
    });
}

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

function openSettingsOverlay(app, elements) {
    ensureSettingsExclusiveOpen(app);
    app.suppressWinLose();
    if (typeof app.closeHamburgerMenu === 'function') app.closeHamburgerMenu();
    renderSettingsControls(elements.content);
    elements.overlay.classList.remove('hidden');
}

function closeSettingsOverlay(app, elements) {
    elements.overlay.classList.add('hidden');
    app.restoreWinLoseActionsOnly();
    if (app.state === GameState.MENU) {
        const start = document.getElementById('start-screen');
        if (start) start.classList.remove('hidden');
    }
}

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
