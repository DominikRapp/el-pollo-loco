class Character extends MovableObject {

    IMAGES_IDLE = [
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
    IMAGES_LONG_IDLE = [
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
    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'
    ];
    IMAGES_JUMPING = [
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
    IMAGES_DEAD = [
        'img/2_character_pepe/5_dead/D-51.png',
        'img/2_character_pepe/5_dead/D-52.png',
        'img/2_character_pepe/5_dead/D-53.png',
        'img/2_character_pepe/5_dead/D-54.png',
        'img/2_character_pepe/5_dead/D-55.png',
        'img/2_character_pepe/5_dead/D-56.png',
        'img/2_character_pepe/5_dead/D-57.png'
    ];
    IMAGES_HURT = [
        'img/2_character_pepe/4_hurt/H-41.png',
        'img/2_character_pepe/4_hurt/H-42.png',
        'img/2_character_pepe/4_hurt/H-43.png'
    ];

    height = 300;
    width = 150;
    y = 335;
    groundTopY = 335;
    speed = 10;
    throwFrame = 'img/2_character_pepe/2_walk/W-22.png';
    lastInputTime = Date.now();
    idleActive = false;
    idleIntroPlayed = false;
    currentIdleFrame = 0;
    idlePhase = 'intro';
    IDLE_FULL = [];
    wasInAir = false;
    world;
    canControl = true;
    deathStarted = false;
    deadLocked = false;
    deathAnimIndex = 0;
    deathAnimInterval = null;
    snorePlaying = false;
    lastStepAt = 0;
    stepIntervalMs = 260;
    snoreInterval = null;
    snorePeriodMs = 1800;
    jumpFrameDelayMs = 40;
    lastJumpFrameAt = 0;
    idleStartDelaySec = 15;
    idleFrameDelayMs = 250;
    lastIdleFrameAt = 0;

    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.offset = { top: 115, left: 25, right: 35, bottom: 15 };
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.IDLE_FULL = this.IMAGES_IDLE.concat(this.IMAGES_LONG_IDLE);
        this.y = this.groundTopY
        this.applyGravity();
        this.animate();
    }

    animate() {
        this.startControlLoop();
        this.startFrameLoop();
    }

    startControlLoop() {
        this.controlInterval = setInterval(() => {
            if (!this.world) return;
            if (this.world?.frozen) return;
            if (this.handleDeathState()) return;
            this.tickHasInput = false;
            const movingHoriz = this.moveByInput();
            this.handleJumpInput();
            this.handleStepSound(movingHoriz);
            this.handleInputActivity();
            this.handleLanding();
            this.updateCamera();
        }, 1000 / 60);
    }

    handleDeathState() {
        if (!(this.deadLocked || this.deathStarted)) return false;
        if (this.snorePlaying) this.stopSnore();
        this.world.camera_x = -this.x + 100;
        return true;
    }

    moveByInput() {
        let moved = false;
        const r = this.canControl && this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x;
        const l = this.canControl && this.world.keyboard.LEFT && this.x > 0;
        if (r) { this.moveRight(); this.otherDirection = false; this.tickHasInput = true; moved = true; }
        if (l) { this.moveLeft(); this.otherDirection = true; this.tickHasInput = true; moved = true; }
        return r || l || moved;
    }

    handleJumpInput() {
        if (this.canControl && this.world.keyboard.SPACE && !this.isAboveGround()) {
            this.jump();
            this.tickHasInput = true;
        }
    }

    handleStepSound(movingHoriz) {
        const grounded = !this.isAboveGround();
        if (!grounded || !movingHoriz) return;
        const now = Date.now();
        if (now - this.lastStepAt >= this.stepIntervalMs) {
            this.lastStepAt = now;
            if (window.sfx) window.sfx.play('character.step');
        }
    }

    handleInputActivity() {
        if (!this.tickHasInput) return;
        this.lastInputTime = Date.now();
        this.idleActive = false;
        this.idleIntroPlayed = false;
        this.currentIdleFrame = 0;
        this.idlePhase = 'intro';
        this.lastIdleFrameAt = 0;
        if (this.snorePlaying) this.stopSnore();
    }

    handleLanding() {
        const inAir = this.isAboveGround();
        if (this.wasInAir && !inAir) {
            this.setStandingFrame();
            this.idleActive = false;
            this.idleIntroPlayed = false;
            this.currentIdleFrame = 0;
            this.idlePhase = 'intro';
            this.lastInputTime = Date.now();
            this.lastIdleFrameAt = 0;
            if (this.snorePlaying) this.stopSnore();
        }
        this.wasInAir = inAir;
    }

    stopSnore() {
        this.snorePlaying = false;
        if (this.snoreInterval) { clearInterval(this.snoreInterval); this.snoreInterval = null; }
        if (window.sfx) window.sfx.stop('character.snore.loop');
    }

    updateCamera() {
        this.world.camera_x = -this.x + 100;
    }

    startFrameLoop() {
        this.frameInterval = setInterval(() => {
            if (!this.world) return;
            if (this.world?.frozen) return;
            if (this.isDead() && !this.deathStarted) { this.startDeath(); return; }
            if (this.deathStarted || this.deadLocked) return;
            if (this.isHurt()) { this.playAnimation(this.IMAGES_HURT); return; }
            if (this.handleAirAnimation()) return;
            if (this.isThrowFrameActive()) { this.playThrowFrame(); return; }
            this.handleGroundAnimation();
        }, 50);
    }

    handleAirAnimation() {
        if (!this.isAboveGround()) { this.lastJumpFrameAt = 0; return false; }
        const now = Date.now();
        if (now - this.lastJumpFrameAt >= this.jumpFrameDelayMs) {
            this.playAnimation(this.IMAGES_JUMPING);
            this.lastJumpFrameAt = now;
        }
        return true;
    }

    isThrowFrameActive() {
        if (!this.world) return false;
        const t = this.world.lastThrowTime || 0;
        const dt = Date.now() - t;
        return dt >= 0 && dt <= 100;
    }

    handleGroundAnimation() {
        const moving = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
        if (moving) {
            this.playAnimation(this.IMAGES_WALKING);
            return;
        }
        const idleTime = (Date.now() - this.lastInputTime) / 1000;
        if (idleTime > this.idleStartDelaySec) {
            this.playIdleAnimation();
        } else {
            this.setStandingFrame();
            this.lastIdleFrameAt = 0;
        }
    }

    hit() {
        const wasDead = this.isDead();
        super.hit();
        if (!wasDead) {
            this.canControl = false;
            setTimeout(() => {
                if (!this.deathStarted && !this.deadLocked) {
                    this.canControl = true;
                }
            }, this.damageProtectionTime);
        }
    }

    applyDamage(amount) {
        if (typeof amount !== 'number') amount = 20;
        if (this.isDead()) return;
        this.energy -= amount;
        if (this.energy < 0) this.energy = 0;
        this.lastHit = Date.now();
        if (window.sfx) window.sfx.play('character.hit');
        this.canControl = false;
        setTimeout(() => {
            if (!this.deathStarted && !this.deadLocked) this.canControl = true;
        }, this.damageProtectionTime);
    }

    jump() {
        if (!this.canControl) return;
        if (this.isAboveGround()) return;
        this.speedY = 30;
        if (window.sfx) window.sfx.play('character.jump');
    }

    startDeath() {
        if (this.deathStarted) return;
        this.deathStarted = true;
        this.canControl = false;
        if (this.snorePlaying) this.stopSnore();
        this.stopHorizontalMotion();
        this.playDeathSound();
        this.beginDeathAnim();
    }

    stopHorizontalMotion() {
        this.speed = 0;
        if (typeof this.vx === 'number') this.vx = 0;
        if (typeof this.vy === 'number') this.vy = 0;
        if (typeof this.ax === 'number') this.ax = 0;
        if (typeof this.ay === 'number') this.ay = 0;
    }

    playDeathSound() {
        if (!window.sfx) return;
        if (window.sfx.stop) window.sfx.stop('character.snore.loop');
        window.sfx.play('character.dead');
    }

    beginDeathAnim() {
        this.deathFrameIndex = 0;
        this.deathStepMs = this.deathStepMs || 120;
        this.runDeathAnimStep();
    }

    runDeathAnimStep() {
        const frames = this.IMAGES_DEAD || [];
        if (this.deathFrameIndex < frames.length) {
            const p = frames[this.deathFrameIndex++];
            const img = this.imageCache ? this.imageCache[p] : null;
            if (img) this.img = img;
            setTimeout(() => this.runDeathAnimStep(), this.deathStepMs);
        } else {
            this.finalizeDeath();
        }
    }

    finalizeDeath() {
        this.deadLocked = true;
        this.otherDirection = false;
        if (this.world && typeof this.world.onPlayerDeath === 'function') {
            this.world.onPlayerDeath(this);
        }
    }

    playIdleAnimation() {
        this.ensureIdleState();
        if (!this.isIdleFrameDue()) return;
        const frames = this.pickIdleFrames();
        this.applyIdleFrame(frames);
        this.advanceIdleCounters();
    }

    ensureIdleState() {
        if (this.idleActive) return;
        this.idleActive = true;
        this.currentIdleFrame = 0;
        this.idlePhase = this.idleIntroPlayed ? 'loop' : 'intro';
        this.lastIdleFrameAt = 0;
    }

    isIdleFrameDue() {
        const now = Date.now();
        if (now - (this.lastIdleFrameAt || 0) < this.idleFrameDelayMs) return false;
        this.lastIdleFrameAt = now;
        return true;
    }

    pickIdleFrames() {
        if (this.idlePhase === 'intro') return this.IDLE_FULL;
        this.ensureSnoreLoop();
        return this.IMAGES_LONG_IDLE;
    }

    ensureSnoreLoop() {
        if (this.snorePlaying) return;
        this.snorePlaying = true;
        if (window.sfx) window.sfx.play('character.snore.loop');
        if (this.snoreInterval) { clearInterval(this.snoreInterval); this.snoreInterval = null; }
        this.snoreInterval = setInterval(() => {
            if (!this.snorePlaying) return;
            if (window.sfx) window.sfx.play('character.snore.loop');
        }, this.snorePeriodMs);
    }

    applyIdleFrame(frames) {
        const idx = this.currentIdleFrame;
        const path = frames[idx];
        this.img = this.imageCache[path];
        this.currentIdleFrame = idx + 1;
    }

    advanceIdleCounters() {
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
        const charBottom = this.y + this.height - (this.offset?.bottom || 0);
        const enemyTop = enemy.y + (enemy.offset?.top || 0);
        const isFalling = this.speedY < 0;
        const closeToTop = (charBottom - enemyTop) < 30;
        return isFalling && closeToTop;
    }

    playThrowFrame() {
        this.img = this.imageCache[this.throwFrame];
        this.currentImage = 0;
        if (window.sfx) window.sfx.play('character.throw');
    }
}