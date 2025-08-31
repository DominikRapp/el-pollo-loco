class Level {
    enemies;
    clouds;
    backgroundObjects;
    platforms = [];
    barrels = [];
    bottles = [];
    coins = [];
    start = { characterX: 0 };
    rules = {
        enemyContactDamage: 20,
        bossContactDamage: 30,
        bossBottleDamage: 100
    };
    level_end_x = 2250;

    constructor(
        enemies, clouds, backgroundObjects,
        platforms = [], barrels = [], bottles = [], coins = [],
        start = { characterX: 0 },
        rules = {}
    ) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.platforms = platforms;
        this.barrels = barrels;
        this.bottles = bottles;
        this.coins = coins;
        this.start = start;
        this.rules = { ...this.rules, ...rules };
    }
}
