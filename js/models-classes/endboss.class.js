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

    height = 500;
    width = 300;
    y = 170;
    x = 2160;
    offset = { top: 50, left: 40, right: 40, bottom: 20 };
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

    setAnimation(state) {
        this.currentState = state;
        this.currentFrame = 0;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        let seq = [];
        let delay = 120;
        if (state === 'walk') { seq = this.IMAGES_WALK; delay = 150; }
        if (state === 'alert') { seq = this.IMAGES_ALERT; delay = 120; }
        if (state === 'attack') { seq = this.IMAGES_ATTACK; delay = 90; }
        if (state === 'hurt') { seq = this.IMAGES_HURT; delay = 120; }
        if (state === 'dead') { seq = this.IMAGES_DEAD; delay = 150; this.deathAnimFinished = false; }

        if (state === 'alert') {
            if (window.sfx) {
                window.sfx.play('boss.alert');
                window.sfx.musicTo('music.boss.loop', 400);
            }
        }
        if (state === 'attack') {
            if (window.sfx) window.sfx.play('boss.attack');
        }
        if (state === 'hurt') {
            if (window.sfx) window.sfx.play('boss.hit');
        }
        if (state === 'dead') {
            if (window.sfx) {
                window.sfx.play('boss.dead');
                window.sfx.stop('music.boss.loop');
            }
        }

        if (seq.length > 0) {
            this.img = this.imageCache[seq[0]];
        }
        const self = this;
        this.animationInterval = setInterval(function () {
            if (self.currentState === 'dead') {
                if (self.currentFrame < seq.length) {
                    self.img = self.imageCache[seq[self.currentFrame]];
                    self.currentFrame += 1;
                } else {
                    clearInterval(self.animationInterval);
                    self.animationInterval = null;
                    self.canCollide = false;
                    self.deathAnimFinished = true;
                }
                return;
            }
            if (self.currentFrame >= seq.length) {
                self.currentFrame = 0;
            }
            self.img = self.imageCache[seq[self.currentFrame]];
            self.currentFrame += 1;
            if (self.currentState === 'alert' && self.currentFrame >= seq.length) {
                clearInterval(self.animationInterval);
                self.animationInterval = null;
                self.alertPlayed = true;
                self.setAnimation('walk');
            }
        }, delay);
    }



    freeze() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.walkSpeed = 0;
        this.alertSpeed = 0;
        this.attackSpeed = 0;
    }

    updateAI(world) {
        if (this.currentState === 'dead') return;
        if (world && world.gameOver) return;
        if (!world || !world.character) return;

        let player = world.character;
        let dirToPlayer = (player.x >= this.x) ? 1 : -1;
        this.otherDirection = (dirToPlayer === 1);
        let now = Date.now();

        if (now < this.hurtUntil) {
            if (this.currentState !== 'hurt') this.setAnimation('hurt');
            this.x += -dirToPlayer * 0.4;
            return;
        }

        if (this.isDead()) {
            if (this.currentState !== 'dead') this.setAnimation('dead');
            return;
        }

        let dist = Math.abs(player.x - this.x);
        if (this.alertPlayed === false && dist <= this.alertDistance) {
            if (this.currentState !== 'alert') this.setAnimation('alert');
            return;
        }
        if (dist <= this.attackDistance) {
            if (this.currentState !== 'attack') this.setAnimation('attack');
            this.x += dirToPlayer * this.attackSpeed;
            const t = Date.now();
            if (t - this.lastStepAt >= this.stepIntervalMs) {
                this.lastStepAt = t;
                if (window.sfx) window.sfx.play('boss.step');
            }
            return;
        }
        if (dist <= this.alertDistance) {
            if (this.currentState !== 'walk') this.setAnimation('walk');
            this.x += dirToPlayer * this.alertSpeed;
            const t = Date.now();
            if (t - this.lastStepAt >= this.stepIntervalMs) {
                this.lastStepAt = t;
                if (window.sfx) window.sfx.play('boss.step');
            }
            return;
        }
        if (this.currentState !== 'walk') this.setAnimation('walk');
        this.x -= this.walkSpeed;
        const t = Date.now();
        if (t - this.lastStepAt >= this.stepIntervalMs) {
            this.lastStepAt = t;
            if (window.sfx) window.sfx.play('boss.step');
        }
    }


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
