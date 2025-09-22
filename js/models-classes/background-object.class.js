/**
 * Represents a background object in the game world.
 * Inherits from MovableObject and provides default width, height,
 * position and image loading behavior.
 */
class BackgroundObject extends MovableObject {

    width = 1080;
    height = 720;

    /**
     * Creates a new background object.
     * @param {string} imagePath - Path to the background image
     * @param {number} x - X position of the background object
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 720 - this.height;
    }
}