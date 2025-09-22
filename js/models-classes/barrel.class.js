/**
 * Represents a barrel object placed in the game world.
 * Inherits from DrawableObject and sets up default dimensions,
 * collision offsets, and its ground position.
 */
class Barrel extends DrawableObject {

    width = 110;
    height = 140;
    offset = { top: 6, left: 10, right: 10, bottom: 0 };
    groundBottomY = 630;

    /**
     * Creates a new barrel instance at a given horizontal position.
     * @param {number} x - The X position where the barrel will be placed
     */
    constructor(x) {
        super().loadImage('img/10_fix_objects/barrel.png');
        this.x = x;
        this.y = this.groundBottomY - this.height;
    }
}