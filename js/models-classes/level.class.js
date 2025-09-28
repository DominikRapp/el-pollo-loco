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
    rules = { enemyContactDamage: 20, bossContactDamage: 20, bossBottleDamage: 20 };
    level_end_x = 2250;

    /**
     * Builds a level from its parts, applying defaults where not provided.
     */
    constructor(
        enemies, clouds, backgroundObjects,
        platforms = [], barrels = [], bottles = [], coins = [],
        start = { characterX: 0 }, rules = {}
    ) {
        initLevel(this, enemies, clouds, backgroundObjects, platforms, barrels, bottles, coins, start, rules);
    }
}

/**
 * Initializes Level fields from given parts and merges rule overrides.
 * @param {Level} self
 */
function initLevel(self, enemies, clouds, backgroundObjects, platforms = [], barrels = [], bottles = [], coins = [], start = { characterX: 0 }, rules = {}) {
    const cfg = { enemies, clouds, backgroundObjects, platforms, barrels, bottles, coins, start };
    Object.assign(self, cfg);
    self.rules = { ...self.rules, ...rules };
}