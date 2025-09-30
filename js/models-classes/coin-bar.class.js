/**
 * HUD coin status bar that swaps images based on the current percentage.
 * Uses a discrete set of sprites (0–100%) and only updates the image when needed.
 */
class CoinBar extends DrawableObject {

    IMAGES = [
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png'
    ];

    percentage = 0;

    /**
     * Loads sprites, positions the bar on screen, sets size and initial state.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.width = 200;
        this.height = 60;
        this.setPercentage(0);
    }

    /**
     * Sets and clamps the percentage (0–100), then updates the displayed sprite.
     * Skips work if the sprite index didn’t change.
     * @param {number} percentage
     */
    setPercentage(percentage) {
        let clamped = percentage;
        if (clamped < 0) clamped = 0;
        if (clamped > 100) clamped = 100;
        this.percentage = clamped;
        const imageIndex = this.resolveImageIndex();
        if (this.lastRenderedIndex === imageIndex) {
            return;
        }
        this.lastRenderedIndex = imageIndex;
        const imagePath = this.IMAGES[imageIndex];
        this.img = this.imageCache[imagePath];
    }

    /**
     * Maps the current percentage to the corresponding sprite index.
     * @returns {number}
     */
    resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        if (this.percentage >= 80) return 4;
        if (this.percentage >= 60) return 3;
        if (this.percentage >= 40) return 2;
        if (this.percentage >= 20) return 1;
        return 0;
    }
}