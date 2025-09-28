/**
 * UI status bar that displays the player's health as a series of images.
 * Uses preloaded frames for 0, 20, 40, 60, 80, and 100 percent.
 * Class fields above define images and default percentage.
 */
class StatusBar extends DrawableObject {

    IMAGES_HEALTH = [
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png'
    ];

    percentage = 100;

    /**
     * Sets up size/position, preloads images, and shows full health.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES_HEALTH);
        this.x = 30;
        this.y = 20;
        this.height = 40;
        this.width = 150;
        this.setPercentage(100);
    }

    /**
     * Updates health value and switches to the matching image frame.
     * Skips work if the frame didn't change since last render.
     * @param {number} percentage - Health value (0–100) in steps of 20
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        const imageIndex = this.resolveImageIndex();
        if (this.lastRenderedIndex === imageIndex) {
            return;
        }
        this.lastRenderedIndex = imageIndex;
        const imagePath = this.IMAGES_HEALTH[imageIndex];
        this.img = this.imageCache[imagePath];
    }

    /**
     * Translates the current percentage to an image array index.
     * @returns {number} Index within IMAGES_HEALTH
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