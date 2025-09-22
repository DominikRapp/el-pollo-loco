/**
 * Manages all item-related logic in the world:
 * throwable bottles (input, collisions with enemies/obstacles),
 * spawning and picking up ground bottles and coins, and UI/stat updates.
 * Class fields/values are defined elsewhere on the world/objects and used here.
 */
class WorldItems {

    /**
     * Main tick for throwable logic: handle input, enemy hits, and obstacle hits.
     * @param {object} world - Current game world
     */
    checkThrowableObjects(world) {
        const now = Date.now();
        const bossBottleDamage = world.rules.bossBottleDamage ?? 100;
        this.handleThrowInput(world, now);
        this.updateBottleCollisions(world, bossBottleDamage);
        this.updateBottleObstacleHits(world);
    }

    /**
     * Creates and throws a bottle if input/cooldown/resources allow it.
     * @param {object} world
     * @param {number} now - Current timestamp (ms)
     */
    handleThrowInput(world, now) {
        const k = world.keyboard, c = world.character;
        if (!(k.THROW && now - world.lastThrowTime >= world.throwCooldown && world.bottleCount > 0 && c.canControl)) return;
        let direction = 1, offsetX = Math.round(c.width * 0.66);
        if (c.otherDirection) { direction = -1; offsetX = Math.round(-c.width * 0.13); }
        const bottle = new ThrowableObject(c.x + offsetX, Math.round(c.y + c.height * 0.45), direction);
        world.throwableObjects.push(bottle);
        world.bottleCount--;
        world.bottleBar.setPercentage((world.bottleCount / world.bottleMax) * 100);
        world.lastThrowTime = now;
        if (window.sfx) window.sfx.play('character.throw');
    }

    /**
     * Detects bottle vs enemy collisions and applies damage/effects.
     * @param {object} world
     * @param {number} dmg - Damage dealt to boss per hit
     */
    updateBottleCollisions(world, dmg) {
        const bottles = world.throwableObjects || [];
        const enemies = world.level.enemies || [];
        for (const bottle of bottles) {
            if (bottle.isSplashing) continue;
            for (const enemy of enemies) {
                if (!bottle.isSplashing && bottle.isColliding(enemy)) {
                    this.onBottleHit(world, bottle, enemy, dmg);
                }
            }
        }
    }

    /**
     * Handles the effects of a successful bottle hit on an enemy/boss.
     * @param {object} world
     * @param {object} bottle
     * @param {object} enemy
     * @param {number} dmg
     */
    onBottleHit(world, bottle, enemy, dmg) {
        if (enemy instanceof Endboss && !enemy.isDead()) {
            const wasAlive = !enemy.isDead();
            enemy.hit(dmg);
            if (wasAlive && enemy.isDead() && !world.bossDefeated) {
                world.stats.boss = 1;
                world.bossDefeated = true;
            }
            if (world.bossBar) {
                const value = enemy.isDead() ? 0 : enemy.energy;
                world.bossBar.setPercentage(value);
            }
        }
        bottle.splash();
    }

    /**
     * Splashes bottles when they collide with platforms or barrels.
     * @param {object} world
     */
    updateBottleObstacleHits(world) {
        const bottles = world.throwableObjects || [];
        const platforms = world.level.platforms || [];
        const barrels = world.level.barrels || [];
        const obstacles = platforms.concat(barrels);
        for (const bottle of bottles) {
            if (bottle.isSplashing) continue;
            for (const o of obstacles) {
                if (bottle.isColliding(o)) { bottle.splash(); break; }
            }
        }
    }

    /**
     * Spawns ground bottle pickups at predefined positions.
     * @param {object} world
     */
    spawnGroundBottles(world) {
        const img1 = 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png';
        const img2 = 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png';
        world.groundBottles = [
            new BottlePickup(img1, 450),
            new BottlePickup(img1, 900),
            new BottlePickup(img1, 1350),
            new BottlePickup(img2, 1750),
            new BottlePickup(img2, 2050)
        ];
    }

    /**
     * Handles player pickups of ground bottles; updates inventory/UI/stats.
     * @param {object} world
     */
    checkBottlePickups(world) {
        world.groundBottles = world.groundBottles.filter((pickup) => {
            const collides = world.character.isColliding(pickup);
            if (!collides) return true;
            if (world.bottleCount < world.bottleMax) {
                world.bottleCount++;
                world.stats.bottle = (world.stats.bottle || 0) + 1;
                const percent = (world.bottleCount / world.bottleMax) * 100;
                world.bottleBar.setPercentage(percent);
                if (window.sfx) window.sfx.play('obj.bottle.pick');
                return false;
            } else {
                return true;
            }
        });
    }

    /**
     * Spawns coin pickups at predefined positions.
     * @param {object} world
     */
    spawnCoins(world) {
        world.coinPickups = [
            new CoinPickup(520),
            new CoinPickup(780),
            new CoinPickup(1120),
            new CoinPickup(1600),
            new CoinPickup(1980)
        ];
    }

    /**
     * Handles coin pickups and applies healing via rules.
     * @param {object} world
     */
    checkCoinPickups(world) {
        const heal = this.getCoinHeal(world);
        const list = world.coinPickups || [];
        world.coinPickups = list.filter(p => this.keepOrConsumeCoin(world, p, heal));
    }

    /**
     * Returns the heal value for a coin (default 20).
     * @param {object} world
     * @returns {number}
     */
    getCoinHeal(world) {
        const v = world?.rules?.coinHeal;
        return (typeof v === 'number') ? v : 20;
    }

    /**
     * Decides whether a coin remains or is consumed by the player.
     * @param {object} world
     * @param {object} coin
     * @param {number} heal
     * @returns {boolean} true to keep coin in world; false to remove
     */
    keepOrConsumeCoin(world, coin, heal) {
        if (!world.character.isColliding(coin)) return true;
        if (world.coinCount >= world.coinMax) return true;
        this.consumeCoin(world, heal);
        if (window.sfx) window.sfx.play('obj.coin.pick');
        return false;
    }

    /**
     * Consumes a coin: increments count/stats, updates UI, and heals character.
     * @param {object} world
     * @param {number} heal
     */
    consumeCoin(world, heal) {
        world.coinCount++;
        world.stats.coin = (world.stats.coin || 0) + 1;
        const percent = (world.coinCount / world.coinMax) * 100;
        world.coinBar.setPercentage(percent);
        const cur = world.character.energy;
        const next = Math.min(100, cur + heal);
        if (next !== cur) {
            world.character.energy = next;
            world.statusBar.setPercentage(world.character.energy);
        }
    }

}