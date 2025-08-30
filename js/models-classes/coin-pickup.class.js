class CoinPickup extends DrawableObject {

    constructor(x) {
        super().loadImage('img/8_coin/coin_1.png');
        this.width = 120;
        this.height = 120;
        this.offset = { top: 40, left: 40, right: 40, bottom: 40 };
        let groundBottomY = 300;
        this.x = x;
        this.y = groundBottomY - this.height;
        this.frames = ['img/8_coin/coin_1.png', 'img/8_coin/coin_2.png'];
        this.loadImages(this.frames);
        this.currentFrame = 0;
        let self = this;
        this.animInterval = setInterval(function () {
            self.currentFrame++;
            if (self.currentFrame >= self.frames.length) self.currentFrame = 0;
            let path = self.frames[self.currentFrame];
            self.img = self.imageCache[path];
        }, 200);
    }

    freeze() {
        if (this.animInterval) {
            clearInterval(this.animInterval); this.animInterval = null;
        }
    }
}