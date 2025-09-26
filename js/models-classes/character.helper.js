/**
 * Helper for character animations and movement handling.
 * Centralizes air/ground animation flows, idle logic with snore loop,
 * horizontal movement with simple barrel collision, throw/death frames,
 * and death sequence orchestration.
 */
class CharacterHelper {
    /**
     * @param {object} owner - The character instance this helper controls
     */
    constructor(owner) {
        this.o = owner;
    }

    /**
     * Handles the airborne animation state machine (jump frames → long-air).
     * Returns whether an air-handling step ran this frame.
     *
     * @returns {boolean} True if air handling ran on this frame
     */
    handleAirAnimation() {
        if (this.resetAirStateIfGrounded()) return false;
        const now = Date.now();
        this.tryAdvanceJumpFrame(now);
        return true;
    }

    /**
     * Resets air-related flags when the character is grounded.
     *
     * @returns {boolean} True if a reset occurred (i.e., character was grounded)
     */
    resetAirStateIfGrounded() {
        const o = this; // << vorher stand hier this.o
        if (o.isAboveGround()) return false;
        o.lastJumpFrameAt = 0;
        o.jumpOnceActive = false;
        o.jumpOnceIndex = 0;
        return true;
    }

    /**
     * Marks the start timestamp of being airborne if not set.
     * @param {number} now - Current time in ms
     */
    ensureAirborneStart(now) {
        if (this.o.airborneStartedAt === 0) this.o.airborneStartedAt = now;
    }

    /**
     * Switches to long-air pose after threshold; primes timing.
     * @param {number} now - Current time in ms
     * @returns {boolean} True if long-air activated this call
     */
    tryActivateLongAir(now) {
        const o = this.o;
        if (o.longAirActive) return false;
        if (now - o.airborneStartedAt < o.longAirThresholdMs) return false;
        const img = o.imageCache ? o.imageCache[o.LONG_AIR_IMAGE] : null;
        if (!img) o.loadImages([o.LONG_AIR_IMAGE]);
        o.img = img || o.img;
        o.longAirActive = true;
        o.lastJumpFrameAt = now;
        return true;
    }

    /**
     * Advances one jump frame after a fixed delay until the last frame.
     * Updates the current sprite from the cache if available.
     *
     * @param {number} now - Current time in milliseconds
     * @returns {boolean} True if a frame was advanced
     */
    tryAdvanceJumpFrame(now) {
        const o = this;
        if (now - o.lastJumpFrameAt < o.jumpFrameDelayMs) return false;
        const frames = o.IMAGES_JUMPING;
        const i = Math.min(o.jumpOnceIndex, frames.length - 1);
        const p = frames[i];
        const img = o.imageCache ? o.imageCache[p] : null;
        if (img) o.img = img;
        if (o.jumpOnceIndex < frames.length - 1) o.jumpOnceIndex++;
        o.lastJumpFrameAt = now;
        return true;
    }

    /**
     * Chooses ground animation: walking vs idle (with idle intro/loop).
     */
    handleGroundAnimation() {
        const o = this.o;
        const k = o.world.keyboard;
        const moving = k.RIGHT || k.LEFT;
        if (moving) { o.playAnimation(o.IMAGES_WALKING); return; }
        const idleTime = (Date.now() - o.lastInputTime) / 1000;
        if (idleTime > o.idleStartDelaySec) this.playIdleAnimation();
        else { o.setStandingFrame(); o.lastIdleFrameAt = 0; }
    }

    /**
     * Runs one step of idle animation (intro → loop).
     */
    playIdleAnimation() {
        const o = this.o;
        this.ensureIdleState();
        if (!this.isIdleFrameDue()) return;
        const frames = this.pickIdleFrames();
        this.applyIdleFrame(frames);
        this.advanceIdleCounters();
    }

    /**
     * Initializes idle state if needed.
     */
    ensureIdleState() {
        const o = this.o;
        if (o.idleActive) return;
        o.idleActive = true;
        o.currentIdleFrame = 0;
        o.idlePhase = o.idleIntroPlayed ? 'loop' : 'intro';
        o.lastIdleFrameAt = 0;
    }

    /**
     * Checks if it's time to advance idle frame.
     * @returns {boolean} True if due this tick
     */
    isIdleFrameDue() {
        const o = this.o;
        const now = Date.now();
        if (now - (o.lastIdleFrameAt || 0) < o.idleFrameDelayMs) return false;
        o.lastIdleFrameAt = now;
        return true;
    }

    /**
     * Chooses idle frames for current phase (intro vs loop).
     * @returns {string[]} Frame paths
     */
    pickIdleFrames() {
        const o = this.o;
        if (o.idlePhase === 'intro') return o.IDLE_FULL;
        this.ensureSnoreLoop();
        return o.IMAGES_LONG_IDLE;
    }

    /**
     * Starts/maintains looping snore SFX during long idle.
     */
    ensureSnoreLoop() {
        const o = this.o;
        if (o.snorePlaying) return;
        o.snorePlaying = true;
        if (window.sfx) window.sfx.play('character.snore.loop');
        if (o.snoreInterval) { clearInterval(o.snoreInterval); o.snoreInterval = null; }
        o.snoreInterval = setInterval(() => {
            if (!o.snorePlaying) return;
            if (window.sfx) window.sfx.play('character.snore.loop');
        }, o.snorePeriodMs);
    }

    /**
     * Applies current idle frame and advances index.
     * @param {string[]} frames - Frame paths for this phase
     */
    applyIdleFrame(frames) {
        const o = this.o;
        const idx = o.currentIdleFrame;
        const path = frames[idx];
        o.img = o.imageCache[path];
        o.currentIdleFrame = idx + 1;
    }

    /**
     * Rolls intro → loop and loops indices at sequence ends.
     */
    advanceIdleCounters() {
        const o = this.o;
        if (o.idlePhase === 'intro' && o.currentIdleFrame >= o.IDLE_FULL.length) {
            o.idleIntroPlayed = true;
            o.idlePhase = 'loop';
            o.currentIdleFrame = 0;
        } else if (o.idlePhase === 'loop' && o.currentIdleFrame >= o.IMAGES_LONG_IDLE.length) {
            o.currentIdleFrame = 0;
        }
    }

    /**
     * Moves right with simple barrel collision resolution.
     */
    moveRight() {
        const o = this.o;
        const col = o.world?.collider;
        const barrels = o.world?.level?.barrels || [];
        const next = col.rectWithOffsets({ x: o.x + o.speed, y: o.y, width: o.width, height: o.height, offset: o.offset });
        for (const b of barrels) {
            const r = col.rectWithOffsets(b);
            if (next.right > r.left && next.left < r.right && next.bottom > r.top && next.top < r.bottom) {
                o.x = (r.left - 1) - (o.width - (o.offset?.right || 0)); return;
            }
        }
        o.x += o.speed;
    }

    /**
     * Moves left with simple barrel collision resolution.
     */
    moveLeft() {
        const o = this.o;
        const col = o.world?.collider;
        const barrels = o.world?.level?.barrels || [];
        const next = col.rectWithOffsets({ x: o.x - o.speed, y: o.y, width: o.width, height: o.height, offset: o.offset });
        for (const b of barrels) {
            const r = col.rectWithOffsets(b);
            if (next.right > r.left && next.left < r.right && next.bottom > r.top && next.top < r.bottom) {
                o.x = (r.right + 1) - (o.offset?.left || 0); return;
            }
        }
        o.x -= o.speed;
    }

    /**
     * Checks if the throw frame window is currently active.
     * @returns {boolean}
     */
    isThrowFrameActive() {
        const o = this.o;
        if (!o.world) return false;
        const t = o.world.lastThrowTime || 0;
        const dt = Date.now() - t;
        return dt >= 0 && dt <= 100;
    }

    /**
     * Applies the single throw frame.
     */
    playThrowFrame() {
        const o = this.o;
        o.img = o.imageCache[o.throwFrame];
        o.currentImage = 0;
    }

    /**
     * Starts death flow (locks controls, stops motion/SFX, begins anim).
     */
    startDeath() {
        const o = this.o;
        if (o.deathStarted) return;
        o.deathStarted = true;
        o.canControl = false;
        if (o.snorePlaying) o.stopSnore();
        this.stopHorizontalMotion();
        this.playDeathSound();
        this.beginDeathAnim();
    }

    /**
     * Zeros velocity/acceleration to halt movement.
     */
    stopHorizontalMotion() {
        const o = this.o;
        o.speed = 0;
        if (typeof o.vx === 'number') o.vx = 0;
        if (typeof o.vy === 'number') o.vy = 0;
        if (typeof o.ax === 'number') o.ax = 0;
        if (typeof o.ay === 'number') o.ay = 0;
    }

    /**
     * Plays death SFX and stops snore loop if present.
     */
    playDeathSound() {
        if (!window.sfx) return;
        if (window.sfx.stop) window.sfx.stop('character.snore.loop');
        window.sfx.play('character.dead');
    }

    /**
     * Initializes death animation counters and kicks off steps.
     */
    beginDeathAnim() {
        const o = this.o;
        o.deathFrameIndex = 0;
        o.deathStepMs = o.deathStepMs || 120;
        this.runDeathAnimStep();
    }

    /**
     * Advances death frames on a timer; finalizes when done.
     */
    runDeathAnimStep() {
        const o = this.o;
        const frames = o.IMAGES_DEAD || [];
        if (o.deathFrameIndex < frames.length) {
            const p = frames[o.deathFrameIndex++];
            const img = o.imageCache ? o.imageCache[p] : null;
            if (img) o.img = img;
            setTimeout(() => this.runDeathAnimStep(), o.deathStepMs);
        } else {
            this.finalizeDeath();
        }
    }

    /**
     * Locks dead state and notifies the world handler.
     */
    finalizeDeath() {
        const o = this.o;
        o.deadLocked = true;
        o.otherDirection = false;
        if (o.world && typeof o.world.onPlayerDeath === 'function') o.world.onPlayerDeath(o);
    }
}