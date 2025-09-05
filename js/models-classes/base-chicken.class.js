class BaseChicken extends MovableObject {

    groundBottomY = 630;
    IMAGES_WALKING = [];
    IMAGE_DEAD = '';
    isDead = false;
    direction = -1;
    patrolMinX = null;
    patrolMaxX = null;
    lastStepAt = 0;
    stepIntervalMs = 300;

    constructor(config) {
        super();
        if (!config) {
            config = {};
        }
        if (typeof config.x === 'number') {
            this.x = config.x;
        } else {
            this.x = 0;
        }
        if (typeof config.width === 'number') {
            this.width = config.width;
        } else {
            this.width = 100;
        }
        if (typeof config.height === 'number') {
            this.height = config.height;
        } else {
            this.height = 100;
        }
        if (typeof config.speed === 'number') {
            this.speed = config.speed;
        } else {
            this.speed = 0.6;
        }
        if (config.offset && typeof config.offset === 'object') {
            this.offset = {};
            if (typeof config.offset.top === 'number') {
                this.offset.top = config.offset.top;
            } else {
                this.offset.top = 0;
            }
            if (typeof config.offset.left === 'number') {
                this.offset.left = config.offset.left;
            } else {
                this.offset.left = 0;
            }
            if (typeof config.offset.right === 'number') {
                this.offset.right = config.offset.right;
            } else {
                this.offset.right = 0;
            }
            if (typeof config.offset.bottom === 'number') {
                this.offset.bottom = config.offset.bottom;
            } else {
                this.offset.bottom = 0;
            }
        } else {
            this.offset = { top: 0, left: 0, right: 0, bottom: 0 };
        }
        if (Array.isArray(config.walkImages) && config.walkImages.length > 0) {
            this.IMAGES_WALKING = config.walkImages;
        } else {
            this.IMAGES_WALKING = [];
        }

        if (typeof config.deadImage === 'string') {
            this.IMAGE_DEAD = config.deadImage;
        } else {
            this.IMAGE_DEAD = '';
        }
        if (
            Array.isArray(config.patrol) &&
            config.patrol.length === 2 &&
            typeof config.patrol[0] === 'number' &&
            typeof config.patrol[1] === 'number'
        ) {
            let a = config.patrol[0];
            let b = config.patrol[1];
            if (a < b) {
                this.patrolMinX = a;
                this.patrolMaxX = b;
            } else {
                this.patrolMinX = b;
                this.patrolMaxX = a;
            }
        } else {
            this.patrolMinX = this.x - 200;
            this.patrolMaxX = this.x + 200;
        }
        if (this.IMAGES_WALKING.length > 0) {
            this.loadImage(this.IMAGES_WALKING[0]);
            this.loadImages(this.IMAGES_WALKING);
        }
        if (this.IMAGE_DEAD !== '') {
            this.loadImages([this.IMAGE_DEAD]);
        }
        this.y = this.groundBottomY - this.height;
        this.animate();
    }

    animate() {
        this.moveInterval = setInterval(() => {
            if (!this.isDead) {
                this.x += this.speed * this.direction;
                this.otherDirection = (this.direction === 1);
                const now = Date.now();
                if (now - this.lastStepAt >= this.stepIntervalMs) {
                    this.lastStepAt = now;
                    if (window.sfx) {
                        const id = (this instanceof ChickenSmall) ? 'chicken-small.step' : 'chicken.step';
                        window.sfx.play(id);
                    }
                }
                if (this.x <= this.patrolMinX) {
                    this.x = this.patrolMinX;
                    this.direction = 1;
                } else if (this.x + this.width >= this.patrolMaxX) {
                    this.x = this.patrolMaxX - this.width;
                    this.direction = -1;
                }
            }
        }, 1000 / 60);
        this.animInterval = setInterval(() => {
            if (this.isDead) {
                this.img = this.imageCache[this.IMAGE_DEAD];
            } else {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 120);
    }


    freeze() {
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
        if (this.animInterval) {
            clearInterval(this.animInterval);
            this.animInterval = null;
        }
        this.speed = 0;
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.speed = 0;
        this.canCollide = false;
        this.img = this.imageCache[this.IMAGE_DEAD];
        if (window.sfx) {
            const id = (this instanceof ChickenSmall) ? 'chicken-small.dead' : 'chicken.dead';
            window.sfx.play(id);
        }
        const blinkSteps = [true, false, true];
        let i = 0;
        const step = () => {
            if (i < blinkSteps.length) {
                this.visible = blinkSteps[i++];
                setTimeout(step, 120);
            } else {
                this.visible = false;
                setTimeout(() => { this.markForRemoval = true; }, 120);
            }
        };
        step();
    }

}
