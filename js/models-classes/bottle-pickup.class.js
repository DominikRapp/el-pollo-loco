class BottlePickup extends DrawableObject {

    constructor(imagePath, x, y = null) {
        super();
        this.initImage(imagePath);
        this.initSize();
        this.initOffset();
        this.setPosition(x, y);
        this.startBob();
    }

    initImage(imagePath) {
        this.loadImage(imagePath);
    }

    initSize() {
        this.width = 60;
        this.height = 60;
    }

    initOffset() {
        this.offset = { top: 5, left: 15, right: 8, bottom: 5 };
    }

    setPosition(x, y) {
        this.x = x;
        const groundBottomY = 630;
        this.baseY = (typeof y === 'number') ? y : (groundBottomY - this.height);
        this.y = this.baseY;
    }

    startBob() {
        this.bobTick = 0;
        this.bobInterval = setInterval(() => {
            this.bobTick += 0.1;
            const amplitude = 4;
            this.y = this.baseY + Math.sin(this.bobTick) * amplitude;
        }, 1000 / 30);
    }

    freeze() {
        if (this.bobInterval) {
            clearInterval(this.bobInterval); this.bobInterval = null;
        }
    }
}