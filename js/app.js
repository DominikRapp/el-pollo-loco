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
    levelFactories = [createLevel1, createLevel2, createLevel3, createLevel4, createLevel5];

    carryOverEnergy = 100;

    show(el) { if (el) el.classList.remove('hidden'); }
    hide(el) { if (el) el.classList.add('hidden'); }

    init(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;

        this.levels = [createLevel1, createLevel2, createLevel3, createLevel4, createLevel5];
        this.currentLevelIndex = 0;

        this.wireStartScreenControls();
        this.startSequence();
        this.wireHamburgerMenu();
        this.wireInstructionsOverlay();
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
        const box = overlay ? overlay.querySelector('.instructions-box') : null;
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
            let target = Math.max(0, Math.min(index, total - 1));
            this.currentInstructionsPage = target;
            content.innerHTML = this.instructionsPages[target];
            pageIndicator.textContent = 'Page ' + (target + 1) + ' of ' + total;
        };

        const openOverlay = () => {
            overlay.classList.remove('hidden');
            renderPage(0);
        };

        const closeOverlay = () => {
            overlay.classList.add('hidden');
        };

        const goPrev = () => {
            if (this.currentInstructionsPage > 0) {
                renderPage(this.currentInstructionsPage - 1);
            }
        };

        const goNext = () => {
            if (this.currentInstructionsPage < this.instructionsPages.length - 1) {
                renderPage(this.currentInstructionsPage + 1);
            }
        };

        const openLinks = [
            document.getElementById('menu-instructions'),
            document.getElementById('btn-instructions-go'),
            document.getElementById('btn-instructions-victory')
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
            if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
                closeOverlay();
            }
        });
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
        if (this.world && typeof this.world.dispose === 'function') {
            this.world.dispose();
        }
        IntervalTracker.clearAll();

        this.state = GameState.MENU;
        this.showHamburger(false);

        const startScreen = document.getElementById('start-screen');
        this.show(startScreen);

        this.hideHudLevel();
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
        this.intro = new IntroPepe(this.canvas.height);
        this.loopIntro();
    }

    loopIntro() {
        if (this.state !== GameState.INTRO) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.intro.update();
        this.intro.draw(this.ctx);
        if (this.intro.done) {
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

        const image = document.getElementById('overlay-gameover');
        const actions = document.getElementById('gameover-actions');
        if (!image || !actions) return;

        image.classList.remove('hidden');
        image.style.display = 'block';
        image.style.opacity = '1';
        image.style.transform = 'scale(1)';

        actions.classList.add('hidden');

        const start = performance.now();
        const waitMs = 2000;
        const tick = (now) => {
            if (now - start >= waitMs) {
                image.classList.add('hidden');
                image.style.display = 'none';
                image.style.opacity = '0';
                image.style.transform = 'scale(0.6)';

                if (this.world) {
                    this.world.canFreezeNow = true;
                    if (typeof this.world.freezeAll === 'function') this.world.freezeAll();
                }

                actions.classList.remove('hidden');

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

            if (btnNext && btnHome) {
                if (this.currentLevelIndex < this.levelFactories.length - 1) {
                    btnNext.classList.remove('hidden');
                    btnHome.classList.add('hidden');
                } else {
                    btnNext.classList.add('hidden');
                    btnHome.classList.remove('hidden');
                }
            }

            actions.classList.add('hidden');

            image.classList.remove('hidden');
            image.style.display = 'block';
            image.style.opacity = '1';
            image.style.transform = 'scale(1)';

            const start = performance.now();
            const waitMs = 2000;
            const tick = (now) => {
                if (now - start >= waitMs) {
                    image.classList.add('hidden');
                    image.style.display = 'none';
                    image.style.opacity = '0';
                    image.style.transform = 'scale(0.6)';

                    actions.classList.remove('hidden');

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
        const cd = document.getElementById('countdown');
        if (!cd) {
            if (typeof onDone === 'function') onDone();
            return;
        }
        let n = seconds;
        cd.style.display = 'flex';
        cd.textContent = String(n);

        const tick = () => {
            n -= 1;
            if (n > 0) {
                cd.textContent = String(n);
                setTimeout(tick, 1000);
            } else {
                cd.textContent = 'Go!';
                setTimeout(() => {
                    cd.style.display = 'none';
                    if (typeof onDone === 'function') onDone();
                }, 600);
            }
        };

        setTimeout(tick, 1000);
    }

    getElapsedMs() {
        if (!this.timerRunning) return 0;
        return Date.now() - this.timerStart;
    }
}

let app = null;
