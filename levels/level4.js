/**
 * Builds and returns Level 4 with enemies, items, background, and boundaries.
 * @returns {Level} Fully configured level instance
 */
function createLevel4() {
    const chunkWidth = 1080;
    const enemySpeeds = { chickenWalk: 1.75, chickenSmallWalk: 2, bossWalk: 2.25, bossAttack: 4.5 };
    const backgroundObjects = buildBackgroundObjects4(chunkWidth);
    const computedLevelEndX = computeLevelEndX4(backgroundObjects) + 220;
    const boss = makeBoss4(computedLevelEndX, enemySpeeds);
    const enemies = buildEnemies4(boss, enemySpeeds);
    const platforms = buildPlatforms4();
    const barrels = buildBarrels4();
    const bottles = buildBottles4();
    const coins = buildCoins4();
    const clouds = buildClouds4(backgroundObjects, chunkWidth);
    const startCfg = { characterX: 100 };
    const level = new Level(enemies, clouds, backgroundObjects, platforms, barrels, bottles, coins, startCfg);
    level.level_end_x = computedLevelEndX;
    return level;
}

/**
 * Creates repeating background objects for the level.
 * @param {number} chunkWidth - Width of one background chunk in pixels
 * @returns {BackgroundObject[]} Array of background objects laid out across the level
 */
function buildBackgroundObjects4(chunkWidth) {
    return [
        new BackgroundObject('img/5_background/layers/air.png', -chunkWidth),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', -chunkWidth),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', -chunkWidth),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', -chunkWidth),
        new BackgroundObject('img/5_background/layers/air.png', 0),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/air.png', chunkWidth),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', chunkWidth),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', chunkWidth),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', chunkWidth),
        new BackgroundObject('img/5_background/layers/air.png', chunkWidth * 2),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', chunkWidth * 2),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', chunkWidth * 2),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', chunkWidth * 2),
        new BackgroundObject('img/5_background/layers/air.png', chunkWidth * 3),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', chunkWidth * 3),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', chunkWidth * 3),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', chunkWidth * 3),
        new BackgroundObject('img/5_background/layers/air.png', chunkWidth * 4),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', chunkWidth * 4),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', chunkWidth * 4),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', chunkWidth * 4),
        new BackgroundObject('img/5_background/layers/air.png', chunkWidth * 5),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', chunkWidth * 5),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', chunkWidth * 5),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', chunkWidth * 5),
        new BackgroundObject('img/5_background/layers/air.png', chunkWidth * 6),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', chunkWidth * 6),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', chunkWidth * 6),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', chunkWidth * 6),
        new BackgroundObject('img/5_background/layers/air.png', chunkWidth * 7),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', chunkWidth * 7),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', chunkWidth * 7),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', chunkWidth * 7)
    ];
}

/**
 * Computes the level's end X position based on a list of objects.
 * @param {{x:number}[]} objects - Objects that have an x position
 * @returns {number} The maximum x among the objects
 */
function computeLevelEndX4(objects) {
    let last = 0;
    for (let i = 0; i < objects.length; i++) if (objects[i].x > last) last = objects[i].x;
    return last;
}

/**
 * Creates and configures the end boss instance for Level 4.
 * @param {number} levelEndX - The right boundary of the level
 * @param {{bossWalk:number,bossAttack:number}} speeds - Speed configuration for the boss
 * @returns {Endboss} Configured boss instance
 */
function makeBoss4(levelEndX, speeds) {
    const boss = new Endboss();
    boss.x = levelEndX - 450;
    boss.walkSpeed = speeds.bossWalk;
    boss.alertSpeed = 1.1;
    boss.attackSpeed = speeds.bossAttack;
    boss.alertDistance = 580;
    boss.attackDistance = 475;
    return boss;
}

/**
 * Builds all enemies (small and regular chickens) and applies walk speeds; includes the boss.
 * @param {Endboss} boss - The boss instance to include
 * @param {{chickenWalk:number,chickenSmallWalk:number}} speeds - Speed settings for chicken types
 * @returns {(Chicken|ChickenSmall|Endboss)[]} Array of enemies
 */
function buildEnemies4(boss, speeds) {
    const chickens = [
        { x: 1990, y: 430, patrol: [1370, 2000] },
        { x: 2500, y: 430, patrol: [2100, 2600] },
        { x: 3085, y: 430, patrol: [2700, 3185] },
        { x: 3440, y: 430, patrol: [3300, 3870] },
        { x: 4300, y: 430, patrol: [4000, 4700] }
    ].map(e => new Chicken(e.x, { patrol: e.patrol, y: e.y }));
    const smalls = [
        { x: 2500, y: 290, patrol: [2230, 2600] },
        { x: 2970, y: 290, patrol: [2700, 3070] },
        { x: 3700, y: 290, patrol: [3410, 3800] },
        { x: 4100, y: 290, patrol: [3900, 4260] },
        { x: 5000, y: 290, patrol: [4800, 5300] }
    ].map(e => new ChickenSmall(e.x, { patrol: e.patrol, y: e.y }));
    const all = [...chickens, ...smalls, boss];
    for (let i = 0; i < all.length; i++) applyWalkSpeed4(all[i], speeds);
    return all;
}

/**
 * Applies the correct walking speed to a given enemy instance based on its class.
 * Safely sets known numeric speed fields if present.
 * @param {Chicken|ChickenSmall|Endboss} enemy - Enemy to modify
 * @param {{chickenWalk:number,chickenSmallWalk:number}} speeds - Mapping of speeds
 */
function applyWalkSpeed4(enemy, speeds) {
    const walk = enemy instanceof Chicken ? speeds.chickenWalk : enemy instanceof ChickenSmall ? speeds.chickenSmallWalk : null;
    if (walk !== null) {
        if (typeof enemy.walkSpeed === 'number') enemy.walkSpeed = walk;
        if (typeof enemy.speed === 'number') enemy.speed = walk;
        if (typeof enemy.speedX === 'number') enemy.speedX = walk;
    }
}

/**
 * Builds static platform segments for traversal.
 * @returns {Platform[]} Array of platform instances
 */
function buildPlatforms4() {
    const cfg = [
        { x: 2200, y: 350, segmentWidth: 180, height: 80 },
        { x: 3400, y: 350, segmentWidth: 180, height: 80 },
        { x: 4600, y: 350, segmentWidth: 180, height: 80 }
    ];
    return cfg.map(p => new Platform(p.x, p.y, p.segmentWidth, p.height));
}

/**
 * Creates barrel obstacles positioned along the ground.
 * @returns {Barrel[]} Array of barrel instances
 */
function buildBarrels4() {
    const cfg = [
        { x: 1250, y: 490 },
        { x: 2000, y: 490 },
        { x: 3185, y: 490 },
        { x: 3870, y: 490 }
    ];
    return cfg.map(b => { const o = new Barrel(b.x); if (typeof b.y === 'number') o.y = b.y; return o; });
}

/**
 * Places bottle pickups at specified positions.
 * @returns {BottlePickup[]} Array of bottle pickup instances
 */
function buildBottles4() {
    const cfg = [
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 1270, y: 450 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 2220, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 2520, y: 300 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 3420, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 4040, y: 300 }
    ];
    return cfg.map(p => new BottlePickup(p.img, p.x, p.y));
}

/**
 * Places coin pickups; preserves baseY when available.
 * @returns {CoinPickup[]} Array of coin pickup instances
 */
function buildCoins4() {
    const cfg = [{ x: 1340, y: 220 }, { x: 2320, y: 80 }, { x: 3720, y: 80 }, { x: 4800, y: 80 }, { x: 5200, y: 80 }];
    return cfg.map(p => {
        const c = new CoinPickup(p.x);
        if (typeof p.y === 'number') { if (typeof c.baseY === 'number') { c.baseY = p.y; c.y = p.y; } else c.y = p.y; }
        return c;
    });
}

/**
 * Builds clouds centered within each background chunk.
 * @param {BackgroundObject[]} backgroundObjects - Background objects used to infer chunk positions
 * @param {number} chunkWidth - Width of one background chunk in pixels
 * @returns {Cloud[]} Array of cloud instances
 */
function buildClouds4(backgroundObjects, chunkWidth) {
    const images = ['img/5_background/layers/4_clouds/1.png', 'img/5_background/layers/4_clouds/2.png'];
    const cloudWidth = 450;
    const chunkXs = [];
    for (let i = 0; i < backgroundObjects.length; i += 4) chunkXs.push(backgroundObjects[i].x);
    return chunkXs.map(x => {
        const img = images[Math.floor(Math.random() * images.length)];
        const cx = x + (chunkWidth - cloudWidth) / 2;
        return new Cloud(cx, img);
    });
}