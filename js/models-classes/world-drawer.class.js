/**
 * Handles drawing of the game each frame:
 * updates camera, clears canvas, draws world-space elements (with camera transform),
 * draws UI-space elements (without camera transform), and queues the next frame.
 */
class WorldDrawer {

    /**
     * Orchestrates one full render pass.
     * @param {object} world - Game state and rendering context
     */
    draw(world) {
        if (world.disposed) return;
        this.updateCamera(world);
        this.clearCanvas(world);
        this.drawWorldSpace(world);
        this.drawUiSpace(world);
        this.queueNextFrame(world);
    }

    /**
     * Positions the camera relative to the character.
     * @param {object} world
     */
    updateCamera(world) {
        world.camera_x = -world.character.x + 250;
    }

    /**
     * Clears the entire canvas before drawing.
     * @param {object} world
     */
    clearCanvas(world) {
        world.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Draws all game objects affected by the camera transform.
     * @param {object} world
     */
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

    /**
     * Draws UI overlays that should not move with the camera.
     * @param {object} world
     */
    drawUiSpace(world) {
        world.ctx.save();
        world.renderer.addToMap(world, world.statusBar);
        world.renderer.addToMap(world, world.bottleBar);
        if (world.bossBarVisible) world.renderer.addToMap(world, world.bossBar);
        world.renderer.addToMap(world, world.coinBar);
        world.ctx.restore();
    }

    /**
     * Schedules the next animation frame.
     * @param {object} world
     */
    queueNextFrame(world) {
        world.drawRafId = requestAnimationFrame(() => world.draw());
    }

}