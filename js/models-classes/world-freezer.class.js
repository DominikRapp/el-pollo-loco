/**
 * Freezes the entire game world safely: stops timers, disables input,
 * halts character, boss, enemies, clouds, throwables, and pickups.
 * Use when pausing the game or transitioning between states.
 */
class WorldFreezer {

    /**
     * Entry point: freezes everything if allowed.
     * @param {object} world - Current game world instance
     */
    freeze(world) {
        if (world.canFreezeNow !== true) return;
        this.stopAllIntervals();
        world.frozen = true;
        this.freezeCharacter(world);
        this.resetKeyboard(world);
        this.freezeBoss(world);
        this.freezeEnemiesAndClouds(world);
        this.freezeThrowableObjects(world);
        this.freezePickups(world);
    }

    /**
     * Stops any tracked global intervals.
     */
    stopAllIntervals() {
        if (window.IntervalTracker) window.IntervalTracker.clearAll();
    }

    /**
     * Disables player control and motion.
     * @param {object} world
     */
    freezeCharacter(world) {
        if (!world.character) return;
        world.character.canControl = false;
        world.character.speed = 0;
        world.character.speedY = 0;
    }

    /**
     * Clears pressed keys to avoid stuck input after unfreeze.
     * @param {object} world
     */
    resetKeyboard(world) {
        world.keyboard.LEFT = false;
        world.keyboard.RIGHT = false;
        world.keyboard.SPACE = false;
        world.keyboard.THROW = false;
        world.keyboard.RESTART = false;
    }

    /**
     * Freezes the boss via its own API if available; otherwise halts movement/animation.
     * @param {object} world
     */
    freezeBoss(world) {
        const b = world.boss;
        if (!b) return;
        if (typeof b.freeze === 'function') { b.freeze(); return; }
        if (b.animationInterval) { clearInterval(b.animationInterval); b.animationInterval = null; }
        b.walkSpeed = 0;
        b.alertSpeed = 0;
        b.attackSpeed = 0;
    }

    /**
     * Freezes all enemies and clouds (prefers their own freeze method).
     * @param {object} world
     */
    freezeEnemiesAndClouds(world) {
        for (const e of (world.level.enemies || [])) {
            if (typeof e.freeze === 'function') e.freeze(); else e.speed = 0;
        }
        for (const c of (world.level.clouds || [])) {
            if (typeof c.freeze === 'function') c.freeze(); else c.speed = 0;
        }
    }

    /**
     * Freezes throwables by clearing their intervals and vertical speed.
     * @param {object} world
     */
    freezeThrowableObjects(world) {
        for (const o of (world.throwableObjects || [])) {
            if (typeof o.freeze === 'function') { o.freeze(); continue; }
            if (o.moveInterval) clearInterval(o.moveInterval);
            if (o.rotationInterval) clearInterval(o.rotationInterval);
            if (o.splashInterval) clearInterval(o.splashInterval);
            o.speedY = 0;
        }
    }

    /**
     * Freezes pickups on the ground and coins if they implement freeze().
     * @param {object} world
     */
    freezePickups(world) {
        for (const p of (world.groundBottles || [])) if (typeof p.freeze === 'function') p.freeze();
        for (const c of (world.coinPickups || [])) if (typeof c.freeze === 'function') c.freeze();
    }

}