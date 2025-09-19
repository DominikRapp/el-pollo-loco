class WorldCleaner {

    cleanupRemoved(world) {
        const keys = [
            'throwableObjects',
            'enemies',
            'clouds',
            'platforms',
            'barrels',
            'groundBottles',
            'coinPickups'
        ];
        for (const k of keys) {
            world[k] = this.keepOnlyActive(world[k]);
        }
    }

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

    cleanupProjectiles(world) {
        world.throwableObjects = world.throwableObjects.filter(b => !b.markForRemoval);
    }

    cleanupEnemies(world) {
        world.level.enemies = world.level.enemies.filter(e => !e.markForRemoval);
    }
}
