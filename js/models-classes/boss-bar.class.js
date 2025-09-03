class BossBar extends DrawableObject {
    IMAGES = [
        'img/7_statusbars/2_statusbar_endboss/green/green0.png',
        'img/7_statusbars/2_statusbar_endboss/green/green20.png',
        'img/7_statusbars/2_statusbar_endboss/green/green40.png',
        'img/7_statusbars/2_statusbar_endboss/green/green60.png',
        'img/7_statusbars/2_statusbar_endboss/green/green80.png',
        'img/7_statusbars/2_statusbar_endboss/green/green100.png'
    ];
    
    percentage = 100;

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.y = 0;
        this.width = 150;
        this.height = 40;
        this.setPercentage(100);
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

    draw(ctx) {
        if (!this.img) return;
        ctx.save();
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.img, 50, 0, this.width, this.height);
        ctx.restore();
    }
}