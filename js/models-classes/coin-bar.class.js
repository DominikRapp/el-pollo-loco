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

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 10;
        this.y = 45;
        this.width = 150;
        this.height = 40;
        this.setPercentage(0);
    }

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

    resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        if (this.percentage >= 80) return 4;
        if (this.percentage >= 60) return 3;
        if (this.percentage >= 40) return 2;
        if (this.percentage >= 20) return 1;
        return 0;
    }
}
