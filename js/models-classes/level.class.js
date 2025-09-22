/**
 * Container for all data that makes up a playable level:
 * enemies, clouds, background scenery, interactables, spawn/start info,
 * damage rules, and the level's end X coordinate.
 * Class fields above declare defaults for arrays/objects and base rules.
 */
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
        bossContactDamage: 20,
        bossBottleDamage: 20
    };
    level_end_x = 2250;

    /**
     * Builds a level from its parts, applying defaults where not provided.
     * @param {Array<MovableObject>} enemies - Enemy instances in the level.
     * @param {Array<DrawableObject>} clouds - Cloud visuals for parallax/background.
     * @param {Array<DrawableObject>} backgroundObjects - Background tiles/layers.
     * @param {Array<Platform>} [platforms=[]] - Solid platforms the player can stand on.
     * @param {Array<Barrel>} [barrels=[]] - Static barrels (obstacles/decoration).
     * @param {Array<ThrowableObject|BottlePickup>} [bottles=[]] - Bottles present in the level.
     * @param {Array<CoinPickup>} [coins=[]] - Coin pickups.
     * @param {{characterX:number}} [start={characterX:0}] - Starting positions/config (at least characterX).
     * @param {{enemyContactDamage?:number,bossContactDamage?:number,bossBottleDamage?:number}} [rules={}] - Overrides for damage rules.
     */
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