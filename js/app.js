const GameState = { INTRO: 'INTRO', MENU: 'MENU', GAME: 'GAME', GAMEOVER: 'GAMEOVER', VICTORY: 'VICTORY' };

(function preloadOverlays() {
    const sources = [
        'img/You won, you lost/Game over A.png',
        'img/You won, you lost/You Win A.png'
    ];
    for (const src of sources) {
        const img = new Image();
        img.src = src;
    }
})();

class IntroPepe extends DrawableObject {
    frames = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'
    ];
    idx = 0;
    tick = 0;
    done = false;
    suppressWinLoseOverlay = false;

    constructor(canvasHeight) {
        super().loadImage(this.frames[0]);
        this.loadImages(this.frames);
        this.width = 150;
        this.height = 300;
        this.x = -160;
        this.y = 335;
        if (canvasHeight) {
            this.y = Math.max(0, Math.min(canvasHeight - this.height, 335));
        }
    }

    update() {
        this.x += 6;
        this.tick += 1;
        if (this.tick % 6 === 0) {
            this.img = this.imageCache[this.frames[this.idx]];
            this.idx = (this.idx + 1) % this.frames.length;
        }
        if (this.x > 1200) {
            this.done = true;
        }
    }
}

class App {
    state = GameState.INTRO;
    canvas = null;
    ctx = null;
    world = null;
    keyboard = null;
    intro = null;

    timerStart = 0;
    timerRunning = false;
    stoppedForWinOrLose = false;

    userName = '';
    nameValid = false;

    levels = [];
    currentLevelIndex = 0;
    levelFactories = [
        createLevel1,
        createLevel2,
        createLevel3,
        createLevel4,
        createLevel5
    ];

    carryOverEnergy = 100;
    runResults = [];
    totalCounts = { levelComplete: 0, boss: 0, chicken: 0, chickenSmall: 0, bottle: 0, coin: 0 };
    totalTimeMs = 0;

    show(el) {
        if (el) el.classList.remove('hidden');
    }

    hide(el) {
        if (el) el.classList.add('hidden');
    }

    init(canvas, keyboard) {
        setMuted(isMuted());
        const preset = AudioPrefs.load();
        if (window.sfx) AudioPrefs.applyToSfx(window.sfx, preset);
        window.addEventListener('sfx-ready', () => AudioPrefs.applyToSfx(window.sfx, AudioPrefs.load()));
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.levels = [createLevel1, createLevel2, createLevel3, createLevel4, createLevel5];
        this.currentLevelIndex = 0;
        this.wireStartScreenControls();
        this.wireInstructionsOverlay();
        this.wireLeaderboardOverlay();
        this.wireSettingsOverlay();
        this.startSequence();
        this.wireHamburgerMenu();
        this.wireHomeActions();
        this.wireFullscreenToggle();
        this.wireMobileButtons();
    }

    wireMobileButtons() {
        const root = document.getElementById('game-root');
        const scope = document.getElementById('mobile-controls');
        if (!root || !scope) return;

        const btnLeft = scope.querySelector('.is-left');
        const btnRight = scope.querySelector('.is-right');
        const btnJump = scope.querySelector('.is-jump');
        const btnThrow = scope.querySelector('.is-throw');
        const btnRestartMobile = scope.querySelector('.is-restart');

        const getKb = () => {
            if (this && this.keyboard) return this.keyboard;
            if (this && this.world && this.world.keyboard) return this.world.keyboard;
            if (window.keyboard) return window.keyboard;
            if (window.world && window.world.keyboard) return window.world.keyboard;
            return null;
        };

        const setKey = (k, v = true) => {
            const kb = getKb();
            if (kb) kb[k] = v;
        };

        const tap = (k, ms = 140) => {
            setKey(k, true);
            setTimeout(() => setKey(k, false), ms);
        };

        const tapMany = (keys, ms = 140) => {
            const kb = getKb();
            keys.forEach(k => { if (kb) kb[k] = true; });
            setTimeout(() => keys.forEach(k => { if (kb) kb[k] = false; }), ms);
        };

        const onHold = (el, key) => {
            if (!el) return;
            const start = (e) => { e.preventDefault(); setKey(key, true); };
            const end = () => { setKey(key, false); };
            el.addEventListener('pointerdown', start, { passive: false });
            el.addEventListener('pointerup', end);
            el.addEventListener('pointercancel', end);
            el.addEventListener('pointerleave', end);
            el.addEventListener('touchstart', start, { passive: false });
            el.addEventListener('touchend', end);
            el.addEventListener('mousedown', start);
            el.addEventListener('mouseup', end);
            el.addEventListener('mouseout', end);
        };

        onHold(btnLeft, 'LEFT');
        onHold(btnRight, 'RIGHT');

        if (btnJump) {
            const fire = (e) => { e.preventDefault(); tap('SPACE'); };
            btnJump.addEventListener('pointerdown', fire, { passive: false });
            btnJump.addEventListener('touchstart', fire, { passive: false });
            btnJump.addEventListener('click', fire);
        }

        if (btnThrow) {
            const fire = (e) => {
                e.preventDefault();
                tapMany(['W', 'D', 'THROW']);
            };
            btnThrow.addEventListener('pointerdown', fire, { passive: false });
            btnThrow.addEventListener('touchstart', fire, { passive: false });
            btnThrow.addEventListener('click', fire);
        }

        if (btnRestartMobile) {
            const doRestart = (e) => {
                e.preventDefault();
                if (this && this.state === GameState.GAME) {
                    IntervalTracker.clearAll();
                    this.carryOverEnergy = 100;
                    this.restartToLevel1();
                    return;
                }
                const cand = document.querySelector('#btn-restart, #btn-restart-win');
                if (cand) { cand.click(); return; }
                tap('R', 160);
            };
            btnRestartMobile.addEventListener('pointerdown', doRestart, { passive: false });
            btnRestartMobile.addEventListener('touchstart', doRestart, { passive: false });
            btnRestartMobile.addEventListener('click', doRestart);
        }
    }

    wireStartScreenControls() {
        const btnStart = document.getElementById('btn-start');
        const nameInput = document.getElementById('player-name');
        const nameErr = document.getElementById('name-error');

        this.showNameErrors = false;
        this.userName = '';
        this.nameValid = false;

        const updateEnablement = () => {
            if (btnStart) btnStart.disabled = !(nameInput && nameInput.value.trim().length > 0);
        };

        const isNameTakenLocal = (name) => {
            const raw = localStorage.getItem('usedNames') || '[]';
            try {
                const list = JSON.parse(raw);
                return list.includes(name.toLowerCase());
            } catch {
                return false;
            }
        };

        const setError = (msg, visible) => {
            if (!nameErr) return;
            nameErr.textContent = msg || ' ';
            if (visible) {
                nameErr.classList.remove('soft-hidden');
            } else {
                nameErr.classList.add('soft-hidden');
            }
        };

        const validate = () => {
            const value = (nameInput?.value || '').trim();
            this.userName = value;
            const basicOk = value.length >= 3 && value.length <= 16 && /^[a-z0-9_]+$/i.test(value);
            const taken = value ? isNameTakenLocal(value) : false;

            let msg = '';
            if (!basicOk) msg = '3–16 characters, letters/numbers/_ only.';
            else if (taken && value.toLowerCase() !== (localStorage.getItem('playerName') || '').toLowerCase()) msg = 'Name ist bereits vergeben.';

            this.nameValid = msg === '';
            if (this.showNameErrors) {
                setError(this.nameValid ? ' ' : msg, !this.nameValid);
            } else {
                setError(' ', false);
            }
            updateEnablement();
            return this.nameValid;
        };

        if (nameInput) {
            nameInput.addEventListener('input', () => {
                validate();
            });
            nameInput.addEventListener('blur', () => {
                validate();
            });
        }

        const saved = localStorage.getItem('playerName');
        if (saved && nameInput) {
            nameInput.value = saved;
            this.userName = saved;
            this.nameValid = true;
        }

        if (nameErr) {
            nameErr.classList.add('soft-hidden');
            nameErr.classList.remove('hidden');
            if (!nameErr.textContent) nameErr.textContent = ' ';
        }

        updateEnablement();
        validate();

        if (btnStart) {
            btnStart.addEventListener('click', () => {
                this.showNameErrors = true;
                if (!validate()) return;
                this.persistName(this.userName);
                this.startLevel(0);
            });
        }
    }

    wireHamburgerMenu() {
        const menuRoot = document.getElementById('hamburger-root');
        const menuButton = document.getElementById('hamburger-button');
        const menuPanel = document.getElementById('hamburger-menu');

        if (!menuRoot || !menuButton || !menuPanel) {
            return;
        }

        const openMenu = () => {
            menuPanel.classList.remove('hidden');
            menuButton.classList.add('open');
            menuButton.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            menuPanel.classList.add('hidden');
            menuButton.classList.remove('open');
            menuButton.setAttribute('aria-expanded', 'false');
        };

        const toggleMenu = () => {
            const isHidden = menuPanel.classList.contains('hidden');
            if (isHidden) {
                openMenu();
            } else {
                closeMenu();
            }
        };

        menuButton.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleMenu();
        });

        document.addEventListener('click', function (event) {
            const clickedInside = menuRoot.contains(event.target);
            if (!clickedInside) {
                closeMenu();
            }
        });

        const links = menuPanel.querySelectorAll('a');
        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function () {
                closeMenu();
            });
        }
    }

    wireSettingsOverlay() {
        const overlay = document.getElementById('settings-overlay');
        const content = document.getElementById('settings-content');
        const closeBtn = document.getElementById('settings-close');
        if (!overlay || !content || !closeBtn) return;

        const ensureExclusiveOpen = () => {
            this.hideWinLoseOverlays();
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
            this.suppressWinLose();
            if (typeof this.closeHamburgerMenu === 'function') this.closeHamburgerMenu();
            renderControls();
            overlay.classList.remove('hidden');
        };

        const closeOverlay = () => {
            overlay.classList.add('hidden');
            this.restoreWinLoseActionsOnly();
            if (this.state === GameState.MENU) {
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


    wireFullscreenToggle() {
        const root = document.getElementById('game-root');
        const btnHome = document.getElementById('btn-fullscreen-home');
        const btnGo = document.getElementById('btn-fullscreen-go');
        const btnVictory = document.getElementById('btn-fullscreen-victory');

        if (!root) return;

        const isFs = () => {
            return document.fullscreenElement === root
                || document.webkitFullscreenElement === root
                || document.msFullscreenElement === root;
        };

        const canFs = () => {
            return !!(root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen);
        };

        const enter = () => {
            if (root.requestFullscreen) return root.requestFullscreen();
            if (root.webkitRequestFullscreen) return root.webkitRequestFullscreen();
            if (root.msRequestFullscreen) return root.msRequestFullscreen();
        };

        const exit = () => {
            if (document.exitFullscreen) return document.exitFullscreen();
            if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
            if (document.msExitFullscreen) return document.msExitFullscreen();
        };

        const update = () => {
            const on = isFs();
            const labelOn = 'Fullscreen';
            const labelOff = 'Fullscreen';
            const set = (btn) => {
                if (!btn) return;
                btn.textContent = on ? labelOn : labelOff;
                btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            };
            set(btnHome);
            set(btnGo);
            set(btnVictory);
        };

        const toggle = (ev) => {
            if (ev) ev.preventDefault();
            if (!canFs()) return;
            if (isFs()) {
                const p = exit();
                if (p && typeof p.finally === 'function') p.finally(update); else setTimeout(update, 0);
            } else {
                const p = enter();
                if (p && typeof p.finally === 'function') p.finally(update); else setTimeout(update, 0);
            }
        };

        if (btnHome) btnHome.addEventListener('click', toggle);
        if (btnGo) btnGo.addEventListener('click', toggle);
        if (btnVictory) btnVictory.addEventListener('click', toggle);

        document.addEventListener('fullscreenchange', () => update());
        document.addEventListener('webkitfullscreenchange', () => update());
        document.addEventListener('msfullscreenchange', () => update());

        update();
    }

    getHamburgerElements() {
        const root = document.getElementById('hamburger-root');
        const button = document.getElementById('hamburger-button');
        const panel = document.getElementById('hamburger-menu');
        return { root, button, panel };
    }

    closeHamburgerMenu() {
        const { root, button, panel } = this.getHamburgerElements();
        if (!root || !button || !panel) { return; }
        panel.classList.add('hidden');
        button.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
    }

    showHamburger(visible) {
        const { root } = this.getHamburgerElements();
        if (!root) { return; }
        if (visible) {
            root.classList.remove('hidden');
            this.closeHamburgerMenu();
        } else {
            root.classList.add('hidden');
            this.closeHamburgerMenu();
        }
    }

    wireInstructionsOverlay() {
        this.instructionsPages = this.buildInstructionsPages();
        this.currentInstructionsPage = 0;

        const overlay = document.getElementById('instructions-overlay');
        const box = overlay ? overlay.querySelector('.overlay-box') : null;
        const content = document.getElementById('instructions-content');
        const prevBtn = document.getElementById('instructions-prev');
        const nextBtn = document.getElementById('instructions-next');
        const pageIndicator = document.getElementById('instructions-page-indicator');
        const closeBtn = document.getElementById('instructions-close');

        if (!overlay || !box || !content || !prevBtn || !nextBtn || !pageIndicator || !closeBtn) {
            return;
        }

        const renderPage = (index) => {
            const total = this.instructionsPages.length;
            const target = Math.max(0, Math.min(index, total - 1));
            this.currentInstructionsPage = target;
            content.innerHTML = this.instructionsPages[target];
            pageIndicator.textContent = 'Page ' + (target + 1) + ' of ' + total;
            prevBtn.disabled = target === 0;
            nextBtn.disabled = target === total - 1;
            overlay.scrollTop = 0;
        };

        const ensureExclusiveOpen = () => {
            this.hideWinLoseOverlays();
            const others = [
                document.getElementById('leaderboard-overlay'),
                document.getElementById('settings-overlay'),
                document.getElementById('start-screen')
            ];
            for (const el of others) { if (el) el.classList.add('hidden'); }
        };

        const openOverlay = () => {
            ensureExclusiveOpen();
            this.suppressWinLose();
            if (typeof this.closeHamburgerMenu === 'function') this.closeHamburgerMenu();
            overlay.classList.remove('hidden');
            renderPage(0);
        };

        const closeOverlay = () => {
            overlay.classList.add('hidden');
            this.restoreWinLoseActionsOnly();
            if (this.state === GameState.MENU) {
                const start = document.getElementById('start-screen');
                if (start) start.classList.remove('hidden');
            }
        };

        const goPrev = () => {
            if (this.currentInstructionsPage > 0) renderPage(this.currentInstructionsPage - 1);
        };

        const goNext = () => {
            if (this.currentInstructionsPage < this.instructionsPages.length - 1) renderPage(this.currentInstructionsPage + 1);
        };

        const openLinks = [
            document.getElementById('btn-instructions-go'),
            document.getElementById('btn-instructions-victory'),
            document.getElementById('menu-instructions'),
            document.getElementById('btn-instructions-home')
        ];
        openLinks.forEach(link => {
            if (link) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    openOverlay();
                });
            }
        });

        prevBtn.addEventListener('click', goPrev);
        nextBtn.addEventListener('click', goNext);
        closeBtn.addEventListener('click', closeOverlay);

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) closeOverlay();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !overlay.classList.contains('hidden')) closeOverlay();
        });
    }

    wireLeaderboardOverlay() {
        this.leaderboardPages = [];
        this.currentLeaderboardPage = 0;

        const overlay = document.getElementById('leaderboard-overlay');
        const box = overlay ? overlay.querySelector('.overlay-box') : null;
        const content = document.getElementById('leaderboard-content');
        const prevBtn = document.getElementById('leaderboard-prev');
        const nextBtn = document.getElementById('leaderboard-next');
        const pageIndicator = document.getElementById('leaderboard-page-indicator');
        const closeBtn = document.getElementById('leaderboard-close');

        if (!overlay || !box || !content || !prevBtn || !nextBtn || !pageIndicator || !closeBtn) {
            return;
        }

        const renderPage = (index) => {
            const total = this.leaderboardPages.length;
            const target = Math.max(0, Math.min(index, total - 1));
            this.currentLeaderboardPage = target;
            content.innerHTML = this.leaderboardPages[target] || '<p>No data.</p>';
            pageIndicator.textContent = 'Page ' + (target + 1) + ' of ' + total;
            prevBtn.disabled = target === 0;
            nextBtn.disabled = target === total - 1;
            overlay.scrollTop = 0;
        };

        const ensureExclusiveOpen = () => {
            this.hideWinLoseOverlays();
            const others = [
                document.getElementById('instructions-overlay'),
                document.getElementById('settings-overlay'),
                document.getElementById('start-screen')
            ];
            for (const el of others) { if (el) el.classList.add('hidden'); }
        };

        const loadPages = async () => {
            content.innerHTML = '<p>Loading…</p>';
            try {
                const pages = await LeaderboardView.buildPages();
                this.leaderboardPages = pages;
                renderPage(0);
            } catch (e) {
                content.innerHTML = '<p>Failed to load.</p>';
            }
        };

        const openOverlay = () => {
            ensureExclusiveOpen();
            this.suppressWinLose();
            if (typeof this.closeHamburgerMenu === 'function') this.closeHamburgerMenu();
            overlay.classList.remove('hidden');
            loadPages();
        };

        const closeOverlay = () => {
            overlay.classList.add('hidden');
            this.restoreWinLoseActionsOnly();
            if (this.state === GameState.MENU) {
                const start = document.getElementById('start-screen');
                if (start) start.classList.remove('hidden');
            }
        };

        const goPrev = () => {
            if (this.currentLeaderboardPage > 0) renderPage(this.currentLeaderboardPage - 1);
        };

        const goNext = () => {
            if (this.currentLeaderboardPage < this.leaderboardPages.length - 1) renderPage(this.currentLeaderboardPage + 1);
        };

        const openLinks = [
            document.getElementById('btn-leaderboard-go'),
            document.getElementById('btn-leaderboard-victory'),
            document.getElementById('btn-leaderboard-home')
        ];
        openLinks.forEach(link => {
            if (link) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    openOverlay();
                });
            }
        });

        prevBtn.addEventListener('click', goPrev);
        nextBtn.addEventListener('click', goNext);
        closeBtn.addEventListener('click', closeOverlay);

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) closeOverlay();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !overlay.classList.contains('hidden')) closeOverlay();
        });
    }



    wireHomeActions() {
        const btnHomeGo = document.getElementById('btn-home-go');
        const btnHomeWin = document.getElementById('btn-home');
        const menuHome = document.getElementById('menu-home');

        const goHome = (ev) => {
            if (ev) ev.preventDefault();

            this.resetRunTotals();
            this.clearRunOverlayResults();

            this.resetOverlays();
            this.hideWinLoseOverlays();
            this.showMenu();
        };

        if (btnHomeGo) btnHomeGo.addEventListener('click', goHome);
        if (menuHome) menuHome.addEventListener('click', goHome);
        if (btnHomeWin) btnHomeWin.addEventListener('click', goHome);
    }



    hideWinLoseOverlays() {
        const goImg = document.getElementById('overlay-gameover');
        const viImg = document.getElementById('overlay-youwin');
        const goAct = document.getElementById('gameover-actions');
        const viAct = document.getElementById('victory-actions');

        const hideEl = (el) => { if (el) { el.classList.add('hidden'); el.style.display = 'none'; el.classList.remove('pop-in'); } };

        hideEl(goImg);
        hideEl(viImg);
        hideEl(goAct);
        hideEl(viAct);
    }

    suppressWinLose() {
        this.suppressWinLoseOverlay = true;
        this.hideWinLoseOverlays();
    }

    restoreWinLoseActionsOnly() {
        if (!this.suppressWinLoseOverlay) return;
        this.suppressWinLoseOverlay = false;
        if (this.state === GameState.GAMEOVER) {
            const actions = document.getElementById('gameover-actions');
            if (actions) { actions.classList.remove('hidden'); actions.style.display = ''; }
        } else if (this.state === GameState.VICTORY) {
            const actions = document.getElementById('victory-actions');
            if (actions) { actions.classList.remove('hidden'); actions.style.display = ''; }
        }
    }

    buildInstructionsPages() {
        return [
            '<h2>How to Play</h2><p>EL POLLO LOCO is a fast-paced 5-level jump-and-run with a speedrun twist. Finish levels as quickly as possible while scoring points to climb into the Top-10 leaderboards. A 3-2-1 countdown starts each run. Enter a player name to enable the Start button—your name appears on the scoreboards.</p>',

            '<h2>Keyboard Controls</h2><ul><li><kbd>A</kbd> / <kbd>&larr;</kbd> — Move left</li><li><kbd>D</kbd> / <kbd>&rarr;</kbd> — Move right</li><li><kbd>Space</kbd> — Jump</li><li><kbd>W</kbd> — Throw (bottle)</li><li><kbd>M</kbd> — Mute / Unmute</li><li><kbd>R</kbd> — Quick Restart (resets to Level 1 and restarts the run)</li><li><kbd>B</kbd> — Open Leaderboard</li><li><kbd>I</kbd> — Open Instructions</li><li><kbd>O</kbd> — Open Audio Settings</li><li><kbd>H</kbd> — Go to Home</li><li><kbd>F</kbd> — Toggle Fullscreen</li></ul>',

            '<h2>Mobile Controls</h2><ul><li>Bottom-left: <strong>Reset</strong>, <strong>Left</strong>, <strong>Right</strong></li><li>Bottom-right: <strong>Jump</strong>, <strong>Throw</strong> (bottle)</li></ul>',

            '<h2>Run & Countdown</h2><ul><li>Starting a level triggers a <strong>3-2-1 → GO</strong> countdown.</li><li><strong>Reset</strong> sends you back to Level 1 and restarts the run.</li><li>Your health carries over between levels, manage healing with coins.</li></ul>',

            '<h2>Goals & Levels</h2><ul><li>There are <strong>5 levels</strong>, difficulty increases each level.</li><li>Clear levels as fast as you can while maximizing points.</li><li>Health does not automatically refill between levels.</li></ul>',

            '<h2>Scoring Overview</h2><ul><li><strong>Boss defeated:</strong> +5 points (1 boss per level)</li><li><strong>Chicken defeated:</strong> +4 points (max 5 per level → 20 pts)</li><li><strong>Chick defeated:</strong> +3 points (max 5 per level → 15 pts)</li><li><strong>Bottle collected:</strong> +2 points (max 5 per level → 10 pts)</li><li><strong>Coin collected:</strong> +1 point (max 5 per level → 5 pts)</li></ul><p><em>Leaderboards:</em> one <strong>Total</strong> board (sum of all levels) and one board per <strong>Level</strong>. Only Top-10 are shown.</p>',

            '<h2>Ranking Rules</h2><ul><li>Higher <strong>points</strong> rank above lower points.</li><li>Ties are broken by <strong>faster time</strong>.</li><li>If still tied, <strong>earlier achievement</strong> (first reached, by <code>createdAt</code>) ranks higher.</li></ul>',

            '<h2>Your Character: Pepe</h2><p><img class="ins-ico" src="img/2_character_pepe/5_dead/D-53.png" alt="Pepe"><img class="ins-ico" src="img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png" alt="Health"></p><ul><li><strong>Health:</strong> 100 HP. Each enemy hit deals 20 damage.</li><li><strong>Invulnerability:</strong> 1 second after taking damage, slight knockback.</li><li><strong>Actions:</strong> run left/right, jump, throw bottles, collect bottles and coins.</li><li><strong>Stomp:</strong> jump on chickens and chicks to defeat them.</li><li><strong>Healing:</strong> each coin restores 20 HP (up to 100).</li><li><strong>Idle:</strong> after 15 seconds without input, Pepe gets sleepy.</li><li><strong>Bottles:</strong> carry up to 5 per level. Throwing bottles has a 2-second cooldown.</li></ul>',

            '<h2>Endboss</h2><p><img class="ins-ico" src="img/4_enemie_boss_chicken/2_alert/G11.png" alt="Boss"><img class="ins-ico" src="img/7_statusbars/2_statusbar_endboss/green/green60.png" alt="Boss HP"></p><ul><li><strong>Boss HP:</strong> 100 HP, bottles deal 20 damage each → needs 5 hits.</li><li><strong>Damage to Pepe:</strong> 20 per hit.</li><li><strong>Behavior:</strong> turns alert when close, boss music starts, chases and melee attacks.</li><li><strong>Scaling:</strong> gets faster each level.</li><li><strong>Points:</strong> defeating the boss gives +5 points.</li><li><strong>Important:</strong> only 5 bottles per level. If you miss one boss hit, you cannot finish that level.</li></ul>',

            '<h2>Chicken</h2><p><img class="ins-ico" src="img/3_enemies_chicken/chicken_normal/1_walk/2_w.png" alt="Chicken"></p><ul><li>Defeat by <strong>stomping</strong> on its head.</li><li><strong>Points:</strong> +4 each (max 5 per level → 20 pts).</li></ul>',

            '<h2>Chick</h2><p><img class="ins-ico" src="img/3_enemies_chicken/chicken_small/1_walk/2_w.png" alt="Chick"></p><ul><li>Defeat by <strong>stomping</strong> on its head.</li><li><strong>Points:</strong> +3 each (max 5 per level → 15 pts).</li></ul>',

            '<h2>Bottle</h2><p><img class="ins-ico" src="img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png" alt="Bottle"><img class="ins-ico" src="img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png" alt="Bottle bar"></p><ul><li><strong>Spawns:</strong> 5 per level.</li><li><strong>Use:</strong> required to defeat the boss, collect all if you want a chance to win.</li><li><strong>Damage:</strong> 20 per boss hit.</li><li><strong>Points:</strong> +2 per collected bottle (up to 10 per level).</li></ul>',

            '<h2>Coin</h2><p><img class="ins-ico" src="img/8_coin/coin_2.png" alt="Coin"><img class="ins-ico" src="img/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png" alt="Coin bar"></p><ul><li><strong>Healing:</strong> +20 HP each.</li><li><strong>Spawns:</strong> 5 per level.</li><li><strong>Points:</strong> +1 each (up to 5 per level).</li></ul>',

            '<h2>World Objects</h2><h3>Barrel</h3><p><img class="ins-ico" src="img/10_fix_objects/barrel.png" alt="Barrel"></p><ul><li>Static, indestructible. Use as cover or to reach higher spots.</li></ul><h3>Platforms</h3><p><span class="icon-row"><img class="ins-ico" src="img/10_fix_objects/platform_set/platform1.png" alt="P1"><img class="ins-ico" src="img/10_fix_objects/platform_set/platform2.png" alt="P2"><img class="ins-ico" src="img/10_fix_objects/platform_set/platform3.png" alt="P3"><img class="ins-ico" src="img/10_fix_objects/platform_set/platform4.png" alt="P4"><img class="ins-ico" src="img/10_fix_objects/platform_set/platform5.png" alt="P5"></span></p><ul><li>Static, built from 5 segments.</li><li>You can jump up through a platform from below.</li><li>Typically reached via a <strong>barrel-assisted jump</strong>, not directly from ground height.</li></ul>'
        ];
    }



    buildLeaderboardPages() {
        const raw = localStorage.getItem('leaderboard_rankings') || '{}';
        let data = {};
        try { data = JSON.parse(raw) || {}; } catch { data = {}; }

        const ensureArr = (x) => Array.isArray(x) ? x.slice(0, 10) : [];
        const total = ensureArr(data.total);
        const levels = {
            1: ensureArr(data.levels && data.levels['1']),
            2: ensureArr(data.levels && data.levels['2']),
            3: ensureArr(data.levels && data.levels['3']),
            4: ensureArr(data.levels && data.levels['4']),
            5: ensureArr(data.levels && data.levels['5'])
        };

        const fmt = (n) => typeof n === 'number' ? String(n) : '–';

        const mmss = (ms) => {
            if (typeof ms !== 'number' || ms < 0) return '–';
            const totalSeconds = Math.floor(ms / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        };

        const pts = (c) => {
            const lc = Number(c && c.levelComplete || 0);
            const b = Number(c && c.boss || 0);
            const ch = Number(c && c.chicken || 0);
            const cs = Number(c && c.chickenSmall || 0);
            const bo = Number(c && c.bottle || 0);
            const co = Number(c && c.coin || 0);
            return lc * 10 + b * 5 + ch * 4 + cs * 3 + bo * 2 + co * 1;
        };

        const sortByPointsThenTimeThenCreated = (arr, timeKey) => {
            return arr.slice().sort((a, b) => {
                const pa = pts(a.counts || {}), pb = pts(b.counts || {});
                if (pb !== pa) return pb - pa;
                const ta = typeof a[timeKey] === 'number' ? a[timeKey] : Number.MAX_SAFE_INTEGER;
                const tb = typeof b[timeKey] === 'number' ? b[timeKey] : Number.MAX_SAFE_INTEGER;
                if (ta !== tb) return ta - tb;
                const ca = typeof a.createdAt === 'number' ? a.createdAt : Number.MAX_SAFE_INTEGER;
                const cb = typeof b.createdAt === 'number' ? b.createdAt : Number.MAX_SAFE_INTEGER;
                return ca - cb;
            }).slice(0, 10);
        };

        const isPlaceholder = (e) => Number(e && e.createdAt) === 0;

        const rankRowsTotal = (arr) => {
            const rows = [];
            const sorted = sortByPointsThenTimeThenCreated(arr, 'totalTimeMs');
            sorted.forEach((e, i) => {
                const name = e && e.name ? e.name : 'Player';
                const highest = e && typeof e.highestLevel === 'number' ? e.highestLevel : 0;
                const timeStr = isPlaceholder(e) ? '00:00' : mmss(e && typeof e.totalTimeMs === 'number' ? e.totalTimeMs : null);
                const c = e && e.counts ? e.counts : {};
                const score = pts(c);
                const b = c.boss || 0;
                const ch = c.chicken || 0;
                const cs = c.chickenSmall || 0;
                const bo = c.bottle || 0;
                const co = c.coin || 0;
                rows.push(
                    '<tr>'
                    + '<td>' + (i + 1) + '.</td>'
                    + '<td>' + name + '</td>'
                    + '<td>' + fmt(highest) + '</td>'
                    + '<td>' + timeStr + '</td>'
                    + '<td>' + fmt(score) + '</td>'
                    + '<td>' + fmt(b) + '</td>'
                    + '<td>' + fmt(ch) + '</td>'
                    + '<td>' + fmt(cs) + '</td>'
                    + '<td>' + fmt(bo) + '</td>'
                    + '<td>' + fmt(co) + '</td>'
                    + '</tr>'
                );
            });
            return rows.join('');
        };

        const rankRowsLevel = (arr) => {
            const rows = [];
            const sorted = sortByPointsThenTimeThenCreated(arr, 'timeMs');
            sorted.forEach((e, i) => {
                const name = e && e.name ? e.name : 'Player';
                const timeStr = isPlaceholder(e) ? '00:00' : mmss(e && typeof e.timeMs === 'number' ? e.timeMs : null);
                const c = e && e.counts ? e.counts : {};
                const score = pts(c);
                const b = c.boss || 0;
                const ch = c.chicken || 0;
                const cs = c.chickenSmall || 0;
                const bo = c.bottle || 0;
                const co = c.coin || 0;
                rows.push(
                    '<tr>'
                    + '<td>' + (i + 1) + '.</td>'
                    + '<td>' + name + '</td>'
                    + '<td>' + timeStr + '</td>'
                    + '<td>' + fmt(score) + '</td>'
                    + '<td>' + fmt(b) + '</td>'
                    + '<td>' + fmt(ch) + '</td>'
                    + '<td>' + fmt(cs) + '</td>'
                    + '<td>' + fmt(bo) + '</td>'
                    + '<td>' + fmt(co) + '</td>'
                    + '</tr>'
                );
            });
            return rows.join('');
        };

        const tableTotal =
            '<table class="leaderboard-table">'
            + '<thead>'
            + '<tr>'
            + '<th>#</th><th>Name</th><th>Höchstes Level</th><th>Gesamtzeit</th><th>Punkte</th>'
            + '<th>Boss</th><th>Chicken</th><th>Chicken Small</th><th>Bottles</th><th>Coins</th>'
            + '</tr>'
            + '</thead>'
            + '<tbody>' + rankRowsTotal(total) + '</tbody>'
            + '</table>';

        const buildLevelTable = (lvl) => {
            return (
                '<table class="leaderboard-table">'
                + '<thead>'
                + '<tr>'
                + '<th>#</th><th>Name</th><th>Zeit</th><th>Punkte</th>'
                + '<th>Boss</th><th>Chicken</th><th>Chicken Small</th><th>Bottles</th><th>Coins</th>'
                + '</tr>'
                + '</thead>'
                + '<tbody>' + rankRowsLevel(levels[lvl]) + '</tbody>'
                + '</table>'
            );
        };

        const pages = [];
        pages.push('<h3>Gesamt</h3>' + tableTotal);
        pages.push('<h3>Level 1</h3>' + buildLevelTable(1));
        pages.push('<h3>Level 2</h3>' + buildLevelTable(2));
        pages.push('<h3>Level 3</h3>' + buildLevelTable(3));
        pages.push('<h3>Level 4</h3>' + buildLevelTable(4));
        pages.push('<h3>Level 5</h3>' + buildLevelTable(5));
        return pages;
    }



    persistName(name) {
        localStorage.setItem('playerName', name);
        const raw = localStorage.getItem('usedNames') || '[]';
        let arr = [];
        try { arr = JSON.parse(raw); } catch { arr = []; }
        const key = name.toLowerCase();
        if (!arr.includes(key)) {
            arr.push(key);
            localStorage.setItem('usedNames', JSON.stringify(arr));
        }
    }

    showMenu() {
        if (this.cdTimer) {
            clearInterval(this.cdTimer);
            this.cdTimer = null;
        }
        this.cdRunning = false;
        const cd = document.getElementById('countdown');
        if (cd) {
            cd.style.display = 'none';
            cd.textContent = '';
        }
        if (window.sfx) {
            window.sfx.stop('sys.countdown.tick');
        }

        if (this.world && typeof this.world.dispose === 'function') {
            this.world.dispose();
        }
        IntervalTracker.clearAll();

        this.state = GameState.MENU;
        this.showHamburger(false);
        this.setMobileControlsVisible(false);


        const startScreen = document.getElementById('start-screen');
        this.show(startScreen);

        this.hideHudLevel();

        if (window.sfx) window.sfx.musicTo('music.menu.loop', 500);
    }


    resetOverlays() {
        const ids = ['overlay-gameover', 'overlay-youwin'];
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.classList.remove('pop-in');
            }
        }
        const go = document.getElementById('gameover-actions');
        const vi = document.getElementById('victory-actions');
        if (go) go.classList.add('hidden');
        if (vi) vi.classList.add('hidden');
    }

    startSequence() {
        const splash = document.getElementById('splash-start');
        if (!splash) {
            this.startIntro();
            return;
        }
        splash.style.display = 'block';
        splash.style.opacity = '1';
        let opacity = 1;
        setTimeout(() => {
            const fade = () => {
                opacity -= 0.03;
                if (opacity <= 0) {
                    splash.style.display = 'none';
                    this.startIntro();
                    return;
                }
                splash.style.opacity = String(opacity);
                requestAnimationFrame(fade);
            };
            fade();
        }, 900);
    }

    startIntro() {
        this.state = GameState.INTRO;

        const go = () => {
            this.intro = new IntroPepe(this.canvas.height);
            if (window.sfx) {
                window.sfx.stopAll('music.');
                window.sfx.play('music.intro');
            }
            this.loopIntro();
        };

        const s = window.sfx;
        if (s && (s.ready === true || (s.pools && s.pools.size > 0))) {
            go();
        } else {
            const onReady = () => {
                window.removeEventListener('sfx-ready', onReady);
                go();
            };
            window.addEventListener('sfx-ready', onReady);
        }
    }


    loopIntro() {
        if (this.state !== GameState.INTRO) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.intro.update();
        this.intro.draw(this.ctx);
        if (this.intro.done) {
            if (window.sfx) {
                window.sfx.stop('music.intro');
            }
            this.showMenu();
            return;
        }
        requestAnimationFrame(() => this.loopIntro());
    }

    startGame() {
        IntervalTracker.clearAll();
        if (this.world && typeof this.world.dispose === 'function') {
            this.world.dispose();
        }

        const startScreen = document.getElementById('start-screen');
        if (startScreen) startScreen.classList.add('hidden');

        this.state = GameState.GAME;

        const makeLevel = this.levels[this.currentLevelIndex];
        const level = makeLevel();
        this.world = new World(this.canvas, this.keyboard, level);
        this.showHamburger(true);
        this.setMobileControlsVisible(true);

        this.setHudLevel((this.currentLevelIndex || 0) + 1);

        if (this.world && this.world.character) this.world.character.canControl = false;

        this.runCountdown(3, () => {
            if (this.world && this.world.character) this.world.character.canControl = true;
            this.timerStart = Date.now();
            this.timerRunning = true;
            this.stoppedForWinOrLose = false;
            this.showTimer(true);
            this.loopTimer();
            this.loopWinLoseWatch();
        });
    }

    startLevel(index) {
        if (this.cdTimer) {
            clearInterval(this.cdTimer);
            this.cdTimer = null;
        }
        this.cdRunning = false;
        const cd = document.getElementById('countdown');
        if (cd) {
            cd.style.display = 'none';
            cd.textContent = '';
        }
        if (window.sfx) {
            window.sfx.stop('sys.countdown.tick');
        }

        this.suppressWinLoseOverlay = false;
        this.hideWinLoseOverlays();
        IntervalTracker.clearAll();

        if (this.world && typeof this.world.dispose === 'function') {
            this.world.dispose();
        }

        this.currentLevelIndex = index;
        const factory = this.levelFactories[this.currentLevelIndex];
        const level = factory();

        const startScreen = document.getElementById('start-screen');
        if (startScreen) startScreen.classList.add('hidden');

        this.resetOverlays();
        this.state = GameState.GAME;

        this.world = new World(this.canvas, this.keyboard, level);
        this.showHamburger(true);
        this.setMobileControlsVisible(true);
        if (typeof this.carryOverEnergy !== 'number') {
            this.carryOverEnergy = 100;
        }
        if (this.world && this.world.character) {
            this.world.character.energy = Math.max(0, Math.min(100, this.carryOverEnergy));
            if (this.world.statusBar && typeof this.world.statusBar.setPercentage === 'function') {
                this.world.statusBar.setPercentage(this.world.character.energy);
            }
        }

        this.setHudLevel((this.currentLevelIndex || 0) + 1);

        if (this.world && this.world.character) this.world.character.canControl = false;

        const musicId = 'music.level.loop';
        if (window.sfx) window.sfx.musicTo(musicId, 400);

        this.runCountdown(3, () => {
            if (this.world && this.world.character) this.world.character.canControl = true;
            this.timerStart = Date.now();
            this.timerRunning = true;
            this.stoppedForWinOrLose = false;
            this.showTimer(true);
            this.loopTimer();
            this.loopWinLoseWatch();
        });
    }



    restartToLevel1() {
        this.resetRunTotals();
        this.clearRunOverlayResults();

        this.carryOverEnergy = 100;

        if (this.world && typeof this.world.dispose === 'function') {
            this.world.dispose();
        }

        this.startLevel(0);
    }

    resetRunTotals() {
        this.runResults = [];
        this.totalCounts = { levelComplete: 0, boss: 0, chicken: 0, chickenSmall: 0, bottle: 0, coin: 0 };
        this.totalTimeMs = 0;
    }

    clearRunOverlayResults() {
        const ids = ['go-results', 'victory-results'];
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        }
    }

    showTimer(visible) {
        const el = document.getElementById('hud-timer');
        if (!el) return;
        el.style.display = visible ? 'block' : 'none';
    }

    setHudLevel(n) {
        const el = document.getElementById('hud-level');
        if (el) {
            el.textContent = 'Level ' + n;
            el.style.display = 'block';
        }
    }

    hideHudLevel() {
        const el = document.getElementById('hud-level');
        if (el) {
            el.style.display = 'none';
        }
    }



    formatMs(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');
        return mm + ':' + ss;
    }

    getCurrentLevelNumber() {
        return (this.currentLevelIndex || 0) + 1;
    }

    collectLevelCounts(completed) {
        let boss = 0, chicken = 0, chickenSmall = 0, bottle = 0, coin = 0;
        if (this.world && this.world.stats) {
            boss = Number(this.world.stats.boss || 0);
            chicken = Number(this.world.stats.chicken || 0);
            chickenSmall = Number(this.world.stats.chickenSmall || 0);
            bottle = Number(this.world.stats.bottle || 0);
            coin = Number(this.world.stats.coin || 0);
        }
        return { levelComplete: completed ? 1 : 0, boss, chicken, chickenSmall, bottle, coin };
    }

    addLevelResult(level, timeMs, counts) {
        this.runResults.push({ level, timeMs, counts });
        this.totalTimeMs += Number(timeMs || 0);
        this.totalCounts.levelComplete += Number(counts.levelComplete || 0);
        this.totalCounts.boss += Number(counts.boss || 0);
        this.totalCounts.chicken += Number(counts.chicken || 0);
        this.totalCounts.chickenSmall += Number(counts.chickenSmall || 0);
        this.totalCounts.bottle += Number(counts.bottle || 0);
        this.totalCounts.coin += Number(counts.coin || 0);
    }

    formatMsNumber(ms) {
        const totalSeconds = Math.floor((ms || 0) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');
        return mm + ':' + ss;
    }

    loopTimer() {
        if (!this.timerRunning) {
            return;
        }
        const el = document.getElementById('hud-timer');
        if (el) {
            el.textContent = this.formatMs(Date.now() - this.timerStart);
        }
        requestAnimationFrame(() => this.loopTimer());
    }

    stopTimer() {
        this.timerRunning = false;
        this.showTimer(false);
        this.lastElapsedMs = Date.now() - this.timerStart;
    }

    loopWinLoseWatch() {
        if (this.state !== GameState.GAME || !this.world || this.stoppedForWinOrLose) return;

        if (this.world.gameOver === true) {
            this.stoppedForWinOrLose = true;
            this.stopTimer();
            this.showGameOver();
            return;
        }

        const boss = this.world.boss;
        const bossReady = !!(boss && boss.isDead && boss.isDead() && boss.deathAnimFinished === true);
        const bottlesClear = !this.world.throwableObjects || this.world.throwableObjects.every(b => b.markForRemoval || !b.isSplashing);

        if (bossReady && bottlesClear) {
            this.stoppedForWinOrLose = true;
            this.stopTimer();
            if (this.world) this.world.canFreezeNow = true;
            if (this.world && typeof this.world.freezeAll === 'function') this.world.freezeAll();
            this.showYouWin();
            return;
        }

        setTimeout(() => this.loopWinLoseWatch(), 120);
    }


    showGameOver() {
        this.state = GameState.GAMEOVER;
        this.setMobileControlsVisible(false);
        this.stopTimer();
        if (this.world && this.world.character) this.world.character.canControl = false;

        const hamburgerRoot = document.getElementById('hamburger-root');
        const hamburgerButton = document.getElementById('hamburger-button');
        const hamburgerMenu = document.getElementById('hamburger-menu');
        if (hamburgerRoot) hamburgerRoot.classList.add('hidden');
        if (hamburgerMenu) hamburgerMenu.classList.add('hidden');
        if (hamburgerButton) {
            hamburgerButton.classList.remove('open');
            hamburgerButton.setAttribute('aria-expanded', 'false');
        }

        const image = document.getElementById('overlay-gameover');
        const actions = document.getElementById('gameover-actions');
        if (!image || !actions) return;

        if (window.sfx) {
            window.sfx.stop('music.boss.loop');
            window.sfx.stop('music.level.loop');
            window.sfx.play('sys.gameover.sting');
        }

        image.classList.remove('hidden');
        image.style.display = 'block';
        image.style.opacity = '1';
        image.style.transform = 'translate(-50%, -50%) scale(1)';

        actions.classList.add('hidden');

        const start = performance.now();
        const waitMs = 2000;
        const tick = async (now) => {
            if (now - start >= waitMs) {
                image.classList.add('hidden');
                image.style.display = 'none';
                image.style.opacity = '0';
                image.style.transform = 'translate(-50%, -50%) scale(0.6)';

                if (this.world) {
                    this.world.canFreezeNow = true;
                    if (typeof this.world.freezeAll === 'function') this.world.freezeAll();
                }

                actions.classList.remove('hidden');
                actions.style.display = '';

                const nameGO = this.userName || localStorage.getItem('playerName') || 'Player';
                const levelGO = this.getCurrentLevelNumber();
                const timeGO = this.lastElapsedMs || 0;
                const countsGO = this.collectLevelCounts(false);
                this.addLevelResult(levelGO, timeGO, countsGO);

                const boxRootGO = actions.querySelector('.overlay-box');
                let boxGO = boxRootGO.querySelector('#go-results');
                if (!boxGO) {
                    boxGO = document.createElement('div');
                    boxGO.id = 'go-results';
                    const h2 = boxRootGO.querySelector('h2');
                    if (h2 && h2.nextSibling) {
                        boxRootGO.insertBefore(boxGO, h2.nextSibling);
                    } else {
                        boxRootGO.appendChild(boxGO);
                    }
                }

                LeaderboardFlow.showLevelIntermediate({ containerId: 'go-results', name: nameGO, level: levelGO, timeMs: timeGO, counts: countsGO });
                await LeaderboardFlow.showTotalFinal({ name: nameGO, highestLevel: levelGO, totalTimeMs: this.totalTimeMs, counts: this.totalCounts });

                if (window.sfx) {
                    window.sfx.musicTo('music.menu.loop', 500);
                }

                const btnRestart = document.getElementById('btn-restart');
                if (btnRestart) {
                    btnRestart.onclick = () => {
                        actions.classList.add('hidden');
                        IntervalTracker.clearAll();
                        this.carryOverEnergy = 100;
                        this.restartToLevel1();
                    };
                }
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    showYouWin() {
        this.state = GameState.VICTORY;
        this.setMobileControlsVisible(false);
        this.showHamburger(false);
        this.stopTimer();
        if (this.world && this.world.character) this.world.character.canControl = false;

        const image = document.getElementById('overlay-youwin');
        const actions = document.getElementById('victory-actions');
        const btnNext = document.getElementById('btn-next');
        const btnHome = document.getElementById('btn-home');
        const btnRestart = document.getElementById('btn-restart-win');
        if (!image || !actions) return;

        const bossDone = () => {
            if (!this.world || !this.world.boss) return true;
            return this.world.boss.deathAnimFinished === true;
        };
        const bottlesDone = () => {
            const arr = (this.world && this.world.throwableObjects) ? this.world.throwableObjects : [];
            for (const b of arr) {
                if (!b.markForRemoval && (b.isSplashing || b.moveInterval || b.splashInterval)) return false;
            }
            return true;
        };
        const waitUntilCalm = (callback) => {
            if (bossDone() && bottlesDone()) {
                setTimeout(callback, 150);
            } else {
                setTimeout(() => waitUntilCalm(callback), 80);
            }
        };

        waitUntilCalm(() => {
            if (this.world && typeof this.world.freezeAll === 'function') this.world.freezeAll();

            if (btnHome) {
                btnHome.classList.remove('hidden');
                btnHome.style.display = '';
            }
            if (btnNext) {
                if (this.currentLevelIndex < this.levelFactories.length - 1) {
                    btnNext.classList.remove('hidden');
                } else {
                    btnNext.classList.add('hidden');
                }
            }

            actions.classList.add('hidden');

            if (window.sfx) {
                window.sfx.stop('music.boss.loop');
                window.sfx.stop('music.level.loop');
                window.sfx.play('sys.win.sting');
            }

            image.classList.remove('hidden');
            image.style.display = 'block';
            image.style.opacity = '1';
            image.style.transform = 'translate(-50%, -50%) scale(1)';

            const start = performance.now();
            const waitMs = 2000;
            const tick = async (now) => {
                if (now - start >= waitMs) {
                    image.classList.add('hidden');
                    image.style.display = 'none';
                    image.style.opacity = '0';
                    image.style.transform = 'translate(-50%, -50%) scale(0.6)';

                    actions.classList.remove('hidden');
                    actions.style.display = '';

                    const nameVW = this.userName || localStorage.getItem('playerName') || 'Player';
                    const levelVW = this.getCurrentLevelNumber();
                    const timeVW = this.lastElapsedMs || 0;
                    const countsVW = this.collectLevelCounts(true);
                    this.addLevelResult(levelVW, timeVW, countsVW);

                    const boxRootVW = actions.querySelector('.overlay-box');
                    let boxVW = boxRootVW.querySelector('#victory-results');
                    if (!boxVW) {
                        boxVW = document.createElement('div');
                        boxVW.id = 'victory-results';
                        const h2 = boxRootVW.querySelector('h2');
                        if (h2 && h2.nextSibling) {
                            boxRootVW.insertBefore(boxVW, h2.nextSibling);
                        } else {
                            boxRootVW.appendChild(boxVW);
                        }
                    }

                    LeaderboardFlow.showLevelIntermediate({ containerId: 'victory-results', name: nameVW, level: levelVW, timeMs: timeVW, counts: countsVW });
                    await LeaderboardFlow.showTotalFinal({ name: nameVW, highestLevel: levelVW, totalTimeMs: this.totalTimeMs, counts: this.totalCounts });

                    if (window.sfx) {
                        window.sfx.musicTo('music.menu.loop', 500);
                    }

                    if (btnRestart) {
                        btnRestart.onclick = () => {
                            actions.classList.add('hidden');
                            IntervalTracker.clearAll();
                            this.carryOverEnergy = 100;
                            this.restartToLevel1();
                        };
                    }
                    if (btnNext) {
                        btnNext.onclick = () => {
                            actions.classList.add('hidden');
                            IntervalTracker.clearAll();
                            this.carryOverEnergy = (this.world && this.world.character) ? this.world.character.energy : 100;
                            this.startLevel(this.currentLevelIndex + 1);
                        };
                    }
                    if (btnHome) {
                        btnHome.onclick = () => {
                            actions.classList.add('hidden');
                            IntervalTracker.clearAll();

                            this.carryOverEnergy = 100;

                            this.resetRunTotals();
                            this.clearRunOverlayResults();

                            this.showMenu();
                        };
                    }
                    return;
                }
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });

    }

    setMobileControlsVisible(visible) {
        const el = document.getElementById('mobile-controls');
        if (el) el.classList.toggle('is-active', !!visible);
    }

    runCountdown(seconds, onDone) {
        if (this.cdRunning) return;
        this.cdRunning = true;
        if (this.cdTimer) {
            clearInterval(this.cdTimer);
            this.cdTimer = null;
        }

        const cd = document.getElementById('countdown');
        if (!cd) {
            this.cdRunning = false;
            if (typeof onDone === 'function') onDone();
            return;
        }

        let n = seconds;
        cd.style.display = 'flex';
        cd.textContent = String(n);

        if (window.sfx) {
            window.sfx.stop('sys.countdown.tick');
            window.sfx.play('sys.countdown.tick');
        }

        this.cdTimer = setInterval(() => {
            n -= 1;
            if (n > 0) {
                cd.textContent = String(n);
            } else {
                cd.textContent = 'Go!';
                clearInterval(this.cdTimer);
                this.cdTimer = null;
                setTimeout(() => {
                    cd.style.display = 'none';
                    this.cdRunning = false;
                    if (typeof onDone === 'function') onDone();
                }, 600);
            }
        }, 1000);
    }


    getElapsedMs() {
        if (!this.timerRunning) return 0;
        return Date.now() - this.timerStart;
    }
}

let app = null;
