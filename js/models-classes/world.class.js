/**
 * Orchestrates the entire game world: sets up helpers, level data, UI bars, boss,
 * runs the main loop, handles drawing, collisions, items, cleanup, and freezing.
 * Class fields are declared for clarity and not individually commented.
 */
class World {

    canFreezeNow = false;
    allowFreezeAfterDeathImage = false;
    character = new Character();
    level = null;
    enemies = [];
    clouds = [];
    backgroundObjects = [];
    platforms = [];
    barrels = [];
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    bottleBar = new BottleBar();
    bossBar = null;
    throwableObjects = [];
    lastThrowTime = 0;
    throwCooldown = 2000;
    bottleCount = 0;
    bottleMax = 5;
    groundBottles = [];
    boss = null;
    bossBarVisible = false;
    bossAlertShown = false;
    gameOver = false;
    coinBar = new CoinBar();
    coinPickups = [];
    coinCount = 0;
    coinMax = 5;
    stats = { boss: 0, chicken: 0, chickenSmall: 0, bottle: 0, coin: 0 };
    bossDefeated = false;
    baseGroundTopY = 335;
    frozen = false;
    lastBossHitTime = 0;
    bossHitCooldownMs = 1000;
    drawRafId = null;
    disposed = false;

    /**
     * Initializes rendering context, input, helpers, level, UI bars, boss, and starts loops.
     * @param {HTMLCanvasElement} canvas - Target canvas
     * @param {object} keyboard - Keyboard input state
     * @param {object} level - Level data (enemies, clouds, platforms, etc.)
     */
    constructor(canvas, keyboard, level) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.setupHelpers();
        this.setupLevel(level);
        this.setupBars();
        this.setupBoss();
        this.baseGroundTopY = this.character.groundTopY;
        this.draw();
        this.setWorld();
        this.run();
    }

    /**
     * Instantiates helper components used by the world.
     */
    setupHelpers() {
        this.freezer = new WorldFreezer();
        this.renderer = new WorldRenderer();
        this.collider = new WorldCollider();
        this.items = new WorldItems();
        this.cleaner = new WorldCleaner();
        this.runner = new WorldRunner();
        this.drawer = new WorldDrawer();
    }

    /**
     * Loads level content and initial placement; applies rules and resets lists.
     * @param {object} level
     */
    setupLevel(level) {
        this.level = level;
        this.enemies = level.enemies;
        this.clouds = level.clouds;
        this.backgroundObjects = level.backgroundObjects;
        this.platforms = level.platforms || [];
        this.barrels = level.barrels || [];
        this.groundBottles = level.bottles || [];
        this.coinPickups = level.coins || [];
        this.throwableObjects = [];
        this.rules = level.rules || {};
        if (level.start && typeof level.start.characterX === 'number') { this.character.x = level.start.characterX; }
    }

    /**
     * Sets up UI bars (positions and initial values).
     */
    setupBars() {
        this.coinBar = new CoinBar();
        this.coinBar.x = 30;
        this.coinBar.y = 60;
        this.coinBar.setPercentage(0);
    }

    /**
     * Finds the boss (if any), sets up boss bar, and initializes its value.
     */
    setupBoss() {
        this.bossBar = new BossBar();
        this.bossBar.x = this.canvas.width - this.bossBar.width - 200;
        this.bossBar.y = 20;
        this.boss = this.level.enemies.find(e => e instanceof Endboss) || null;
        if (this.boss) { this.bossBar.setPercentage(this.boss.energy); }
    }

    /**
     * Links the character back to this world instance.
     */
    setWorld() {
        this.character.world = this;
    }

    /**
     * Starts the world update loop.
     */
    run() {
        this.runner.run(this);
    }

    /**
     * Prevents the character from passing through barrels.
     */
    blockCharacterByBarrels() {
        this.collider.blockCharacterByBarrels(this);
    }

    /**
     * Updates character's ground/standing position each tick.
     */
    updateCharacterGround() {
        this.collider.updateCharacterGround(this);
    }

    /**
     * Spawns ground bottle pickups using the items helper.
     */
    spawnGroundBottles() {
        this.items.spawnGroundBottles(this);
    }

    /**
     * Spawns coin pickups using the items helper.
     */
    spawnCoins() {
        this.items.spawnCoins(this);
    }

    /**
     * Removes inactive/expired projectiles.
     */
    cleanupProjectiles() {
        this.cleaner.cleanupProjectiles(this);
    }

    /**
     * Removes objects flagged for removal.
     */
    cleanupRemoved() {
        this.cleaner.cleanupRemoved(this);
    }

    /**
     * Cleans up defeated or off-screen enemies.
     */
    cleanupEnemies() {
        this.cleaner.cleanupEnemies(this);
    }

    /**
     * Handles throwing logic and bottle collisions each tick.
     */
    checkThrowableObjects() {
        this.items.checkThrowableObjects(this);
    }

    /**
     * Handles ground bottle pickups and UI updates.
     */
    checkBottlePickups() {
        this.items.checkBottlePickups(this);
    }

    /**
     * Handles coin pickups, healing, and UI updates.
     */
    checkCoinPickups() {
        this.items.checkCoinPickups(this);
    }

    /**
     * Runs collision checks for character vs. world/enemies/hazards.
     */
    checkCollisions() {
        this.collider.checkCollisions(this);
    }

    /**
     * Freezes the world safely (pausing gameplay).
     */
    freezeAll() {
        this.freezer.freeze(this);
    }

    /**
     * Draws the current frame via the drawer.
     */
    draw() {
        this.drawer.draw(this);
    }

    /**
     * Disposes the world: stops rendering and clears intervals.
     */
    dispose() {
        this.disposed = true;
        if (this.drawRafId) {
            cancelAnimationFrame(this.drawRafId);
            this.drawRafId = null;
        }
        IntervalTracker.clearAll();
    }

    /**
     * Convenience: render an array of objects using the renderer.
     * @param {Array<object>} objects
     */
    addObjectsToMap(objects) {
        this.renderer.addObjectsToMap(this, objects);
    }

    /**
     * Convenience: render a single object using the renderer.
     * @param {object} movableObject
     */
    addToMap(movableObject) {
        this.renderer.addToMap(this, movableObject);
    }

    /**
     * Convenience: flip context/object before drawing.
     * @param {object} movableObject
     */
    flipImage(movableObject) {
        this.renderer.flipImage(this, movableObject);
    }

    /**
     * Convenience: restore flip after drawing.
     * @param {object} movableObject
     */
    flipImageBack(movableObject) {
        this.renderer.flipImageBack(this, movableObject);
    }
}