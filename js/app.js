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

    show(el) {
        if (el) el.classList.remove('hidden');
    }

    hide(el) {
        if (el) el.classList.add('hidden');
    }

    init(canvas, keyboard) {
        setMuted(isMuted());
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.levels = [createLevel1, createLevel2, createLevel3, createLevel4, createLevel5];
        this.currentLevelIndex = 0;
        this.wireStartScreenControls();
        this.wireInstructionsOverlay();
        this.wireScoreboardOverlay();
        this.wireSettingsOverlay();
        this.startSequence();
        this.wireHamburgerMenu();
        this.wireHomeActions();
        this.wireFullscreenToggle();
    }

    wireStartScreenControls() {
        const btnStart = document.getElementById('btn-start');
        const nameInput = document.getElementById('player-name');
        const nameErr = document.getElementById('name-error');

        const updateEnablement = () => {
            if (btnStart) btnStart.disabled = !this.nameValid;
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

        const validate = () => {
            const value = (nameInput?.value || '').trim();
            this.userName = value;
            const basicOk = value.length >= 3 && value.length <= 16 && /^[a-z0-9_]+$/i.test(value);
            const taken = value ? isNameTakenLocal(value) : false;

            if (!basicOk) {
                this.nameValid = false;
                if (nameErr) {
                    nameErr.textContent = '3–16 Zeichen, nur Buchstaben/Zahlen/_.';
                    nameErr.classList.remove('hidden');
                }
            } else if (taken && value.toLowerCase() !== (localStorage.getItem('playerName') || '').toLowerCase()) {
                this.nameValid = false;
                if (nameErr) {
                    nameErr.textContent = 'Name ist bereits vergeben.';
                    nameErr.classList.remove('hidden');
                }
            } else {
                this.nameValid = true;
                if (nameErr) nameErr.classList.add('hidden');
            }
            updateEnablement();
        };

        if (nameInput) {
            nameInput.addEventListener('input', validate);
            nameInput.addEventListener('blur', validate);
        }

        const saved = localStorage.getItem('playerName');
        if (saved && nameInput) {
            nameInput.value = saved;
            this.userName = saved;
            this.nameValid = true;
        }

        updateEnablement();

        if (btnStart) {
            btnStart.addEventListener('click', () => {
                if (!this.nameValid) return;
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

        if (!overlay || !content || !closeBtn) {
            return;
        }

        const renameTriggerLabels = () => {
            const ids = [
                'menu-settings',
                'btn-settings-home',
                'btn-settings-go',
                'btn-settings-victory'
            ];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                const txt = (el.textContent || '').trim().toLowerCase();
                if (txt.includes('settings') || txt === '' || txt.includes('sound')) {
                    el.textContent = 'Audio';
                }
                if (el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Audio');
                if (el.title) el.title = 'Audio';
            });
        };

        const ensureExclusiveOpen = () => {
            this.hideWinLoseOverlays();
            const others = [
                document.getElementById('instructions-overlay'),
                document.getElementById('scoreboard-overlay'),
                document.getElementById('start-screen')
            ];
            for (const el of others) { if (el) el.classList.add('hidden'); }
        };

        const initControls = () => {
            if (this.settingsBuilt) return;

            const getVal = (x) => Math.round(x * 100);
            const s = window.sfx;
            const m = s ? s.master : 0.1;
            const v = s ? s.volumes || {} : {};
            const vm = typeof v.music === 'number' ? v.music : 0.1;
            const vs = typeof v.system === 'number' ? v.system : 0.1;
            const vc = typeof v.characters === 'number' ? v.characters : 0.1;
            const vo = typeof v.objects === 'number' ? v.objects : 0.1;
            const muted = typeof isMuted === 'function' ? isMuted() : (localStorage.getItem('muted') === '1');

            content.innerHTML = `
            <h3>Audio</h3>
            <div class="settings-group">
                <button id="btn-mute-toggle" class="btn">${muted ? 'Mute: ON' : 'Mute: OFF'}</button>
            </div>
            <div class="settings-group">
                <label for="slider-master">Gesamt (Master): <span id="val-master">${getVal(m)}%</span></label>
                <input id="slider-master" type="range" min="0" max="100" step="1" value="${getVal(m)}" />
            </div>
            <div class="settings-group">
                <label for="slider-music">Musik (Music): <span id="val-music">${getVal(vm)}%</span></label>
                <input id="slider-music" type="range" min="0" max="100" step="1" value="${getVal(vm)}" />
            </div>
            <div class="settings-group">
                <label for="slider-system">Game Sounds (SFX → System): <span id="val-system">${getVal(vs)}%</span></label>
                <input id="slider-system" type="range" min="0" max="100" step="1" value="${getVal(vs)}" />
            </div>
            <div class="settings-group">
                <label for="slider-characters">Characters (SFX → Characters): <span id="val-characters">${getVal(vc)}%</span></label>
                <input id="slider-characters" type="range" min="0" max="100" step="1" value="${getVal(vc)}" />
            </div>
            <div class="settings-group">
                <label for="slider-objects">Objects (SFX → Objects): <span id="val-objects">${getVal(vo)}%</span></label>
                <input id="slider-objects" type="range" min="0" max="100" step="1" value="${getVal(vo)}" />
            </div>
        `;

            const qs = (id) => content.querySelector(id);
            const btnMute = qs('#btn-mute-toggle');
            const sliderMaster = qs('#slider-master');
            const sliderMusic = qs('#slider-music');
            const sliderSystem = qs('#slider-system');
            const sliderCharacters = qs('#slider-characters');
            const sliderObjects = qs('#slider-objects');

            const valMaster = qs('#val-master');
            const valMusic = qs('#val-music');
            const valSystem = qs('#val-system');
            const valCharacters = qs('#val-characters');
            const valObjects = qs('#val-objects');

            const to01 = (x) => Math.max(0, Math.min(1, x / 100));

            const setBtnLabel = () => {
                const on = typeof isMuted === 'function' ? isMuted() : (localStorage.getItem('muted') === '1');
                if (btnMute) btnMute.textContent = on ? 'Mute: ON' : 'Mute: OFF';
            };

            if (btnMute) {
                btnMute.addEventListener('click', () => {
                    const on = typeof isMuted === 'function' ? isMuted() : (localStorage.getItem('muted') === '1');
                    const to = !on;
                    if (typeof setMuted === 'function') setMuted(to);
                    else {
                        localStorage.setItem('muted', to ? '1' : '0');
                        if (window.sfx) window.sfx.setMuted(to);
                    }
                    setBtnLabel();
                });
                window.addEventListener('app-mute-changed', setBtnLabel);
            }

            sliderMaster.addEventListener('input', () => {
                const n = Number(sliderMaster.value);
                valMaster.textContent = n + '%';
                if (window.sfx) window.sfx.setMaster(to01(n));
            });
            sliderMusic.addEventListener('input', () => {
                const n = Number(sliderMusic.value);
                valMusic.textContent = n + '%';
                if (window.sfx) window.sfx.setBusVolume('music', to01(n));
            });
            sliderSystem.addEventListener('input', () => {
                const n = Number(sliderSystem.value);
                valSystem.textContent = n + '%';
                if (window.sfx) window.sfx.setBusVolume('system', to01(n));
            });
            sliderCharacters.addEventListener('input', () => {
                const n = Number(sliderCharacters.value);
                valCharacters.textContent = n + '%';
                if (window.sfx) window.sfx.setBusVolume('characters', to01(n));
            });
            sliderObjects.addEventListener('input', () => {
                const n = Number(sliderObjects.value);
                valObjects.textContent = n + '%';
                if (window.sfx) window.sfx.setBusVolume('objects', to01(n));
            });

            this.settingsBuilt = true;
        };

        const openOverlay = () => {
            ensureExclusiveOpen();
            this.suppressWinLose();
            if (typeof this.closeHamburgerMenu === 'function') this.closeHamburgerMenu();
            renameTriggerLabels();
            initControls();
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

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) closeOverlay();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !overlay.classList.contains('hidden')) closeOverlay();
        });
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
                document.getElementById('scoreboard-overlay'),
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

    wireScoreboardOverlay() {
        this.scoreboardPages = this.buildScoreboardPages();
        this.currentScoreboardPage = 0;

        const overlay = document.getElementById('scoreboard-overlay');
        const box = overlay ? overlay.querySelector('.overlay-box') : null;
        const content = document.getElementById('scoreboard-content');
        const prevBtn = document.getElementById('scoreboard-prev');
        const nextBtn = document.getElementById('scoreboard-next');
        const pageIndicator = document.getElementById('scoreboard-page-indicator');
        const closeBtn = document.getElementById('scoreboard-close');

        if (!overlay || !box || !content || !prevBtn || !nextBtn || !pageIndicator || !closeBtn) {
            return;
        }

        const renderPage = (index) => {
            const total = this.scoreboardPages.length;
            const target = Math.max(0, Math.min(index, total - 1));
            this.currentScoreboardPage = target;
            content.innerHTML = this.scoreboardPages[target];
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
            if (this.currentScoreboardPage > 0) renderPage(this.currentScoreboardPage - 1);
        };

        const goNext = () => {
            if (this.currentScoreboardPage < this.scoreboardPages.length - 1) renderPage(this.currentScoreboardPage + 1);
        };

        const openLinks = [
            document.getElementById('btn-scoreboard-go'),
            document.getElementById('btn-scoreboard-victory'),
            document.getElementById('btn-scoreboard-home')
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
            this.resetOverlays();
            this.hideWinLoseOverlays();
            this.showMenu();
        };

        if (btnHomeGo) btnHomeGo.addEventListener('click', goHome);
        if (menuHome) menuHome.addEventListener('click', goHome);

        if (btnHomeWin) {
            btnHomeWin.addEventListener('click', goHome);
        }
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
            '<h3>Welcome</h3><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p><p>Move with A/D, jump with Space, throw with S. Collect coins to heal 20 HP. Defeat enemies and the boss to win the level.</p>',
            '<h3>Movement</h3><p>Use <b>A</b> to move left and <b>D</b> to move right. Jump with <b>Space</b>.</p>',
            '<h3>Throwing</h3><p>Press <b>S</b> to throw a bottle. Bottles hurt enemies, especially the boss.</p>',
            '<h3>Platforms & Barrels</h3><p>Stand on platforms and avoid getting stuck at barrels. Position matters!</p>',
            '<h3>Enemies</h3><p>Jump on small chickens to defeat them. Beware of contact damage.</p>',
            '<h3>Boss</h3><p>The boss deals 20 damage on contact. Use bottles and timing.</p>',
            '<h3>Health & HUD</h3><p>Health does not reset between levels. Coins heal <b>20</b>. Watch the status bar.</p>',
            '<h3>Bottles & Coins</h3><p>Pick up bottles and coins. Bottle bar and coin bar show your current amount.</p>',
            '<h3>Timer</h3><p>The timer runs only during gameplay. It stops on Game Over and Victory.</p>',
            '<h3>Good luck!</h3><p>Have fun and try to clear all levels!</p>'
        ];
    }

    buildScoreboardPages() {
        const raw = localStorage.getItem('scoreboard_rankings') || '{}';
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
            const mm = String(minutes).padStart(2, '0');
            const ss = String(seconds).padStart(2, '0');
            return mm + ':' + ss;
        };

        const pts = (c) => {
            const b = c && c.boss ? c.boss : 0;
            const ch = c && c.chicken ? c.chicken : 0;
            const cs = c && c.chickenSmall ? c.chickenSmall : 0;
            const bo = c && c.bottle ? c.bottle : 0;
            const co = c && c.coin ? c.coin : 0;
            return b * 10 + ch * 5 + cs * 3 + bo * 2 + co * 1;
        };

        const sortByPointsThenTime = (arr) => {
            return arr.slice().sort((a, b) => {
                const pa = pts(a.counts || {});
                const pb = pts(b.counts || {});
                if (pb !== pa) return pb - pa;
                const ta = typeof a.timeMs === 'number' ? a.timeMs : Number.MAX_SAFE_INTEGER;
                const tb = typeof b.timeMs === 'number' ? b.timeMs : Number.MAX_SAFE_INTEGER;
                return ta - tb;
            }).slice(0, 10);
        };

        const rankRowsTotal = (arr) => {
            const rows = [];
            const sorted = sortByPointsThenTime(arr);
            sorted.forEach((e, i) => {
                const name = e && e.name ? e.name : 'Player';
                const highest = e && typeof e.highestLevel === 'number' ? e.highestLevel : 0;
                const time = mmss(e && typeof e.totalTimeMs === 'number' ? e.totalTimeMs : null);
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
                    + '<td>' + time + '</td>'
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
            const sorted = sortByPointsThenTime(arr);
            sorted.forEach((e, i) => {
                const name = e && e.name ? e.name : 'Player';
                const time = mmss(e && typeof e.timeMs === 'number' ? e.timeMs : null);
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
                    + '<td>' + time + '</td>'
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
            '<table class="scoreboard-table">'
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
                '<table class="scoreboard-table">'
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
        this.carryOverEnergy = 100;

        if (this.world && typeof this.world.dispose === 'function') {
            this.world.dispose();
        }

        this.startLevel(0);
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
        const tick = (now) => {
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
            const tick = (now) => {
                if (now - start >= waitMs) {
                    image.classList.add('hidden');
                    image.style.display = 'none';
                    image.style.opacity = '0';
                    image.style.transform = 'translate(-50%, -50%) scale(0.6)';

                    actions.classList.remove('hidden');
                    actions.style.display = '';

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
