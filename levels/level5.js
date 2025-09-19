function createLevel5() {
    const chunkWidth = 1080;
    const enemySpeeds = { chickenWalk: 2, chickenSmallWalk: 2.25, bossWalk: 2.5, bossAttack: 5 };
    const backgroundObjects = buildBackgroundObjects5(chunkWidth);
    const computedLevelEndX = computeLevelEndX5(backgroundObjects) + 220;
    const boss = makeBoss5(computedLevelEndX, enemySpeeds);
    const enemies = buildEnemies5(boss, enemySpeeds);
    const platforms = buildPlatforms5();
    const barrels = buildBarrels5();
    const bottles = buildBottles5();
    const coins = buildCoins5();
    const clouds = buildClouds5(backgroundObjects, chunkWidth);
    const startCfg = { characterX: 100 };
    const level = new Level(enemies, clouds, backgroundObjects, platforms, barrels, bottles, coins, startCfg);
    level.level_end_x = computedLevelEndX;
    return level;
}

function buildBackgroundObjects5(chunkWidth) {
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
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', chunkWidth * 7),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', chunkWidth * 7),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', chunkWidth * 7),
        new BackgroundObject('img/5_background/layers/air.png', chunkWidth * 8),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', chunkWidth * 8),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', chunkWidth * 8),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', chunkWidth * 8),
        new BackgroundObject('img/5_background/layers/air.png', chunkWidth * 9),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', chunkWidth * 9),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', chunkWidth * 9),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', chunkWidth * 9)
    ];
}

function computeLevelEndX5(objects) {
    let last = 0;
    for (let i = 0; i < objects.length; i++) if (objects[i].x > last) last = objects[i].x;
    return last;
}

function makeBoss5(levelEndX, speeds) {
    const boss = new Endboss();
    boss.x = levelEndX - 450;
    boss.walkSpeed = speeds.bossWalk;
    boss.alertSpeed = 1.1;
    boss.attackSpeed = speeds.bossAttack;
    boss.alertDistance = 580;
    boss.attackDistance = 280;
    return boss;
}

function buildEnemies5(boss, speeds) {
    const chickens = [
        { x: 1990, y: 430, patrol: [1370, 2000] },
        { x: 2500, y: 430, patrol: [2100, 2600] },
        { x: 3085, y: 430, patrol: [2700, 3185] },
        { x: 3440, y: 430, patrol: [3300, 3870] },
        { x: 4300, y: 430, patrol: [4000, 4700] }
    ].map(e => new Chicken(e.x, { patrol: e.patrol, y: e.y }));
    const smalls = [
        { x: 2600, y: 290, patrol: [2300, 2900] },
        { x: 3800, y: 290, patrol: [3500, 4100] },
        { x: 5000, y: 290, patrol: [4900, 5200] },
        { x: 6200, y: 290, patrol: [5900, 6500] },
        { x: 7400, y: 290, patrol: [7100, 7700] }
    ].map(e => new ChickenSmall(e.x, { patrol: e.patrol, y: e.y }));
    const all = [...chickens, ...smalls, boss];
    for (let i = 0; i < all.length; i++) applyWalkSpeed5(all[i], speeds);
    return all;
}

function applyWalkSpeed5(enemy, speeds) {
    const walk = enemy instanceof Chicken ? speeds.chickenWalk : enemy instanceof ChickenSmall ? speeds.chickenSmallWalk : null;
    if (walk !== null) {
        if (typeof enemy.walkSpeed === 'number') enemy.walkSpeed = walk;
        if (typeof enemy.speed === 'number') enemy.speed = walk;
        if (typeof enemy.speedX === 'number') enemy.speedX = walk;
    }
}

function buildPlatforms5() {
    const cfg = [
        { x: 2200, y: 350, segmentWidth: 180, height: 80 },
        { x: 3400, y: 350, segmentWidth: 180, height: 80 },
        { x: 4600, y: 350, segmentWidth: 180, height: 80 },
        { x: 5800, y: 350, segmentWidth: 180, height: 80 },
        { x: 7000, y: 350, segmentWidth: 180, height: 80 }
    ];
    return cfg.map(p => new Platform(p.x, p.y, p.segmentWidth, p.height));
}

function buildBarrels5() {
    const cfg = [
        { x: 1250, y: 490 },
        { x: 2000, y: 490 },
        { x: 3185, y: 490 },
        { x: 3870, y: 490 }
    ];
    return cfg.map(b => { const o = new Barrel(b.x); if (typeof b.y === 'number') o.y = b.y; return o; });
}

function buildBottles5() {
    const cfg = [
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 1270, y: 450 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 2400, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 2800, y: 300 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 3600, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 4000, y: 300 }
    ];
    return cfg.map(p => new BottlePickup(p.img, p.x, p.y));
}

function buildCoins5() {
    const cfg = [
        { x: 2600, y: 120 },
        { x: 3800, y: 120 },
        { x: 5000, y: 120 },
        { x: 6200, y: 120 },
        { x: 7400, y: 120 }
    ];
    return cfg.map(p => {
        const c = new CoinPickup(p.x);
        if (typeof p.y === 'number') { if (typeof c.baseY === 'number') { c.baseY = p.y; c.y = p.y; } else c.y = p.y; }
        return c;
    });
}

function buildClouds5(backgroundObjects, chunkWidth) {
    const images = ['img/5_background/layers/4_clouds/1.png', 'img/5_background/layers/4_clouds/2.png'];
    const cloudWidth = 450;
    const chunkXs = [];
    for (let i = 0; i < backgroundObjects.length; i += 4) chunkXs.push(backgroundObjects[i].x);
    return chunkXs.map(x => {
        const img = images[Math.floor(Math.random() * images.length)];
        const centeredX = x + (chunkWidth - cloudWidth) / 2;
        return new Cloud(centeredX, img);
    });
}
