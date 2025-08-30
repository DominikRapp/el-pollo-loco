class CoinPickup extends DrawableObject {
    constructor(x) {
        super().loadImage('img/8_coin/coin_1.png');

        // Größe + Hitbox-Offset (engere rote Box)
        this.width = 48;
        this.height = 48;
        this.offset = { top: 6, left: 6, right: 6, bottom: 6 };

        // Position (fix, Boden)
        var groundBottomY = 430;
        this.x = x;
        this.y = groundBottomY - this.height;

        // 2-Frame-Animation vorladen
        this.frames = [
            'img/8_coin/coin_1.png',
            'img/8_coin/coin_2.png'
        ];
        this.loadImages(this.frames);

        // einfache Idle-Animation
        this.currentFrame = 0;
        var self = this;
        this.animInterval = setInterval(function () {
            self.currentFrame++;
            if (self.currentFrame >= self.frames.length) {
                self.currentFrame = 0;
            }
            var path = self.frames[self.currentFrame];
            self.img = self.imageCache[path];
        }, 200);
    }

    freeze() {
        if (this.animInterval) {
            clearInterval(this.animInterval);
            this.animInterval = null;
        }
    }
}
