const GameState = { INTRO: 'INTRO', MENU: 'MENU', GAME: 'GAME', GAMEOVER: 'GAMEOVER', VICTORY: 'VICTORY' };

(function preloadOverlays() {
    ['img/You won, you lost/Game over A.png', 'img/You won, you lost/You Win A.png']
        .forEach(src => { const i = new Image(); i.src = src; });
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
        if (canvasHeight) this.y = Math.max(0, Math.min(canvasHeight - this.height, 335));
    }

    update() {
        this.x += 6;
        this.tick++;
        if (this.tick % 6 === 0) {
            this.img = this.imageCache[this.frames[this.idx]];
            this.idx = (this.idx + 1) % this.frames.length;
        }
        if (this.x > 1200) this.done = true;
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
    nameValid = false;
    userName = '';
    lang = null;
    visitedTos = false;
    visitedPrivacy = false;
    levels = [];
    currentLevelIndex = 0;

    show(el) { if (el) el.classList.remove('hidden'); }
    hide(el) { if (el) el.classList.add('hidden'); }

    init(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.loadPersistedName();
        this.wireStartScreenControls();
        this.startSequence();
        this.levels = [createLevel1, createLevel2, createLevel3, createLevel4, createLevel5];
        this.currentLevelIndex = 0;
        const btn = document.getElementById('btn-start');
        if (btn) {
            btn.addEventListener('click', () => {
                if (!this.nameValid) return;
                const accepted = document.getElementById('accept-legal')?.checked;
                if (!accepted) return;
                this.persistName(this.userName);
                this.startGame();
            });
        }
        const devBtn = document.getElementById('btn-dev-start');
        if (devBtn) {
            devBtn.onclick = () => {
                const nameInput = document.getElementById('player-name');
                if (nameInput && !nameInput.value.trim()) {
                    nameInput.value = 'dev';
                    this.userName = 'dev';
                    this.nameValid = true;
                }
                this.persistName(this.userName || 'dev');
                this.startGame();
            };
        }
    }

    showMenu() {
        this.state = GameState.MENU;
        const start = document.getElementById('start-screen');
        const langSel = document.getElementById('lang-select');
        const legal = document.getElementById('legal-step');
        const nameStep = document.getElementById('name-step');
        this.show(start);
        this.show(langSel);
        this.hide(legal);
        this.hide(nameStep);
    }

    wireStartScreenControls() {
        const langSel = document.getElementById('lang-select');
        const legal = document.getElementById('legal-step');
        const nameStep = document.getElementById('name-step');
        const btnStart = document.getElementById('btn-start');
        const nameInput = document.getElementById('player-name');
        const nameErr = document.getElementById('name-error');
        const accept = document.getElementById('accept-legal');
        const linkTos = document.getElementById('link-tos');
        const linkPrivacy = document.getElementById('link-privacy');

        const updateEnablement = () => {
            if (accept) accept.disabled = !(this.visitedTos && this.visitedPrivacy);
            if (nameInput) nameInput.disabled = !accept?.checked;
            if (btnStart) btnStart.disabled = !(accept?.checked && this.nameValid);
        };

        if (langSel) {
            langSel.querySelectorAll('button')?.forEach(b => {
                b.addEventListener('click', () => {
                    this.lang = b.getAttribute('data-lang') || 'de';
                    this.hide(langSel);
                    this.show(legal);
                    updateEnablement();
                });
            });
        }

        if (linkTos) linkTos.addEventListener('click', () => { this.visitedTos = true; setTimeout(updateEnablement, 0); });
        if (linkPrivacy) linkPrivacy.addEventListener('click', () => { this.visitedPrivacy = true; setTimeout(updateEnablement, 0); });

        if (accept) {
            accept.addEventListener('change', () => {
                if (accept.checked) this.show(nameStep); else this.hide(nameStep);
                updateEnablement();
            });
        }

        const isNameTakenLocal = (name) => {
            const raw = localStorage.getItem('usedNames') || '[]';
            try { const arr = JSON.parse(raw); return arr.includes(name.toLowerCase()); }
            catch { return false; }
        };

        const validate = () => {
            const v = (nameInput?.value || '').trim();
            this.userName = v;
            const basicOk = v.length >= 3 && v.length <= 16 && /^[a-z0-9_]+$/i.test(v);
            const taken = v ? isNameTakenLocal(v) : false;

            if (!basicOk) {
                this.nameValid = false;
                if (nameErr) { nameErr.textContent = '3–16 Zeichen, nur Buchstaben/Zahlen/_.'; nameErr.classList.remove('hidden'); }
            } else if (taken && v.toLowerCase() !== (localStorage.getItem('playerName') || '').toLowerCase()) {
                this.nameValid = false;
                if (nameErr) { nameErr.textContent = 'Name ist bereits vergeben.'; nameErr.classList.remove('hidden'); }
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
    }

    resetOverlays() {
        const ids = ['overlay-gameover', 'overlay-youwin'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.classList.remove('pop-in');
            }
        });
        const go = document.getElementById('gameover-actions');
        const vi = document.getElementById('victory-actions');
        if (go) go.classList.add('hidden');
        if (vi) vi.classList.add('hidden');
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

    loadPersistedName() {
        const saved = localStorage.getItem('playerName');
        if (saved) {
            this.userName = saved;
            this.nameValid = true;
        }
    }

    startSequence() {
        const splash = document.getElementById('splash-start');
        if (!splash) { this.startIntro(); return; }
        splash.style.display = 'block';
        splash.style.opacity = '1';
        let o = 1;
        setTimeout(() => {
            const fade = () => {
                o -= 0.03;
                if (o <= 0) {
                    splash.style.display = 'none';
                    this.startIntro();
                    return;
                }
                splash.style.opacity = String(o);
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
        const start = document.getElementById('start-screen');
        if (start) start.classList.add('hidden');
        this.state = GameState.GAME;
        const makeLevel = this.levels[this.currentLevelIndex];
        const level = makeLevel();
        this.world = new World(this.canvas, this.keyboard, level);
        if (this.world?.character) this.world.character.canControl = false;
        this.runCountdown(3, () => {
            if (this.world?.character) this.world.character.canControl = true;
            this.timerStart = Date.now();
            this.timerRunning = true;
            this.stoppedForWinOrLose = false;
            this.showTimer(true);
            this.loopTimer();
            this.loopWinLoseWatch();
        });
    }

    showTimer(visible) {
        const el = document.getElementById('hud-timer');
        if (!el) return;
        el.style.display = visible ? 'block' : 'none';
    }

    formatMs(ms) {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    loopTimer() {
        if (!this.timerRunning) return;
        const el = document.getElementById('hud-timer');
        if (el) el.textContent = this.formatMs(Date.now() - this.timerStart);
        requestAnimationFrame(() => this.loopTimer());
    }

    stopTimer() {
        this.timerRunning = false;
        this.showTimer(false);
    }

    loopWinLoseWatch() {
        if (this.state !== GameState.GAME || !this.world || this.stoppedForWinOrLose) return;
        const lost = this.world.gameOver === true;
        if (lost) {
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
            this.world.freezeAll();
            this.showYouWin();
            return;
        }
        setTimeout(() => this.loopWinLoseWatch(), 120);
    }

    showGameOver() {
        this.state = GameState.GAMEOVER;
        const img = document.getElementById('overlay-gameover');
        const actions = document.getElementById('gameover-actions');
        if (!img || !actions) return;
        actions.classList.add('hidden');
        img.style.display = 'block';
        requestAnimationFrame(() => img.classList.add('pop-in'));
        setTimeout(() => {
            img.classList.remove('pop-in');
            setTimeout(() => {
                img.style.display = 'none';
                actions.classList.remove('hidden');
                const btnRestart = document.getElementById('btn-restart');
                if (btnRestart) {
                    btnRestart.onclick = () => {
                        actions.classList.add('hidden');
                        this.currentLevelIndex = 0;
                        this.startGame();
                    };
                }
            }, 250);
        }, 2000);
    }

    showYouWin() {
        this.state = GameState.VICTORY;
        const img = document.getElementById('overlay-youwin');
        const actions = document.getElementById('victory-actions');
        if (!img || !actions) return;
        const btnRestart = document.getElementById('btn-restart-win');
        const btnNext = document.getElementById('btn-next');
        const btnHome = document.getElementById('btn-home');
        const last = (this.currentLevelIndex >= this.levels.length - 1);
        if (btnNext) btnNext.classList.toggle('hidden', last);
        if (btnHome) btnHome.classList.toggle('hidden', !last);
        actions.classList.add('hidden');
        img.style.display = 'block';
        requestAnimationFrame(() => img.classList.add('pop-in'));

        setTimeout(() => {
            img.classList.remove('pop-in');
            setTimeout(() => {
                img.style.display = 'none';
                actions.classList.remove('hidden');
                if (btnRestart) {
                    btnRestart.onclick = () => {
                        actions.classList.add('hidden');
                        this.currentLevelIndex = 0;
                        this.startGame();
                    };
                }
                if (btnNext) {
                    btnNext.onclick = () => {
                        actions.classList.add('hidden');
                        if (this.currentLevelIndex < this.levels.length - 1) {
                            this.currentLevelIndex += 1;
                        }
                        this.startGame();
                    };
                }
                if (btnHome) {
                    btnHome.onclick = () => {
                        actions.classList.add('hidden');
                        this.currentLevelIndex = 0;
                        this.showMenu();
                    };
                }
            }, 250);
        }, 2000);
    }

    runCountdown(seconds, onDone) {
        const cd = document.getElementById('countdown');
        if (!cd) { onDone?.(); return; }
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
                    onDone?.();
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
