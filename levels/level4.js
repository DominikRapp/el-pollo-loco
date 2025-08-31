const CHUNK_WIDTH = 1080;
const backgroundObjects_level4 = [
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
    new BackgroundObject('img/5_background/layers/1_first_layer/2.png', CHUNK_WIDTH * 7)
];

const barrels_level4 = [
    new Barrel(1450)
];

let lastChunkX = 0;

for (let i = 0; i < backgroundObjects_level4.length; i++) {
    const obj = backgroundObjects_level4[i];
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

const enemies_level4 = [
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

for (let i = 0; i < backgroundObjects_level4.length; i += 4) {
    chunkXs.push(backgroundObjects_level4[i].x);
}

const clouds_level4 = chunkXs.map(chunkX => {
    const img = CLOUD_IMAGES[Math.floor(Math.random() * CLOUD_IMAGES.length)];
    const xCentered = chunkX + (CHUNK_WIDTH - CLOUD_WIDTH) / 2;
    return new Cloud(xCentered, img);
});

const platforms_level4 = [
    new Platform(1200, 520, 216, 80)
];

const bottles_level4 = [
    new BottlePickup('img/6_salsa_bottle/1_salsa_bottle_on_ground.png', 450),
    new BottlePickup('img/6_salsa_bottle/1_salsa_bottle_on_ground.png', 900)
];

const coins_level4 = [
    new CoinPickup(520),
    new CoinPickup(780)
];

const start_level4 = { characterX: 100 };

const level4 = new Level(
    enemies_level4,
    clouds_level4,
    backgroundObjects_level4,
    platforms_level4,
    barrels_level4,
    bottles_level4,
    coins_level4,
    start_level4
);

level4.level_end_x = computedLevelEndX;