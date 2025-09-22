/**
 * Renders game objects onto the canvas, handling direction-based flipping.
 * Provides helpers to batch-render arrays and to flip sprites when facing left.
 */
class WorldRenderer {
    
    /**
     * Renders an array of objects to the canvas in order.
     * @param {object} world - World containing the canvas context
     * @param {Array<object>} objects - Drawable/movable objects
     */
    addObjectsToMap(world, objects) {
        objects.forEach(object => {
            this.addToMap(world, object);
        });
    }

    /**
     * Renders a single object, flipping horizontally if needed.
     * @param {object} world
     * @param {object} movableObject
     */
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

    /**
     * Flips the drawing context horizontally and mirrors the object's X.
     * @param {object} world
     * @param {object} movableObject
     */
    flipImage(world, movableObject) {
        world.ctx.save();
        world.ctx.translate(movableObject.width, 0);
        world.ctx.scale(-1, 1);
        movableObject.x = movableObject.x * -1;
    }

    /**
     * Restores original orientation and object X after drawing.
     * @param {object} world
     * @param {object} movableObject
     */
    flipImageBack(world, movableObject) {
        movableObject.x = movableObject.x * -1;
        world.ctx.restore();
    }
}