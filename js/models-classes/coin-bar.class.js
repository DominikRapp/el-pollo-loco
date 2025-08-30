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
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        this.percentage = percentage;
        const idx = this.resolveImageIndex();
        const path = this.IMAGES[idx];
        this.img = this.imageCache[path];
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
