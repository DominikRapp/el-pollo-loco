class CoinPickup extends DrawableObject {

    constructor(x) {
        super();
        this.initImage();
        this.initSize();
        this.initOffset();
        this.setPosition(x);
        this.initFrames();
        this.startAnim();
    }

    initImage() {
        this.loadImage('img/8_coin/coin_1.png');
    }

    initSize() {
        this.width = 120;
        this.height = 120;
    }

    initOffset() {
        this.offset = { top: 40, left: 40, right: 40, bottom: 40 };
    }

    setPosition(x) {
        const groundBottomY = 300;
        this.x = x;
        this.y = groundBottomY - this.height;
    }

    initFrames() {
        this.frames = ['img/8_coin/coin_1.png', 'img/8_coin/coin_2.png'];
        this.loadImages(this.frames);
        this.currentFrame = 0;
    }

    startAnim() {
        this.animInterval = setInterval(() => {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            const path = this.frames[this.currentFrame];
            this.img = this.imageCache[path];
        }, 200);
    }

    freeze() {
        if (this.animInterval) {
            clearInterval(this.animInterval); this.animInterval = null;
        }
    }
}