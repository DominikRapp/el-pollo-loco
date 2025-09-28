/**
 * Utility class that removes inactive objects from the world.
 * Looks for items marked with `markForRemoval`, stops them if possible,
 * and prunes them from arrays to keep the game performant.
 */
class WorldCleaner {

    /**
     * Cleans up multiple world arrays (enemies, projectiles, etc.) in one pass.
     * @param {object} world - The current world/state object
     */
    cleanupRemoved(world) {
        const keys = ['throwableObjects', 'clouds', 'platforms', 'barrels', 'groundBottles', 'coinPickups'];
        for (const k of keys) world[k] = this.keepOnlyActive(world[k]);
        if (world.level && Array.isArray(world.level.enemies)) {
            world.level.enemies = this.keepOnlyActive(world.level.enemies);
        }
    }

    /**
     * Returns a new array without items flagged for removal; calls freeze() on them if present.
     * @param {Array} array - Collection to filter
     * @returns {Array} Filtered array with only active items
     */
    keepOnlyActive(array) {
        if (!Array.isArray(array)) return array;
        return array.filter(entry => {
            if (entry && entry.markForRemoval) {
                if (entry.freeze) entry.freeze();
                return false;
            }
            return true;
        });
    }

    /**
     * Specifically removes throwable objects that are marked for removal.
     * @param {object} world - The current world/state object
     */
    cleanupProjectiles(world) {
        world.throwableObjects = world.throwableObjects.filter(b => !b.markForRemoval);
    }

    /**
     * Specifically removes enemies that are marked for removal.
     * @param {object} world - The current world/state object
     */
    cleanupEnemies(world) {
        world.level.enemies = world.level.enemies.filter(e => !e.markForRemoval);
    }
}