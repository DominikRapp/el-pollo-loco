class ThrowableObject extends MovableObject {
    
    IMAGES_ROTATION = [
        'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];
    IMAGES_SPLASH = [
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

    height = 80;
    width = 80;
    isFlying = true;
    isSplashing = false;
    rotationFrame = 0;
    splashFrame = 0;
    moveInterval = null;
    rotationInterval = null;
    splashInterval = null;
    groundBottomY = 655;

    constructor(x, y, direction = 1) {
        super().loadImage('img/6_salsa_bottle/salsa_bottle.png');
        this.loadImages(this.IMAGES_ROTATION);
        this.loadImages(this.IMAGES_SPLASH);
        this.x = x;
        this.y = y;
        this.speedX = 8.5 * direction;
        this.acceleration = 1.0;
        this.throw();
        this.startRotation();
    }

    throw() {
        this.speedY = 20;
        this.applyGravity();
        this.moveInterval = setInterval(() => {
            this.x += this.speedX;
            this.checkGroundHit();
        }, 1000 / 60);
    }

    checkGroundHit() {
        if (this.isSplashing) return;
        const groundTopY = this.groundBottomY - this.height;
        if (this.y >= groundTopY) {
            this.y = groundTopY;
            this.splash();
        }
    }

    startRotation() {
        this.rotationInterval = setInterval(() => {
            if (!this.isFlying || this.isSplashing) return;
            const path = this.IMAGES_ROTATION[this.rotationFrame];
            this.img = this.imageCache[path];
            this.rotationFrame = (this.rotationFrame + 1) % this.IMAGES_ROTATION.length;
        }, 80);
    }

    splash() {
        if (this.isSplashing) return;
        this.isFlying = false;
        this.isSplashing = true;
        if (this.moveInterval) clearInterval(this.moveInterval);
        if (this.rotationInterval) clearInterval(this.rotationInterval);
        this.speedY = 0;
        this.acceleration = 0;
        this.splashFrame = 0;
        this.splashInterval = setInterval(() => {
            if (this.splashFrame < this.IMAGES_SPLASH.length) {
                const path = this.IMAGES_SPLASH[this.splashFrame];
                this.img = this.imageCache[path];
                this.splashFrame++;
            } else {
                clearInterval(this.splashInterval);
                this.markForRemoval = true;
            }
        }, 60);
    }

    freeze() {
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
        if (this.splashInterval) {
            clearInterval(this.splashInterval);
            this.splashInterval = null;
        }
        this.speedY = 0;
        this.acceleration = 0;
    }
}