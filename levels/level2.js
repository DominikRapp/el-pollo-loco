function createLevel2() {
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
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', CHUNK_WIDTH * 5)
    ];

    let lastChunkX = 0;
    for (let i = 0; i < backgroundObjects.length; i++) {
        const obj = backgroundObjects[i];
        if (obj.x > lastChunkX) lastChunkX = obj.x;
    }
    const LEVEL_END_PADDING = 160;
    const computedLevelEndX = lastChunkX + LEVEL_END_PADDING;

    const boss = new Endboss();
    boss.x = computedLevelEndX - 450;
    boss.walkSpeed = 0.4;
    boss.alertSpeed = 0.9;
    boss.attackSpeed = 1.6;
    boss.alertDistance = 540;
    boss.attackDistance = 260;

    const enemiesChickenCfg = [
        { x: 1210, y: 430, patrol: [1210, 1650] },
        { x: 2100, y: 430, patrol: [1780, 2160] },
        { x: 2700, y: 430, patrol: [2160, 2920] },
        { x: 3200, y: 430, patrol: [3160, 3960] },
        { x: 3480, y: 430, patrol: [3160, 3960] }
    ];
    const enemiesChickenSmallCfg = [
        { x: 1610, y: 560, patrol: [1210, 1650] },
        { x: 2000, y: 290, patrol: [1910, 2300] },
        { x: 2700, y: 290, patrol: [2340, 2790] },
        { x: 3260, y: 290, patrol: [3130, 3540] },
        { x: 3560, y: 290, patrol: [3580, 3980] }
    ];
    const enemies = [
        ...enemiesChickenCfg.map(e => new Chicken(e.x, { patrol: e.patrol, y: e.y })),
        ...enemiesChickenSmallCfg.map(e => new ChickenSmall(e.x, { patrol: e.patrol, y: e.y })),
        boss
    ];

    const platformsCfg = [
        { x: 1900, y: 350, segmentWidth: 180, height: 80 },
        { x: 3100, y: 350, segmentWidth: 180, height: 80 }
    ];
    const platforms = platformsCfg.map(p => new Platform(p.x, p.y, p.segmentWidth, p.height));

    const barrelsCfg = [
        { x: 1080, y: 490 },
        { x: 1650, y: 490 },
        { x: 2920, y: 490 }
    ];
    const barrels = barrelsCfg.map(b => {
        const o = new Barrel(b.x);
        if (typeof b.y === 'number') o.y = b.y;
        return o;
    });

    const bottlesCfg = [
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 1100, y: 450 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 1960, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 2360, y: 300 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 3120, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 3520, y: 300 }
    ];
    const bottles = bottlesCfg.map(p => new BottlePickup(p.img, p.x, p.y));

    const coinsCfg = [
        { x: 1180, y: 220 },
        { x: 1980, y: 100 },
        { x: 2260, y: 120 },
        { x: 3180, y: 100 },
        { x: 3580, y: 120 }
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
