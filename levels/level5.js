function createLevel5() {
    const CHUNK_WIDTH = 1080;

    const ENEMY_SPEEDS = {
        chickenWalk: 2,
        chickenSmallWalk: 2.25,
        bossWalk: 2.5,
        bossAttack: 5
    };

    const backgroundObjects = [
        new BackgroundObject('img/5_background/layers/air.png', -CHUNK_WIDTH),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', -CHUNK_WIDTH),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', -CHUNK_WIDTH),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', -CHUNK_WIDTH),

        new BackgroundObject('img/5_background/layers/air.png', 0),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 0),

        new BackgroundObject('img/5_background/layers/air.png', CHUNK_WIDTH),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', CHUNK_WIDTH),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', CHUNK_WIDTH),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', CHUNK_WIDTH),

        new BackgroundObject('img/5_background/layers/air.png', CHUNK_WIDTH * 2),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', CHUNK_WIDTH * 2),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', CHUNK_WIDTH * 2),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', CHUNK_WIDTH * 2),

        new BackgroundObject('img/5_background/layers/air.png', CHUNK_WIDTH * 3),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', CHUNK_WIDTH * 3),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', CHUNK_WIDTH * 3),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', CHUNK_WIDTH * 3),

        new BackgroundObject('img/5_background/layers/air.png', CHUNK_WIDTH * 4),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', CHUNK_WIDTH * 4),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', CHUNK_WIDTH * 4),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', CHUNK_WIDTH * 4),

        new BackgroundObject('img/5_background/layers/air.png', CHUNK_WIDTH * 5),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', CHUNK_WIDTH * 5),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', CHUNK_WIDTH * 5),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', CHUNK_WIDTH * 5),

        new BackgroundObject('img/5_background/layers/air.png', CHUNK_WIDTH * 6),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', CHUNK_WIDTH * 6),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', CHUNK_WIDTH * 6),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', CHUNK_WIDTH * 6),

        new BackgroundObject('img/5_background/layers/air.png', CHUNK_WIDTH * 7),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', CHUNK_WIDTH * 7),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', CHUNK_WIDTH * 7),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', CHUNK_WIDTH * 7),

        new BackgroundObject('img/5_background/layers/air.png', CHUNK_WIDTH * 8),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', CHUNK_WIDTH * 8),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', CHUNK_WIDTH * 8),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', CHUNK_WIDTH * 8),

        new BackgroundObject('img/5_background/layers/air.png', CHUNK_WIDTH * 9),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', CHUNK_WIDTH * 9),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', CHUNK_WIDTH * 9),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', CHUNK_WIDTH * 9)
    ];

    let lastChunkX = 0;
    for (let i = 0; i < backgroundObjects.length; i++) {
        const obj = backgroundObjects[i];
        if (obj.x > lastChunkX) lastChunkX = obj.x;
    }
    const LEVEL_END_PADDING = 220;
    const computedLevelEndX = lastChunkX + LEVEL_END_PADDING;

    const boss = new Endboss();
    boss.x = computedLevelEndX - 450;
    boss.walkSpeed = ENEMY_SPEEDS.bossWalk;
    boss.alertSpeed = 1.1;
    boss.attackSpeed = ENEMY_SPEEDS.bossAttack;
    boss.alertDistance = 580;
    boss.attackDistance = 280;

    const enemiesChickenCfg = [
        { x: 1990, y: 430, patrol: [1370, 2000] },
        { x: 2500, y: 430, patrol: [2100, 2600] },
        { x: 3085, y: 430, patrol: [2700, 3185] },
        { x: 3440, y: 430, patrol: [3300, 3870] },
        { x: 4300, y: 430, patrol: [4000, 4700] }
    ];
    const enemiesChickenSmallCfg = [
        { x: 2600, y: 290, patrol: [2300, 2900] },
        { x: 3800, y: 290, patrol: [3500, 4100] },
        { x: 5000, y: 290, patrol: [4900, 5200] },
        { x: 6200, y: 290, patrol: [5900, 6500] },
        { x: 7400, y: 290, patrol: [7100, 7700] }
    ];
    const enemies = [
        ...enemiesChickenCfg.map(e => new Chicken(e.x, { patrol: e.patrol, y: e.y })),
        ...enemiesChickenSmallCfg.map(e => new ChickenSmall(e.x, { patrol: e.patrol, y: e.y })),
        boss
    ];

    const setWalk = (o, v) => {
        if (typeof o.walkSpeed === 'number') o.walkSpeed = v;
        if (typeof o.speed === 'number') o.speed = v;
        if (typeof o.speedX === 'number') o.speedX = v;
    };
    for (const e of enemies) {
        if (e instanceof Chicken) setWalk(e, ENEMY_SPEEDS.chickenWalk);
        else if (e instanceof ChickenSmall) setWalk(e, ENEMY_SPEEDS.chickenSmallWalk);
    }

    const platformsCfg = [
        { x: 2200, y: 350, segmentWidth: 180, height: 80 },
        { x: 3400, y: 350, segmentWidth: 180, height: 80 },
        { x: 4600, y: 350, segmentWidth: 180, height: 80 },
        { x: 5800, y: 350, segmentWidth: 180, height: 80 },
        { x: 7000, y: 350, segmentWidth: 180, height: 80 },
    ];
    const platforms = platformsCfg.map(p => new Platform(p.x, p.y, p.segmentWidth, p.height));

    const barrelsCfg = [
        { x: 1250, y: 490 },
        { x: 2000, y: 490 },
        { x: 3185, y: 490 },
        { x: 3870, y: 490 }
    ];
    const barrels = barrelsCfg.map(b => {
        const o = new Barrel(b.x);
        if (typeof b.y === 'number') o.y = b.y;
        return o;
    });

    const bottlesCfg = [
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 1270, y: 450 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 2400, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 2800, y: 300 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 3600, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 4000, y: 300 }
    ];
    const bottles = bottlesCfg.map(p => new BottlePickup(p.img, p.x, p.y));

    const coinsCfg = [
        { x: 2600, y: 120 },
        { x: 3800, y: 120 },
        { x: 5000, y: 120 },
        { x: 6200, y: 120 },
        { x: 7400, y: 120 }
    ];
    const coins = coinsCfg.map(p => {
        const c = new CoinPickup(p.x);
        if (typeof p.y === 'number') {
            if (typeof c.baseY === 'number') {
                c.baseY = p.y;
                c.y = p.y;
            } else {
                c.y = p.y;
            }
        }
        return c;
    });

    const CLOUD_IMAGES = [
        'img/5_background/layers/4_clouds/1.png',
        'img/5_background/layers/4_clouds/2.png'
    ];
    const CLOUD_WIDTH = 450;

    const chunkXs = [];
    for (let i = 0; i < backgroundObjects.length; i += 4) {
        chunkXs.push(backgroundObjects[i].x);
    }
    const clouds = chunkXs.map(chunkX => {
        const img = CLOUD_IMAGES[Math.floor(Math.random() * CLOUD_IMAGES.length)];
        const xCentered = chunkX + (CHUNK_WIDTH - CLOUD_WIDTH) / 2;
        return new Cloud(xCentered, img);
    });

    const startCfg = { characterX: 100 };

    const level = new Level(
        enemies,
        clouds,
        backgroundObjects,
        platforms,
        barrels,
        bottles,
        coins,
        startCfg
    );
    level.level_end_x = computedLevelEndX;
    return level;
}
