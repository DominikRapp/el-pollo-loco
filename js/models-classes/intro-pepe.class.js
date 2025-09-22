/**
 * Simple intro animation for Pepe walking in from the left, cycling through frames
 * and marking itself as done once it passes a target X position.
 * Class fields above define sprite frames, animation counters/flags, and overlay suppression.
 */
class IntroPepe extends DrawableObject {

    frames = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'
    ];
    idx = 0;
    tick = 0;
    done = false;
    suppressWinLoseOverlay = false;

    /**
     * Preloads the frames, sets size, and positions Pepe just off-screen on the left.
     * Optionally clamps Y to fit the given canvas height.
     * @param {number} [canvasHeight] - Canvas height used to clamp vertical position.
     */
    constructor(canvasHeight) {
        super().loadImage(this.frames[0]);
        this.loadImages(this.frames);
        this.width = 150;
        this.height = 300;
        this.x = -160;
        this.y = 335;
        if (canvasHeight) {
            this.y = Math.max(0, Math.min(canvasHeight - this.height, 335));
        }
    }

    /**
     * Advances position and animation; sets done when passing the finish X.
     */
    update() {
        this.x += 6;
        this.tick += 1;
        if (this.tick % 6 === 0) {
            this.img = this.imageCache[this.frames[this.idx]];
            this.idx = (this.idx + 1) % this.frames.length;
        }
        if (this.x > 1200) {
            this.done = true;
        }
    }
}