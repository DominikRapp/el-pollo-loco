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

    setupHelpers() {
        this.freezer = new WorldFreezer();
        this.renderer = new WorldRenderer();
        this.collider = new WorldCollider();
        this.items = new WorldItems();
        this.cleaner = new WorldCleaner();
        this.runner = new WorldRunner();
        this.drawer = new WorldDrawer();
    }

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

    setupBars() {
        this.coinBar = new CoinBar();
        this.coinBar.x = 10;
        this.coinBar.y = 45;
        this.coinBar.setPercentage(0);
    }

    setupBoss() {
        this.bossBar = new BossBar();
        this.bossBar.x = this.canvas.width - this.bossBar.width - 10;
        this.bossBar.y = 0;
        this.boss = this.level.enemies.find(e => e instanceof Endboss) || null;
        if (this.boss) { this.bossBar.setPercentage(this.boss.energy); }
    }

    setWorld() {
        this.character.world = this;
    }

    run() {
        this.runner.run(this);
    }

    blockCharacterByBarrels() {
        this.collider.blockCharacterByBarrels(this);
    }

    updateCharacterGround() {
        this.collider.updateCharacterGround(this);
    }

    spawnGroundBottles() {
        this.items.spawnGroundBottles(this);
    }

    spawnCoins() {
        this.items.spawnCoins(this);
    }

    cleanupProjectiles() {
        this.cleaner.cleanupProjectiles(this);
    }

    cleanupRemoved() {
        this.cleaner.cleanupRemoved(this);
    }

    cleanupEnemies() {
        this.cleaner.cleanupEnemies(this);
    }

    checkThrowableObjects() {
        this.items.checkThrowableObjects(this);
    }

    checkBottlePickups() {
        this.items.checkBottlePickups(this);
    }

    checkCoinPickups() {
        this.items.checkCoinPickups(this);
    }

    checkCollisions() {
        this.collider.checkCollisions(this);
    }

    freezeAll() {
        this.freezer.freeze(this);
    }

    draw() {
        this.drawer.draw(this);
    }

    dispose() {
        this.disposed = true;
        if (this.drawRafId) {
            cancelAnimationFrame(this.drawRafId);
            this.drawRafId = null;
        }
        IntervalTracker.clearAll();
    }

    addObjectsToMap(objects) {
        this.renderer.addObjectsToMap(this, objects);
    }

    addToMap(movableObject) {
        this.renderer.addToMap(this, movableObject);
    }

    flipImage(movableObject) {
        this.renderer.flipImage(this, movableObject);
    }

    flipImageBack(movableObject) {
        this.renderer.flipImageBack(this, movableObject);
    }
}