function createLevel3() {
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

        new BackgroundObject('img/5_background/layers/air.png', CHUNK_WIDTH * 6),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', CHUNK_WIDTH * 6),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', CHUNK_WIDTH * 6),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', CHUNK_WIDTH * 6)
    ];

    let lastChunkX = 0;
    for (let i = 0; i < backgroundObjects.length; i++) {
        const obj = backgroundObjects[i];
        if (obj.x > lastChunkX) lastChunkX = obj.x;
    }
    const LEVEL_END_PADDING = 200;
    const computedLevelEndX = lastChunkX + LEVEL_END_PADDING;

    const boss = new Endboss();
    boss.x = computedLevelEndX - 450;
    boss.walkSpeed = 0.45;
    boss.alertSpeed = 1.0;
    boss.attackSpeed = 1.7;
    boss.alertDistance = 560;
    boss.attackDistance = 270;

    const enemiesChickenCfg = [
        { x: 1600, y: 430, patrol: [1300, 1670] },
        { x: 2490, y: 430, patrol: [2090, 2540] },
        { x: 3100, y: 430, patrol: [2600, 3170] },
        { x: 3350, y: 430, patrol: [3300, 3650] },
        { x: 3800, y: 430, patrol: [3800, 4060] }
    ];
    const enemiesChickenSmallCfg = [
        { x: 1900, y: 560, patrol: [1720, 1970] },
        { x: 2500, y: 290, patrol: [2120, 2540] },
        { x: 2900, y: 290, patrol: [2580, 2970] },
        { x: 4000, y: 290, patrol: [3310, 4160] },
        { x: 4900, y: 290, patrol: [4300, 5160] }
    ];
    const enemies = [
        ...enemiesChickenCfg.map(e => new Chicken(e.x, { patrol: e.patrol, y: e.y })),
        ...enemiesChickenSmallCfg.map(e => new ChickenSmall(e.x, { patrol: e.patrol, y: e.y })),
        boss
    ];

    const platformsCfg = [
        { x: 2100, y: 350, segmentWidth: 180, height: 80 },
        { x: 3300, y: 350, segmentWidth: 180, height: 80 },
        { x: 4300, y: 350, segmentWidth: 180, height: 80 }
    ];
    const platforms = platformsCfg.map(p => new Platform(p.x, p.y, p.segmentWidth, p.height));

    const barrelsCfg = [
        { x: 1180, y: 490 },
        { x: 1970, y: 490 },
        { x: 3170, y: 490 },
        { x: 4195, y: 470 },
        { x: 4195, y: 345 }
    ];
    const barrels = barrelsCfg.map(b => {
        const o = new Barrel(b.x);
        if (typeof b.y === 'number') o.y = b.y;
        return o;
    });

    const bottlesCfg = [
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 1200, y: 450 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 2140, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 2440, y: 300 },
        { img: 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png', x: 3320, y: 300 },
        { img: 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png', x: 3960, y: 300 }
    ];
    const bottles = bottlesCfg.map(p => new BottlePickup(p.img, p.x, p.y));

    const coinsCfg = [
        { x: 1280, y: 220 },
        { x: 2120, y: 100 },
        { x: 2400, y: 120 },
        { x: 3340, y: 120 },
        { x: 3980, y: 120 }
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
