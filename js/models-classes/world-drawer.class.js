class WorldDrawer {

    draw(world) {
        if (world.disposed) return;
        this.updateCamera(world);
        this.clearCanvas(world);
        this.drawWorldSpace(world);
        this.drawUiSpace(world);
        this.queueNextFrame(world);
    }

    updateCamera(world) {
        world.camera_x = -world.character.x + 250;
    }

    clearCanvas(world) {
        world.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawWorldSpace(world) {
        world.ctx.save();
        world.ctx.translate(world.camera_x, 0);
        world.renderer.addObjectsToMap(world, world.level.backgroundObjects);
        world.renderer.addObjectsToMap(world, world.level.clouds);
        world.renderer.addObjectsToMap(world, world.level.platforms);
        world.renderer.addObjectsToMap(world, world.level.barrels);
        world.renderer.addObjectsToMap(world, world.groundBottles);
        world.renderer.addObjectsToMap(world, world.coinPickups);
        world.renderer.addToMap(world, world.character);
        world.renderer.addObjectsToMap(world, world.level.enemies);
        world.renderer.addObjectsToMap(world, world.throwableObjects);
        world.ctx.restore();
    }

    drawUiSpace(world) {
        world.ctx.save();
        world.renderer.addToMap(world, world.statusBar);
        world.renderer.addToMap(world, world.bottleBar);
        if (world.bossBarVisible) world.renderer.addToMap(world, world.bossBar);
        world.renderer.addToMap(world, world.coinBar);
        world.ctx.restore();
    }

    queueNextFrame(world) {
        world.drawRafId = requestAnimationFrame(() => world.draw());
    }

}
