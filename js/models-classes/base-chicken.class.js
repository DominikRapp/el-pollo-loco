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
        const cfg = this.cfg(config);
        this.setPosition(cfg);
        this.setSize(cfg);
        this.setSpeed(cfg);
        this.setOffsets(cfg);
        this.setImages(cfg);
        this.setPatrol(cfg);
        this.setY(cfg);
        this.animate();
    }

    cfg(config) {
        if (config && typeof config === 'object') {
            return config;
        }
        return {};
    }

    setPosition(cfg) {
        if (typeof cfg.x === 'number') {
            this.x = cfg.x;
        } else {
            this.x = 0;
        }
    }

    setSize(cfg) {
        if (typeof cfg.width === 'number') {
            this.width = cfg.width;
        } else {
            this.width = 100;
        }
        if (typeof cfg.height === 'number') {
            this.height = cfg.height;
        } else {
            this.height = 100;
        }
    }

    setSpeed(cfg) {
        if (typeof cfg.speed === 'number') {
            this.speed = cfg.speed;
        } else {
            this.speed = 0.6;
        }
    }

    setOffsets(cfg) {
        if (cfg.offset && typeof cfg.offset === 'object') {
            this.offset = {
                top: typeof cfg.offset.top === 'number' ? cfg.offset.top : 0,
                left: typeof cfg.offset.left === 'number' ? cfg.offset.left : 0,
                right: typeof cfg.offset.right === 'number' ? cfg.offset.right : 0,
                bottom: typeof cfg.offset.bottom === 'number' ? cfg.offset.bottom : 0
            };
        } else {
            this.offset = { top: 0, left: 0, right: 0, bottom: 0 };
        }
    }

    setImages(cfg) {
        if (Array.isArray(cfg.walkImages) && cfg.walkImages.length > 0) {
            this.IMAGES_WALKING = cfg.walkImages;
        } else {
            this.IMAGES_WALKING = [];
        }
        this.IMAGE_DEAD = typeof cfg.deadImage === 'string' ? cfg.deadImage : '';
        if (this.IMAGES_WALKING.length > 0) {
            this.loadImage(this.IMAGES_WALKING[0]);
            this.loadImages(this.IMAGES_WALKING);
        }
        if (this.IMAGE_DEAD !== '') {
            this.loadImages([this.IMAGE_DEAD]);
        }
    }

    setPatrol(cfg) {
        if (Array.isArray(cfg.patrol) &&
            cfg.patrol.length === 2 &&
            typeof cfg.patrol[0] === 'number' &&
            typeof cfg.patrol[1] === 'number') {
            const a = cfg.patrol[0];
            const b = cfg.patrol[1];
            this.patrolMinX = Math.min(a, b);
            this.patrolMaxX = Math.max(a, b);
        } else {
            this.patrolMinX = this.x - 200;
            this.patrolMaxX = this.x + 200;
        }
    }

    setY(cfg) {
        if (typeof cfg.y === 'number') {
            this.y = cfg.y;
        } else {
            this.y = this.groundBottomY - this.height;
        }
    }

    animate() {
        this.startMoveLoop();
        this.startAnimLoop();
    }

    startMoveLoop() {
        this.moveInterval = setInterval(() => {
            if (this.isDead) { return; }
            this.x += this.speed * this.direction;
            this.otherDirection = (this.direction === 1);
            const now = Date.now();
            this.playStepIfDue(now);
            this.clampAndTurn();
        }, 1000 / 60);
    }

    playStepIfDue(now) {
        if (now - this.lastStepAt < this.stepIntervalMs) { return; }
        this.lastStepAt = now;
        if (!window.sfx) { return; }
        const id = (this instanceof ChickenSmall) ? 'chicken-small.step' : 'chicken.step';
        window.sfx.play(id);
    }

    clampAndTurn() {
        if (this.x <= this.patrolMinX) {
            this.x = this.patrolMinX;
            this.direction = 1;
        } else if (this.x + this.width >= this.patrolMaxX) {
            this.x = this.patrolMaxX - this.width;
            this.direction = -1;
        }
    }

    startAnimLoop() {
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
        if (this.isDead) { return; }
        this.prepareDeath();
        this.playDeadSound();
        this.runDeathSequence();
    }

    prepareDeath() {
        this.isDead = true;
        this.speed = 0;
        this.canCollide = false;
        this.img = this.imageCache[this.IMAGE_DEAD];
    }

    playDeadSound() {
        if (!window.sfx) { return; }
        const id = (this instanceof ChickenSmall) ? 'chicken-small.dead' : 'chicken.dead';
        window.sfx.play(id);
    }

    runDeathSequence() {
        this.deathBlinkSteps = [true, false, true];
        this.deathBlinkIndex = 0;
        this.deathBlinkStep();
    }

    deathBlinkStep() {
        if (this.deathBlinkIndex < this.deathBlinkSteps.length) {
            this.visible = this.deathBlinkSteps[this.deathBlinkIndex++];
            setTimeout(() => this.deathBlinkStep(), 120);
        } else {
            this.visible = false;
            setTimeout(() => { this.markForRemoval = true; }, 120);
        }
    }
}
