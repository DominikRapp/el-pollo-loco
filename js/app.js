/**
 * Global app instance reference.
 * @type {App|null}
 */
let app = null;

/**
 * Main game application orchestrating state, canvas, levels, audio and UI wiring.
 * @class
 * @property {number} state - Current game state (see GameState)
 * @property {HTMLCanvasElement|null} canvas - Render target canvas
 * @property {CanvasRenderingContext2D|null} ctx - 2D rendering context
 * @property {object|null} world - Current game world instance
 * @property {object|null} keyboard - Mutable keyboard map (e.g., { LEFT: boolean, ... })
 * @property {object|null} intro - Optional intro controller/state
 * @property {number} timerStart - Epoch ms when timer started
 * @property {boolean} timerRunning - True while run timer is active
 * @property {boolean} stoppedForWinOrLose - True when paused due to win/lose overlay
 * @property {string} userName - Current player name
 * @property {boolean} nameValid - True if userName passed validation
 * @property {Array<Function>} levels - Array of level factory functions
 * @property {number} currentLevelIndex - Index of the current level (0-based)
 * @property {Array<Function>} levelFactories - Default level factory list
 * @property {number} carryOverEnergy - Energy carried between levels
 * @property {Array<object>} runResults - Per-level run results
 * @property {{levelComplete:number,boss:number,chicken:number,chickenSmall:number,bottle:number,coin:number}} totalCounts - Aggregated counters
 * @property {number} totalTimeMs - Aggregated total run time in ms
 */
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

    /**
     * Initializes audio, core systems, attaches helpers, and wires UI.
     * Call this once after creating the App.
     * @param {HTMLCanvasElement} canvas - The canvas to render to
     * @param {object} keyboard - Mutable keyboard map used by input handlers
     * @returns {void}
     */
    init(canvas, keyboard) {
        this.setupAudio();
        this.setupCore(canvas, keyboard);
        this.attachAll();
        this.wireAll();
    }

    /**
     * Applies persisted audio preferences and listens for SFX readiness.
     * @returns {void}
     */
    setupAudio() {
        setMuted(isMuted());
        const preset = AudioPrefs.load();
        if (window.sfx) AudioPrefs.applyToSfx(window.sfx, preset);
        window.addEventListener('sfx-ready', () => AudioPrefs.applyToSfx(window.sfx, AudioPrefs.load()));
    }

    /**
     * Stores core references (canvas/context/keyboard) and resets level indices.
     * @param {HTMLCanvasElement} canvas - Render target
     * @param {object} keyboard - Keyboard state object
     * @returns {void}
     */
    setupCore(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.levels = this.levelFactories.slice(0);
        this.currentLevelIndex = 0;
    }

    /**
     * Attaches cross-cutting helpers and utilities onto the app instance.
     * Expects the attach* functions to augment this object.
     * @returns {void}
     */
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

    /**
     * Wires UI interactions and sequences for the app lifecycle.
     * Calls all wire* functions and kicks off the start sequence.
     * @returns {void}
     */
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
        wireMuteInline(this);
    }
}