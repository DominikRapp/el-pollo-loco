/**
 * Animated coin pickup collectible.
 * Loads coin sprites, sizes/positions itself near the ground, and loops a simple 2-frame animation.
 * Methods below briefly describe each initialization step and controls for the animation.
 */
class CoinPickup extends DrawableObject {

    /**
     * Creates a coin at the given X position and starts its animation.
     * @param {number} x - Horizontal position of the coin.
     */
    constructor(x) {
        super();
        this.initImage();
        this.initSize();
        this.initOffset();
        this.setPosition(x);
        this.initFrames();
        this.startAnim();
    }

    /**
     * Loads the initial coin image.
     */
    initImage() {
        this.loadImage('img/8_coin/coin_1.png');
    }

    /**
     * Sets sprite dimensions.
     */
    initSize() {
        this.width = 120;
        this.height = 120;
    }

    /**
     * Sets collision/interaction offsets.
     */
    initOffset() {
        this.offset = { top: 40, left: 40, right: 40, bottom: 40 };
    }

    /**
     * Places the coin at X and aligns it to a ground line.
     * @param {number} x
     */
    setPosition(x) {
        const groundBottomY = 300;
        this.x = x;
        this.y = groundBottomY - this.height;
    }

    /**
     * Prepares the animation frames and caches them.
     */
    initFrames() {
        this.frames = ['img/8_coin/coin_1.png', 'img/8_coin/coin_2.png'];
        this.loadImages(this.frames);
        this.currentFrame = 0;
    }

    /**
     * Starts the frame-switching loop for a simple flip animation.
     */
    startAnim() {
        this.animInterval = setInterval(() => {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            const path = this.frames[this.currentFrame];
            this.img = this.imageCache[path];
        }, 200);
    }

    /**
     * Stops the animation loop (e.g., on pause or removal).
     */
    freeze() {
        if (this.animInterval) {
            clearInterval(this.animInterval); this.animInterval = null;
        }
    }
}