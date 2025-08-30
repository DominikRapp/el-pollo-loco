class BottlePickup extends DrawableObject {
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.width = 60;
        this.height = 60;
        this.offset = {
            top: 5,
            left: 15,
            right: 8,
            bottom: 5
        };
        const groundBottomY = 430;
        this.x = x;
        this.baseY = groundBottomY - this.height;
        this.y = this.baseY;
        this.bobTick = 0;
        this.bobInterval = setInterval(() => {
            this.bobTick += 0.1;
            const amplitude = 4;
            this.y = this.baseY + Math.sin(this.bobTick) * amplitude;
        }, 1000 / 30);
    }

    freeze() {
        if (this.bobInterval) {
            clearInterval(this.bobInterval);
            this.bobInterval = null;
        }
    }
}