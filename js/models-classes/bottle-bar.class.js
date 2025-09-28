/**
 * Bottle status bar that switches images based on a percentage value.
 * Uses cached images and remembers the last rendered index to avoid redundant updates.
 */
class BottleBar extends DrawableObject {

    IMAGES = [
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png'
    ];

    percentage = 0;

    /**
     * Loads images, sets default position/size, and initializes to 0%.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 200;
        this.y = 20;
        this.width = 150;
        this.height = 40;
        this.setPercentage(0);
    }

    /**
     * Updates the percentage and swaps the image if the index changed.
     * Expects a value from 0 to 100 (no clamping here).
     * @param {number} percentage
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        const imageIndex = this.resolveImageIndex();
        if (this.lastRenderedIndex === imageIndex) {
            return;
        }
        this.lastRenderedIndex = imageIndex;
        const imagePath = this.IMAGES[imageIndex];
        this.img = this.imageCache[imagePath];
    }

    /**
     * Maps the current percentage to an image index (0..5).
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