/**
 * Boss enemy with state-based animations (walk, alert, attack, hurt, dead) and simple AI.
 * The class fields above define sprites, size/position, hitbox offset, health,
 * state/animation control, distances, speeds, timers, and flags used by the boss.
 */
class Endboss extends MovableObject {

    IMAGES_WALK = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ];
    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png'
    ];
    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png'
    ];
    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];
    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    height = 300;
    width = 150;
    y = 350;
    x = 2160;
    offset = { top: 50, left: 0, right: 0, bottom: 20 };
    energy = 100;
    currentState = 'idle';
    currentFrame = 0;
    animationInterval = null;
    alertDistance = 450;
    attackDistance = 220;
    walkSpeed = 0.3;
    alertSpeed = 0.6;
    attackSpeed = 1.2;
    hurtDurationMs = 400;
    hurtUntil = 0;
    alertPlayed = false;
    deathAnimFinished = false;
    lastStepAt = 0;
    stepIntervalMs = 380;

    /**
     * Preloads animation sequences and sets the initial sprite/state.
     */
    constructor() {
        super().loadImage('img/4_enemie_boss_chicken/1_walk/G1.png');
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.currentState = 'idle';
        this.img = this.imageCache[this.IMAGES_ALERT[0]];
    }

    /**
     * Starts a new animation for the given state and plays its SFX.
     * @param {'walk'|'alert'|'attack'|'hurt'|'dead'} state
     */
    setAnimation(state) {
        this.resetAnimationState(state);
        const { seq, delay } = this.selectAnimation(state);
        this.triggerSfxForState(state);
        this.setInitialFrame(seq);
        this.beginAnimationLoop(seq, delay);
    }

    /**
     * Resets frame counters and clears previous interval.
     * @param {string} state
     */
    resetAnimationState(state) {
        this.currentState = state;
        this.currentFrame = 0;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    /**
     * Picks the frame sequence and delay for a given state.
     * @param {string} state
     * @returns {{seq:string[],delay:number}}
     */
    selectAnimation(state) {
        let seq = [];
        let delay = 120;
        if (state === 'walk') { seq = this.IMAGES_WALK; delay = 150; }
        if (state === 'alert') { seq = this.IMAGES_ALERT; delay = 120; }
        if (state === 'attack') { seq = this.IMAGES_ATTACK; delay = 90; }
        if (state === 'hurt') { seq = this.IMAGES_HURT; delay = 120; }
        if (state === 'dead') { seq = this.IMAGES_DEAD; delay = 150; this.deathAnimFinished = false; }
        return { seq, delay };
    }

    /**
     * Plays matching sound effects and music transitions per state.
     * @param {string} state
     */
    triggerSfxForState(state) {
        if (!window.sfx) return;
        if (state === 'alert') {
            window.sfx.play('boss.alert');
            window.sfx.musicTo('music.boss.loop', 400);
        }
        if (state === 'attack') window.sfx.play('boss.attack');
        if (state === 'hurt') window.sfx.play('boss.hit');
        if (state === 'dead') {
            window.sfx.play('boss.dead');
            window.sfx.stop('music.boss.loop');
        }
    }

    /**
     * Shows the first frame of the chosen sequence.
     * @param {string[]} seq
     */
    setInitialFrame(seq) {
        if (Array.isArray(seq) && seq.length > 0) {
            this.img = this.imageCache[seq[0]];
        }
    }

    /**
     * Begins the interval loop that advances frames.
     * @param {string[]} seq
     * @param {number} delay
     */
    beginAnimationLoop(seq, delay) {
        this.animationInterval = setInterval(() => {
            this.tickAnimation(seq);
        }, delay);
    }

    /**
     * Advances animation by one frame; handles alert completion and dead routing.
     * @param {string[]} seq
     */
    tickAnimation(seq) {
        if (this.currentState === 'dead') {
            this.tickDead(seq);
            return;
        }
        if (this.currentFrame >= seq.length) this.currentFrame = 0;
        this.img = this.imageCache[seq[this.currentFrame]];
        this.currentFrame += 1;
        if (this.currentState === 'alert' && this.currentFrame >= seq.length) {
            this.finishAlert();
        }
    }

    /**
     * Plays death sequence once; then disables collisions and marks finished.
     * @param {string[]} seq
     */
    tickDead(seq) {
        if (this.currentFrame < seq.length) {
            this.img = this.imageCache[seq[this.currentFrame]];
            this.currentFrame += 1;
        } else {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
            this.canCollide = false;
            this.deathAnimFinished = true;
        }
    }

    /**
     * Ends the alert once its sequence finishes and transitions into walking.
     */
    finishAlert() {
        clearInterval(this.animationInterval);
        this.animationInterval = null;
        this.alertPlayed = true;
        this.setAnimation('walk');
    }

    /**
     * Stops animation and movement speeds (e.g., on pause).
     */
    freeze() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.walkSpeed = 0;
        this.alertSpeed = 0;
        this.attackSpeed = 0;
    }

    /**
     * Simple AI: chooses states based on distance to player and timers.
     * @param {object} world - Contains character and game state.
     */
    updateAI(world) {
        if (this.shouldSkipAI(world)) return;
        const { player, dirToPlayer, now } = this.aiContext(world);
        this.otherDirection = (dirToPlayer === 1);
        if (this.handleHurt(now, dirToPlayer)) return;
        if (this.handleDead()) return;
        const dist = Math.abs(player.x - this.x);
        if (this.handleAlert(dist)) return;
        if (this.handleAttack(dist, dirToPlayer)) return;
        this.handleApproach(dist, dirToPlayer);
    }

    /**
     * Skips AI when dead, game over, or missing character.
     * @param {object} world
     * @returns {boolean}
     */
    shouldSkipAI(world) {
        if (this.currentState === 'dead') return true;
        if (world && world.gameOver) return true;
        if (!world || !world.character) return true;
        return false;
    }

    /**
     * Collects player, direction to player, and current time.
     * @param {object} world
     * @returns {{player:object,dirToPlayer:number,now:number}}
     */
    aiContext(world) {
        const player = world.character;
        const dirToPlayer = (player.x >= this.x) ? 1 : -1;
        const now = Date.now();
        return { player, dirToPlayer, now };
    }

    /**
     * While hurt timer is active: play hurt anim and apply small knockback.
     * @param {number} now
     * @param {number} dirToPlayer
     * @returns {boolean}
     */
    handleHurt(now, dirToPlayer) {
        if (now < this.hurtUntil) {
            if (this.currentState !== 'hurt') this.setAnimation('hurt');
            this.x += -dirToPlayer * 0.4;
            return true;
        }
        return false;
    }

    /**
     * If energy is zero: ensure dead state is set.
     * @returns {boolean}
     */
    handleDead() {
        if (!this.isDead()) return false;
        if (this.currentState !== 'dead') this.setAnimation('dead');
        return true;
    }

    /**
     * Triggers alert once when player enters alert distance.
     * @param {number} dist
     * @returns {boolean}
     */
    handleAlert(dist) {
        if (this.alertPlayed === false && dist <= this.alertDistance) {
            if (this.currentState !== 'alert') this.setAnimation('alert');
            return true;
        }
        return false;
    }

    /**
     * Attacks when in range; moves toward player at attack speed.
     * @param {number} dist
     * @param {number} dirToPlayer
     * @returns {boolean}
     */
    handleAttack(dist, dirToPlayer) {
        if (dist > this.attackDistance) return false;
        if (this.currentState !== 'attack') this.setAnimation('attack');
        this.x += dirToPlayer * this.attackSpeed;
        this.playStepIfDue();
        return true;
    }

    /**
     * Approaches the player (faster inside alert distance, otherwise patrol-walks left).
     * @param {number} dist
     * @param {number} dirToPlayer
     */
    handleApproach(dist, dirToPlayer) {
        if (dist <= this.alertDistance) {
            if (this.currentState !== 'walk') this.setAnimation('walk');
            this.x += dirToPlayer * this.alertSpeed;
            this.playStepIfDue();
            return;
        }
        if (this.currentState !== 'walk') this.setAnimation('walk');
        this.x -= this.walkSpeed;
        this.playStepIfDue();
    }

    /**
     * Plays a step sound at intervals to avoid overlap.
     */
    playStepIfDue() {
        const t = Date.now();
        if (t - this.lastStepAt >= this.stepIntervalMs) {
            this.lastStepAt = t;
            if (window.sfx) window.sfx.play('boss.step');
        }
    }

    /**
     * Applies damage, transitions to hurt/dead when appropriate.
     * @param {number} damage
     */
    hit(damage) {
        if (typeof damage !== 'number') damage = 20;
        if (this.currentState === 'dead') return;
        this.energy -= damage;
        if (this.energy < 0) this.energy = 0;
        if (this.isDead()) {
            this.setAnimation('dead');
            return;
        }
        this.hurtUntil = Date.now() + this.hurtDurationMs;
        this.setAnimation('hurt');
    }
}