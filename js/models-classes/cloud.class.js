/**
 * A drifting cloud that moves horizontally across the scene.
 * Inherits from MovableObject; class fields at the top define position/size/scheduling.
 */
class Cloud extends MovableObject {

    y = 20;
    width = 450;
    height = 300;
    moveInterval = null;

    /**
     * Creates a cloud at X and starts its movement.
     * @param {number} x - Initial horizontal position
     * @param {string} [imgPath='img/5_background/layers/4_clouds/1.png'] - Cloud image path
     */
    constructor(x, imgPath = 'img/5_background/layers/4_clouds/1.png') {
        super().loadImage(imgPath);
        this.x = x;
        this.animate();
    }

    /**
     * Kicks off the movement loop.
     */
    animate() {
        this.moveLeft();
    }

    /**
     * Moves the cloud left at the current speed using a 60 FPS interval.
     */
    moveLeft() {
        this.moveInterval = setInterval(() => {
            this.x -= this.speed;
        }, 1000 / 60);
    }

    /**
     * Stops movement and clears the interval.
     */
    freeze() {
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
        this.speed = 0;
    }
}