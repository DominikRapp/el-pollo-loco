/**
 * Main playable character with movement, jump, idle/long-idle, throw, hurt, and death handling.
 * Loads all animation sheets, applies gravity, and runs control + frame loops.
 * Method comments explain behavior; properties at the top are left undocumented as requested.
 */
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
    jumpOnceIndex = 0;
    jumpOnceActive = false;

    /**
     * Loads default sprite, all animation sheets, sets physics and starts loops.
     */
    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.offset = { top: 115, left: 25, right: 35, bottom: 15 };
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.helper = new CharacterHelper(this);
        this.IDLE_FULL = this.IMAGES_IDLE.concat(this.IMAGES_LONG_IDLE);
        this.y = this.groundTopY
        this.applyGravity();
        this.animate();
    }

    /**
     * Starts the input/control loop and the animation frame loop.
     */
    animate() {
        this.startControlLoop();
        this.startFrameLoop();
    }

    /**
     * Handles player input, movement, jump, step sounds, camera, and idle resets.
     */
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

    /**
     * Locks camera and audio when dead/locked; returns true if handled.
     * @returns {boolean}
     */
    handleDeathState() {
        if (!(this.deadLocked || this.deathStarted)) return false;
        if (this.snorePlaying) this.stopSnore();
        this.world.camera_x = -this.x + 100;
        return true;
    }

    /**
     * Applies left/right input and facing direction; returns movement flag.
     * @returns {boolean}
     */
    moveByInput() {
        let moved = false;
        const r = this.canControl && this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x;
        const l = this.canControl && this.world.keyboard.LEFT && this.x > 0;
        if (r) { this.moveRight(); this.otherDirection = false; this.tickHasInput = true; moved = true; }
        if (l) { this.moveLeft(); this.otherDirection = true; this.tickHasInput = true; moved = true; }
        return r || l || moved;
    }

    /**
     * Delegates movement to helper (right).
     * @returns {*}
     */
    moveRight() {
        return this.helper.moveRight();
    }

    /**
     * Delegates movement to helper (left).
     * @returns {*}
     */
    moveLeft() {
        return this.helper.moveLeft();
    }

    /**
     * Triggers jump if space is pressed and character is grounded.
     */
    handleJumpInput() {
        if (this.canControl && this.world.keyboard.SPACE && !this.isAboveGround()) {
            this.jump();
            this.tickHasInput = true;
        }
    }

    /**
     * Plays periodic step sound while grounded and moving.
     * @param {boolean} movingHoriz
     */
    handleStepSound(movingHoriz) {
        const grounded = !this.isAboveGround();
        if (!grounded || !movingHoriz) return;
        const now = Date.now();
        if (now - this.lastStepAt >= this.stepIntervalMs) {
            this.lastStepAt = now;
            if (window.sfx) window.sfx.play('character.step');
        }
    }

    /**
     * Resets idle state when input is detected and stops snoring if active.
     */
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

    /**
     * Detects landing to reset standing/idle state and audio.
     */
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

    /**
     * Stops snore loop and clears its timer.
     */
    stopSnore() {
        this.snorePlaying = false;
        if (this.snoreInterval) { clearInterval(this.snoreInterval); this.snoreInterval = null; }
        if (window.sfx) window.sfx.stop('character.snore.loop');
    }

    /**
     * Keeps the camera following the character.
     */
    updateCamera() {
        this.world.camera_x = -this.x + 100;
    }

    /**
     * Chooses the correct animation set each tick (hurt, air, throw, ground) and plays it.
     */
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

    /**
     * Delegates air animation logic (jump/long-air) to helper.
     * @returns {boolean}
     */
    handleAirAnimation() {
        return this.helper.handleAirAnimation();
    }

    /**
     * Delegates throw-frame state check to helper.
     * @returns {boolean}
     */
    isThrowFrameActive() {
        return this.helper.isThrowFrameActive();
    }

    /**
     * Delegates ground animation (walk/idle/long-idle) to helper.
     * @returns {*}
     */
    handleGroundAnimation() {
        return this.helper.handleGroundAnimation();
    }

    /**
     * Overrides hit: temporarily disables control; respects death lock.
     */
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

    /**
     * Applies numeric damage, plays sound, and briefly disables control.
     * @param {number} amount
     */
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

    /**
     * Performs a jump and resets per-jump animation state.
     * - Calls the base jump() implementation.
     * - Plays the jump sound if available.
     * - Resets one-shot flags/counters for the jump animation.
     */
    jump() {
        super.jump();
        if (window.sfx) window.sfx.play('character.jump');
        this.jumpOnceActive = true;
        this.jumpOnceIndex = 0;
        this.lastJumpFrameAt = 0;
    }

    /**
     * Delegates death sequence start to helper and returns its result.
     * @returns {*}
     */
    startDeath() {
        return this.helper.startDeath();
    }

    /**
     * Sets a neutral standing frame (first idle sprite).
     */
    setStandingFrame() {
        let path = this.IMAGES_IDLE[0];
        this.img = this.imageCache[path];
        this.currentImage = 0;
    }

    /**
     * Checks if the character is stomping an enemy from above.
     * @param {MovableObject} enemy
     * @returns {boolean}
     */
    isStomping(enemy) {
        const charBottom = this.y + this.height - (this.offset?.bottom || 0);
        const enemyTop = enemy.y + (enemy.offset?.top || 0);
        const isFalling = this.speedY < 0;
        const closeToTop = (charBottom - enemyTop) < 30;
        return isFalling && closeToTop;
    }

    /**
     * Delegates throw-frame rendering to helper.
     * @returns {*}
     */
    playThrowFrame() {
        return this.helper.playThrowFrame();
    }
}