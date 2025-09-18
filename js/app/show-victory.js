function showYouWin(app) {
    app.state = GameState.VICTORY;
    app.setMobileControlsVisible(false);
    app.showHamburger(false);
    app.stopTimer();
    if (app.world && app.world.character) app.world.character.canControl = false;

    const image = document.getElementById('overlay-youwin');
    const actions = document.getElementById('victory-actions');
    const btnNext = document.getElementById('btn-next');
    const btnHome = document.getElementById('btn-home');
    const btnRestart = document.getElementById('btn-restart-win');
    if (!image || !actions) return;

    const bossDone = () => {
        if (!app.world || !app.world.boss) return true;
        return app.world.boss.deathAnimFinished === true;
    };
    const bottlesDone = () => {
        const arr = (app.world && app.world.throwableObjects) ? app.world.throwableObjects : [];
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
        if (app.world && typeof app.world.freezeAll === 'function') app.world.freezeAll();

        if (btnHome) {
            btnHome.classList.remove('hidden');
            btnHome.style.display = '';
        }
        if (btnNext) {
            if (app.currentLevelIndex < app.levelFactories.length - 1) {
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

                const nameVW = app.userName || localStorage.getItem('playerName') || 'Player';
                const levelVW = app.getCurrentLevelNumber();
                const timeVW = app.lastElapsedMs || 0;
                const countsVW = app.collectLevelCounts(true);
                app.addLevelResult(levelVW, timeVW, countsVW);

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
                await LeaderboardFlow.showTotalFinal({ name: nameVW, highestLevel: levelVW, totalTimeMs: app.totalTimeMs, counts: app.totalCounts });

                if (window.sfx) {
                    window.sfx.musicTo('music.menu.loop', 500);
                }

                if (btnRestart) {
                    btnRestart.onclick = () => {
                        actions.classList.add('hidden');
                        IntervalTracker.clearAll();
                        app.carryOverEnergy = 100;
                        app.restartToLevel1();
                    };
                }
                if (btnNext) {
                    btnNext.onclick = () => {
                        actions.classList.add('hidden');
                        IntervalTracker.clearAll();
                        app.carryOverEnergy = (app.world && app.world.character) ? app.world.character.energy : 100;
                        app.startLevel(app.currentLevelIndex + 1);
                    };
                }
                if (btnHome) {
                    btnHome.onclick = () => {
                        actions.classList.add('hidden');
                        IntervalTracker.clearAll();

                        app.carryOverEnergy = 100;

                        app.resetRunTotals();
                        app.clearRunOverlayResults();

                        app.showMenu();
                    };
                }
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });

}
