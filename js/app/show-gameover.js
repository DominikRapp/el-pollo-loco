function showGameOver(app) {
    app.state = GameState.GAMEOVER;
    app.setMobileControlsVisible(false);
    app.stopTimer();
    if (app.world && app.world.character) app.world.character.canControl = false;

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

            if (app.world) {
                app.world.canFreezeNow = true;
                if (typeof app.world.freezeAll === 'function') app.world.freezeAll();
            }

            actions.classList.remove('hidden');
            actions.style.display = '';

            const nameGO = app.userName || localStorage.getItem('playerName') || 'Player';
            const levelGO = app.getCurrentLevelNumber();
            const timeGO = app.lastElapsedMs || 0;
            const countsGO = app.collectLevelCounts(false);
            app.addLevelResult(levelGO, timeGO, countsGO);

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
            await LeaderboardFlow.showTotalFinal({ name: nameGO, highestLevel: levelGO, totalTimeMs: app.totalTimeMs, counts: app.totalCounts });

            if (window.sfx) {
                window.sfx.musicTo('music.menu.loop', 500);
            }

            const btnRestart = document.getElementById('btn-restart');
            if (btnRestart) {
                btnRestart.onclick = () => {
                    actions.classList.add('hidden');
                    IntervalTracker.clearAll();
                    app.carryOverEnergy = 100;
                    app.restartToLevel1();
                };
            }
            return;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}
