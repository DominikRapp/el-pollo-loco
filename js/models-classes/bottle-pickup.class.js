/**
 * Collectible bottle pickup with gentle bobbing animation.
 * Loads its image, sets size/offsets, positions near ground (or a given Y),
 * and starts a vertical bob to draw player attention.
 */
class BottlePickup extends DrawableObject {

    /**
     * Sets up image, size, offsets, position, and bobbing.
     * @param {string} imagePath - Path to the bottle image
     * @param {number} x - X position
     * @param {number} [y=null] - Optional Y position; defaults to ground level
     */
    constructor(imagePath, x, y = null) {
        super();
        this.initImage(imagePath);
        this.initSize();
        this.initOffset();
        this.setPosition(x, y);
        this.startBob();
    }

    /**
     * Loads the pickup image.
     * @param {string} imagePath
     */
    initImage(imagePath) {
        this.loadImage(imagePath);
    }

    /**
     * Applies fixed width and height.
     */
    initSize() {
        this.width = 60;
        this.height = 60;
    }

    /**
     * Sets collision/interaction offsets.
     */
    initOffset() {
        this.offset = { top: 5, left: 15, right: 8, bottom: 5 };
    }

    /**
     * Places the pickup at X and either provided Y or ground-aligned Y.
     * @param {number} x
     * @param {number|null} y
     */
    setPosition(x, y) {
        this.x = x;
        const groundBottomY = 630;
        this.baseY = (typeof y === 'number') ? y : (groundBottomY - this.height);
        this.y = this.baseY;
    }

    /**
     * Starts a lightweight bobbing animation using setInterval.
     */
    startBob() {
        this.bobTick = 0;
        this.bobInterval = setInterval(() => {
            this.bobTick += 0.1;
            const amplitude = 4;
            this.y = this.baseY + Math.sin(this.bobTick) * amplitude;
        }, 1000 / 30);
    }

    /**
     * Stops the bobbing animation and clears timers.
     */
    freeze() {
        if (this.bobInterval) {
            clearInterval(this.bobInterval); this.bobInterval = null;
        }
    }
}