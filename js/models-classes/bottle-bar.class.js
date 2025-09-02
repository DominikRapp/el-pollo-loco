class BottleBar extends DrawableObject {
    IMAGES = [
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png'
    ];

    percentage = 0;

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 170;
        this.y = 0;
        this.width = 150;
        this.height = 40;
        this.setPercentage(0);
    }

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

    resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        if (this.percentage >= 80) return 4;
        if (this.percentage >= 60) return 3;
        if (this.percentage >= 40) return 2;
        if (this.percentage >= 20) return 1;
        return 0;
    }
}