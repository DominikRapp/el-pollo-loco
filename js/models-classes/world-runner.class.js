class WorldRunner {

    run(world) {
        setInterval(() => this.tick(world), 1000 / 60);
    }

    tick(world) {
        this.checkDeadLock(world);
        if (world.gameOver) { world.updateCharacterGround(); return; }
        world.updateCharacterGround();
        this.updateBoss(world);
        this.doInteractions(world);
    }

    checkDeadLock(world) {
        if (!world.gameOver && world.character && world.character.deadLocked === true) {
            world.gameOver = true;
            if (world.character) world.character.canControl = false;
        }
    }

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
