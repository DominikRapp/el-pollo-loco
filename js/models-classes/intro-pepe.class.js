class IntroPepe extends DrawableObject {
    
    frames = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'
    ];
    idx = 0;
    tick = 0;
    done = false;
    suppressWinLoseOverlay = false;

    constructor(canvasHeight) {
        super().loadImage(this.frames[0]);
        this.loadImages(this.frames);
        this.width = 150;
        this.height = 300;
        this.x = -160;
        this.y = 335;
        if (canvasHeight) {
            this.y = Math.max(0, Math.min(canvasHeight - this.height, 335));
        }
    }

    update() {
        this.x += 6;
        this.tick += 1;
        if (this.tick % 6 === 0) {
            this.img = this.imageCache[this.frames[this.idx]];
            this.idx = (this.idx + 1) % this.frames.length;
        }
        if (this.x > 1200) {
            this.done = true;
        }
    }
}
