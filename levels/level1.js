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
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', CHUNK_WIDTH * 4)
    ];

    const barrels = [ new Barrel(1450) ];

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

    const enemies = [
        new Chicken(600, { patrol: [560, 820] }),
        new ChickenSmall(950, { patrol: [900, 1100] }),
        boss
    ];

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

    const platforms = [ new Platform(1200, 520, 216, 80) ];
    const bottles = [
        new BottlePickup('img/6_salsa_bottle/1_salsa_bottle_on_ground.png', 450),
        new BottlePickup('img/6_salsa_bottle/1_salsa_bottle_on_ground.png', 900)
    ];
    const coins = [ new CoinPickup(520), new CoinPickup(780) ];

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