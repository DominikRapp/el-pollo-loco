let app = null;

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

    init(canvas, keyboard) {
        this.setupAudio();
        this.setupCore(canvas, keyboard);
        this.attachAll();
        this.wireAll();
    }

    setupAudio() {
        setMuted(isMuted());
        const preset = AudioPrefs.load();
        if (window.sfx) AudioPrefs.applyToSfx(window.sfx, preset);
        window.addEventListener('sfx-ready', () => AudioPrefs.applyToSfx(window.sfx, AudioPrefs.load()));
    }

    setupCore(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.levels = [createLevel1, createLevel2, createLevel3, createLevel4, createLevel5];
        this.currentLevelIndex = 0;
    }

    attachAll() {
        attachTimer(this);
        attachWinLoseUtils(this);
        attachTimeFormat(this);
        attachStartLevel(this);
        attachHamburgerUtils(this);
        attachRunStats(this);
        attachInstructionsPages(this);
        attachPlayerName(this);
        attachResetOverlays(this);
        attachHudUtils(this);
        attachShowMenu(this);
        attachWinLoseWatch(this);
        attachDomUtils(this);
        attachAppHelpers(this);
        attachRestart(this);
        attachLeaderboardPages(this);
    }

    wireAll() {
        wireStartScreenControls(this);
        wireInstructionsOverlay(this);
        wireLeaderboardOverlay(this);
        wireSettingsOverlay(this);
        startSequence(this);
        wireHamburgerMenu(this);
        wireHomeActions(this);
        wireFullscreenToggle(this);
        wireMobileButtons(this);
    }
}
