class Cloud extends MovableObject {
    y = 20;
    width = 450;
    height = 300;
    moveInterval = null;

    constructor(x, imgPath = 'img/5_background/layers/4_clouds/1.png') {
        super().loadImage(imgPath);
        this.x = x;
        this.animate();
    }

    animate() {
        this.moveLeft();
    }

    moveLeft() {
        this.moveInterval = setInterval(() => {
            this.x -= this.speed;
        }, 1000 / 60);
    }

    freeze() {
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
        this.speed = 0;
    }
}
