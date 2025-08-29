class Character extends MovableObject {

    height = 300;
    width = 150;
    y = -30;
    speed = 10;
    IMAGES_IDLE =
        [
            'img/2_character_pepe/1_idle/idle/I-1.png',
            'img/2_character_pepe/1_idle/idle/I-2.png',
            'img/2_character_pepe/1_idle/idle/I-3.png',
            'img/2_character_pepe/1_idle/idle/I-4.png',
            'img/2_character_pepe/1_idle/idle/I-5.png',
            'img/2_character_pepe/1_idle/idle/I-6.png',
            'img/2_character_pepe/1_idle/idle/I-7.png',
            'img/2_character_pepe/1_idle/idle/I-8.png',
            'img/2_character_pepe/1_idle/idle/I-9.png',
            'img/2_character_pepe/1_idle/idle/I-10.png'
        ];
    IMAGES_LONG_IDLE =
        [
            'img/2_character_pepe/1_idle/long_idle/I-11.png',
            'img/2_character_pepe/1_idle/long_idle/I-12.png',
            'img/2_character_pepe/1_idle/long_idle/I-13.png',
            'img/2_character_pepe/1_idle/long_idle/I-14.png',
            'img/2_character_pepe/1_idle/long_idle/I-15.png',
            'img/2_character_pepe/1_idle/long_idle/I-16.png',
            'img/2_character_pepe/1_idle/long_idle/I-17.png',
            'img/2_character_pepe/1_idle/long_idle/I-18.png',
            'img/2_character_pepe/1_idle/long_idle/I-19.png',
            'img/2_character_pepe/1_idle/long_idle/I-20.png'
        ];
    IMAGES_WALKING =
        [
            'img/2_character_pepe/2_walk/W-21.png',
            'img/2_character_pepe/2_walk/W-22.png',
            'img/2_character_pepe/2_walk/W-23.png',
            'img/2_character_pepe/2_walk/W-24.png',
            'img/2_character_pepe/2_walk/W-25.png',
            'img/2_character_pepe/2_walk/W-26.png'
        ];
    IMAGES_JUMPING =
        [
            'img/2_character_pepe/3_jump/J-31.png',
            'img/2_character_pepe/3_jump/J-32.png',
            'img/2_character_pepe/3_jump/J-33.png',
            'img/2_character_pepe/3_jump/J-34.png',
            'img/2_character_pepe/3_jump/J-35.png',
            'img/2_character_pepe/3_jump/J-36.png',
            'img/2_character_pepe/3_jump/J-37.png',
            'img/2_character_pepe/3_jump/J-38.png',
            'img/2_character_pepe/3_jump/J-39.png'
        ];
    IMAGES_DEAD =
        [
            'img/2_character_pepe/5_dead/D-51.png',
            'img/2_character_pepe/5_dead/D-52.png',
            'img/2_character_pepe/5_dead/D-53.png',
            'img/2_character_pepe/5_dead/D-54.png',
            'img/2_character_pepe/5_dead/D-55.png',
            'img/2_character_pepe/5_dead/D-56.png',
            'img/2_character_pepe/5_dead/D-57.png'
        ];
    IMAGES_HURT =
        [
            'img/2_character_pepe/4_hurt/H-41.png',
            'img/2_character_pepe/4_hurt/H-42.png',
            'img/2_character_pepe/4_hurt/H-43.png'
        ];
    throwFrame = 'img/2_character_pepe/2_walk/W-22.png';
    lastInputTime = Date.now();
    idleActive = false;
    idleIntroPlayed = false;
    currentIdleFrame = 0;
    idlePhase = 'intro';
    IDLE_FULL = [];
    wasInAir = false;
    world;

    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.offset = {
            top: 115,
            left: 25,
            right: 35,
            bottom: 15
        };
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.IDLE_FULL = this.IMAGES_IDLE.concat(this.IMAGES_LONG_IDLE);
        this.applyGravity();
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (!this.world) return;
            let input = false;
            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                this.moveRight();
                this.otherDirection = false;
                input = true;
            }
            if (this.world.keyboard.LEFT && this.x > 0) {
                this.moveLeft();
                this.otherDirection = true;
                input = true;
            }
            if (this.world.keyboard.SPACE && !this.isAboveGround()) {
                this.jump();
                input = true;
            }
            if (this.world.keyboard.THROW) {
                input = true;
            }
            if (input) {
                this.lastInputTime = Date.now();
                this.idleActive = false;
                this.idleIntroPlayed = false;
                this.currentIdleFrame = 0;
                this.idlePhase = 'intro';
            }
            const currentlyInAir = this.isAboveGround();
            if (this.wasInAir && !currentlyInAir) {
                this.setStandingFrame();
                this.idleActive = false;
                this.idleIntroPlayed = false;
                this.currentIdleFrame = 0;
                this.idlePhase = 'intro';
                this.lastInputTime = Date.now();
            }
            this.wasInAir = currentlyInAir;
            this.world.camera_x = -this.x + 100;
        }, 1000 / 60);

        setInterval(() => {
            if (!this.world) return;
            if (this.isDead()) {
                this.playAnimation(this.IMAGES_DEAD);
                return;
            }
            if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
                return;
            }
            if (this.isAboveGround()) {
                this.playAnimation(this.IMAGES_JUMPING);
                return;
            }
            const moving = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
            if (moving) {
                this.playAnimation(this.IMAGES_WALKING);
            } else {
                const idleTime = (Date.now() - this.lastInputTime) / 1000;
                if (idleTime > 3) {
                    this.playIdleAnimation();
                } else {
                    this.setStandingFrame();
                }
            }
        }, 50);
    }

    jump() {
        this.speedY = 30;
    }

    playIdleAnimation() {
        if (!this.idleActive) {
            this.idleActive = true;
            this.currentIdleFrame = 0;
            if (this.idleIntroPlayed) {
                this.idlePhase = 'loop';
            } else {
                this.idlePhase = 'intro';
            }
        }
        let activeIdleFrames;
        if (this.idlePhase === 'intro') {
            activeIdleFrames = this.IDLE_FULL;
        } else {
            activeIdleFrames = this.IMAGES_LONG_IDLE;
        }
        let path = activeIdleFrames[this.currentIdleFrame];
        this.img = this.imageCache[path];
        this.currentIdleFrame++;
        if (this.idlePhase === 'intro' && this.currentIdleFrame >= this.IDLE_FULL.length) {
            this.idleIntroPlayed = true;
            this.idlePhase = 'loop';
            this.currentIdleFrame = 0;
        } else if (this.idlePhase === 'loop' && this.currentIdleFrame >= this.IMAGES_LONG_IDLE.length) {
            this.currentIdleFrame = 0;
        }
    }

    setStandingFrame() {
        let path = this.IMAGES_IDLE[0];
        this.img = this.imageCache[path];
        this.currentImage = 0;
    }

    isStomping(enemy) {
        const charBottom = this.y + this.height;
        const enemyTop = enemy.y;
        const isFalling = this.speedY < 0;
        const closeToEnemyTop = (charBottom - enemyTop) < 30;
        return isFalling && closeToEnemyTop;
    }

    playThrowFrame() {
        this.img = this.imageCache[this.throwFrame];
        this.currentImage = 0;
    }
}