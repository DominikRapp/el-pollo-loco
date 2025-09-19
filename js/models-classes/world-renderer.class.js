class WorldRenderer {
    
    addObjectsToMap(world, objects) {
        objects.forEach(object => {
            this.addToMap(world, object);
        });
    }

    addToMap(world, movableObject) {
        if (movableObject.otherDirection) {
            this.flipImage(world, movableObject);
        }
        movableObject.draw(world.ctx);
        movableObject.drawFrame(world.ctx);
        if (movableObject.otherDirection) {
            this.flipImageBack(world, movableObject);
        }
    }

    flipImage(world, movableObject) {
        world.ctx.save();
        world.ctx.translate(movableObject.width, 0);
        world.ctx.scale(-1, 1);
        movableObject.x = movableObject.x * -1;
    }

    flipImageBack(world, movableObject) {
        movableObject.x = movableObject.x * -1;
        world.ctx.restore();
    }
}
