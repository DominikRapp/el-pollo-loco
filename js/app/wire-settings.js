function wireSettingsOverlay(app) {
    const overlay = document.getElementById('settings-overlay');
    const content = document.getElementById('settings-content');
    const closeBtn = document.getElementById('settings-close');
    if (!overlay || !content || !closeBtn) return;

    const ensureExclusiveOpen = () => {
        app.hideWinLoseOverlays();
        const others = [
            document.getElementById('instructions-overlay'),
            document.getElementById('leaderboard-overlay'),
            document.getElementById('start-screen')
        ];
        for (const el of others) { if (el) el.classList.add('hidden'); }
    };

    const pct = (x) => Math.round(Math.max(0, Math.min(1, Number(x || 0))) * 100);
    const to01 = (n) => Math.max(0, Math.min(1, Number(n || 0) / 100));

    const renderControls = () => {
        const st = AudioPrefs.load();
        content.innerHTML = `
            <h3>Audio</h3>
            <div class="settings-group">
                <button id="btn-mute-toggle" class="btn">${st.muted ? 'Mute: ON' : 'Mute: OFF'}</button>
            </div>
            <div class="settings-group">
                <label for="slider-master">Master: <span id="val-master">${pct(st.master)}%</span></label>
                <input id="slider-master" type="range" min="0" max="100" step="1" value="${pct(st.master)}" />
            </div>
            <div class="settings-group">
                <label for="slider-music">Music: <span id="val-music">${pct(st.music)}%</span></label>
                <input id="slider-music" type="range" min="0" max="100" step="1" value="${pct(st.music)}" />
            </div>
            <div class="settings-group">
                <label for="slider-system">System: <span id="val-system">${pct(st.system)}%</span></label>
                <input id="slider-system" type="range" min="0" max="100" step="1" value="${pct(st.system)}" />
            </div>
            <div class="settings-group">
                <label for="slider-characters">Characters: <span id="val-characters">${pct(st.characters)}%</span></label>
                <input id="slider-characters" type="range" min="0" max="100" step="1" value="${pct(st.characters)}" />
            </div>
            <div class="settings-group">
                <label for="slider-objects">Objects: <span id="val-objects">${pct(st.objects)}%</span></label>
                <input id="slider-objects" type="range" min="0" max="100" step="1" value="${pct(st.objects)}" />
            </div>
        `;

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

        const setMuteLabel = () => { if (btnMute) btnMute.textContent = isMuted() ? 'Mute: ON' : 'Mute: OFF'; };

        if (btnMute) {
            btnMute.addEventListener('click', () => {
                const to = !isMuted();
                setMuted(to);
                const cur = AudioPrefs.fromSfx(window.sfx);
                const saved = AudioPrefs.save({ ...cur, muted: to });
                AudioPrefs.applyToSfx(window.sfx, saved);
                setMuteLabel();
            });
            window.addEventListener('app-mute-changed', setMuteLabel);
        }

        sliderMaster.addEventListener('input', () => {
            const n = Number(sliderMaster.value);
            valMaster.textContent = n + '%';
            if (window.sfx) window.sfx.setMaster(to01(n));
            const cur = AudioPrefs.fromSfx(window.sfx);
            const saved = AudioPrefs.save({ ...cur, master: to01(n) });
            AudioPrefs.applyToSfx(window.sfx, saved);
        });

        sliderMusic.addEventListener('input', () => {
            const n = Number(sliderMusic.value);
            valMusic.textContent = n + '%';
            if (window.sfx) window.sfx.setBusVolume('music', to01(n));
            const cur = AudioPrefs.fromSfx(window.sfx);
            const saved = AudioPrefs.save({ ...cur, music: to01(n) });
            AudioPrefs.applyToSfx(window.sfx, saved);
        });

        sliderSystem.addEventListener('input', () => {
            const n = Number(sliderSystem.value);
            valSystem.textContent = n + '%';
            if (window.sfx) window.sfx.setBusVolume('system', to01(n));
            const cur = AudioPrefs.fromSfx(window.sfx);
            const saved = AudioPrefs.save({ ...cur, system: to01(n) });
            AudioPrefs.applyToSfx(window.sfx, saved);
        });

        sliderCharacters.addEventListener('input', () => {
            const n = Number(sliderCharacters.value);
            valCharacters.textContent = n + '%';
            if (window.sfx) window.sfx.setBusVolume('characters', to01(n));
            const cur = AudioPrefs.fromSfx(window.sfx);
            const saved = AudioPrefs.save({ ...cur, characters: to01(n) });
            AudioPrefs.applyToSfx(window.sfx, saved);
        });

        sliderObjects.addEventListener('input', () => {
            const n = Number(sliderObjects.value);
            valObjects.textContent = n + '%';
            if (window.sfx) window.sfx.setBusVolume('objects', to01(n));
            const cur = AudioPrefs.fromSfx(window.sfx);
            const saved = AudioPrefs.save({ ...cur, objects: to01(n) });
            AudioPrefs.applyToSfx(window.sfx, saved);
        });
    };

    const openOverlay = () => {
        ensureExclusiveOpen();
        app.suppressWinLose();
        if (typeof app.closeHamburgerMenu === 'function') app.closeHamburgerMenu();
        renderControls();
        overlay.classList.remove('hidden');
    };

    const closeOverlay = () => {
        overlay.classList.add('hidden');
        app.restoreWinLoseActionsOnly();
        if (app.state === GameState.MENU) {
            const start = document.getElementById('start-screen');
            if (start) start.classList.remove('hidden');
        }
    };

    const openLinks = [
        document.getElementById('btn-settings-go'),
        document.getElementById('btn-settings-victory'),
        document.getElementById('menu-settings'),
        document.getElementById('btn-settings-home')
    ];
    openLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                openOverlay();
            });
        }
    });

    closeBtn.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) closeOverlay(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !overlay.classList.contains('hidden')) closeOverlay(); });
}
