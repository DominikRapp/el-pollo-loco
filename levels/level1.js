function createLevel1() {
    const CHUNK_WIDTH = 1080;

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
    ];

    let lastChunkX = 0;
    for (let i = 0; i < backgroundObjects.length; i++) {
        const obj = backgroundObjects[i];
        if (obj.x > lastChunkX) lastChunkX = obj.x;
    }
    const LEVEL_END_PADDING = 100;
    const computedLevelEndX = lastChunkX + LEVEL_END_PADDING;

    const boss = new Endboss();
    boss.x = computedLevelEndX - 450;
    boss.walkSpeed = 0.35;
    boss.alertSpeed = 0.8;
    boss.attackSpeed = 1.5;
    boss.alertDistance = 520;
    boss.attackDistance = 260;

    const enemiesChickenCfg = [
        { x: 1564, y: 430, patrol: [1116, 1564] },
        { x: 1800, y: 430, patrol: [1700, 2360] },
        { x: 2060, y: 430, patrol: [2000, 2870] },
        { x: 3060, y: 430, patrol: [3000, 3660] },
        { x: 3320, y: 430, patrol: [3560, 3900] }
    ];
    const enemiesChickenSmallCfg = [
        { x: 1180, y: 560, patrol: [1116, 1564] },
        { x: 1860, y: 290, patrol: [1720, 2260] },
        { x: 2320, y: 290, patrol: [2320, 2560] },
        { x: 3000, y: 290, patrol: [3020, 3360] },
        { x: 3400, y: 290, patrol: [3400, 3880] }
    ];
    const enemies = [
        ...enemiesChickenCfg.map(e => new Chicken(e.x, { patrol: e.patrol, y: e.y })),
        ...enemiesChickenSmallCfg.map(e => new ChickenSmall(e.x, { patrol: e.patrol, y: e.y })),
        boss
    ];

    const platformsCfg = [
        { x: 1700, y: 350, segmentWidth: 180, height: 80 },
        { x: 3000, y: 350, segmentWidth: 180, height: 80 }
    ];
    const platforms = platformsCfg.map(p => new Platform(p.x, p.y, p.segmentWidth, p.height));

    const barrelsCfg = [
        { x: 1000, y: 490 },
        { x: 1570, y: 490 },
        { x: 2870, y: 490 },
        { x: 3900, y: 490 }
    ];
    const barrels = barrelsCfg.map(b => {
        const o = new Barrel(b.x);
        if (typeof b.y === 'number') o.y = b.y;
        return o;
    });

    const bottlesCfg = [
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 1020, y: 450 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 1760, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 2260, y: 300 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 3020, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 3460, y: 300 }
    ];
    const bottles = bottlesCfg.map(p => new BottlePickup(p.img, p.x, p.y));

    const coinsCfg = [
        { x: 1120, y: 220 },
        { x: 1820, y: 100 },
        { x: 2100, y: 120 },
        { x: 3060, y: 120 },
        { x: 3500, y: 120 }
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
