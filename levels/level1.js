const CHUNK_WIDTH = 1080;
const backgroundObjects_level1 = [
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
let lastChunkX = 0;
for (let i = 0; i < backgroundObjects_level1.length; i++) {
    const obj = backgroundObjects_level1[i];
    if (obj.x > lastChunkX) lastChunkX = obj.x;
}
const LEVEL_END_PADDING = 100;
const computedLevelEndX = lastChunkX + LEVEL_END_PADDING;

const boss = new Endboss();
boss.x = computedLevelEndX - 450;

const enemies_level1 = [
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
for (let i = 0; i < backgroundObjects_level1.length; i += 4) {
    chunkXs.push(backgroundObjects_level1[i].x);
}
const clouds_level1 = chunkXs.map(chunkX => {
    const img = CLOUD_IMAGES[Math.floor(Math.random() * CLOUD_IMAGES.length)];
    const xCentered = chunkX + (CHUNK_WIDTH - CLOUD_WIDTH) / 2;
    return new Cloud(xCentered, img);
});

const platforms_level1 = [
    new Platform(1200, 520, 216, 80)
];

const level1 = new Level(
    enemies_level1,
    clouds_level1,
    backgroundObjects_level1,
    platforms_level1
);
level1.level_end_x = computedLevelEndX;