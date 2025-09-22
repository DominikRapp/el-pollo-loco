/**
 * Runs the main world update loop at ~60 FPS:
 * checks dead-lock, updates ground/boss state, processes interactions and cleanup.
 */
class WorldRunner {

    /**
     * Starts the fixed-timestep game loop.
     * @param {object} world - The game world instance
     */
    run(world) {
        setInterval(() => this.tick(world), 1000 / 60);
    }

    /**
     * One simulation tick: resolve dead-lock, ground update, boss AI, and interactions.
     * @param {object} world
     */
    tick(world) {
        this.checkDeadLock(world);
        if (world.gameOver) { world.updateCharacterGround(); return; }
        world.updateCharacterGround();
        this.updateBoss(world);
        this.doInteractions(world);
    }

    /**
     * Detects and handles character dead-lock, setting game over and disabling control.
     * @param {object} world
     */
    checkDeadLock(world) {
        if (!world.gameOver && world.character && world.character.deadLocked === true) {
            world.gameOver = true;
            if (world.character) world.character.canControl = false;
        }
    }

    /**
     * Triggers boss alert phase when in range; otherwise updates boss AI if already alerted.
     * @param {object} world
     */
    updateBoss(world) {
        const b = world.boss;
        if (!b) return;
        if (world.bossAlertShown === true) { if (b.updateAI) b.updateAI(world); return; }
        const distance = Math.abs(world.character.x - b.x);
        const alertDistance = b.alertDistance || 450;
        if (distance <= alertDistance) {
            if (typeof b.goAlert === 'function') b.goAlert();
            else if (typeof b.setAnimation === 'function') { b.setAnimation('alert'); b.currentState = 'alert'; }
            world.bossAlertShown = true;
            world.bossBarVisible = true;
        }
    }

    /**
     * Runs world interactions each tick: collisions, pickups, projectiles, and cleanup.
     * @param {object} world
     */
    doInteractions(world) {
        world.blockCharacterByBarrels();
        world.checkCollisions();
        world.checkThrowableObjects();
        world.checkBottlePickups();
        world.checkCoinPickups();
        world.cleanupProjectiles();
        world.cleanupEnemies();
    }
}