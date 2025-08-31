class World {

    character = new Character();
    level = null;
    enemies = [];
    clouds = [];
    backgroundObjects = [];
    platforms = [];
    barrels = [];
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    bottleBar = new BottleBar();
    bossBar = null;
    throwableObjects = [];
    lastThrowTime = 0;
    throwCooldown = 1000;
    bottleCount = 0;
    bottleMax = 5;
    groundBottles = [];
    boss = null;
    bossBarVisible = false;
    bossAlertShown = false;
    gameOver = false;
    coinBar = new CoinBar();
    coinPickups = [];
    coinCount = 0;
    coinMax = 5;
    baseGroundTopY = 335;

    constructor(canvas, keyboard, level) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.level = level;
        this.enemies = level.enemies;
        this.clouds = level.clouds;
        this.backgroundObjects = level.backgroundObjects;
        this.platforms = level.platforms || [];
        this.barrels = level.barrels || [];
        this.groundBottles = level.bottles || [];
        this.coinPickups = level.coins || [];
        this.rules = level.rules || {};
        if (level.start && typeof level.start.characterX === 'number') { this.character.x = level.start.characterX; }
        this.coinBar = new CoinBar();
        this.coinBar.x = 10;
        this.coinBar.y = 45;
        this.coinBar.setPercentage(0);
        this.bossBar = new BossBar();
        this.bossBar.x = this.canvas.width - this.bossBar.width - 10;
        this.bossBar.y = 0;
        this.boss = this.level.enemies.find(e => e instanceof Endboss) || null;
        if (this.boss) { this.bossBar.setPercentage(this.boss.energy); }
        this.baseGroundTopY = this.character.groundTopY;
        this.draw();
        this.setWorld();
        this.run();
    }

    setWorld() {
        this.character.world = this;
    }

    run() {
        setInterval(() => {
            if (!this.gameOver && this.character.deadLocked) {
                this.freezeAll();
                this.gameOver = true;
            }
            if (this.gameOver) return;
            this.updateCharacterGround();
            if (this.boss) {
                if (this.bossAlertShown === true) {
                    this.boss.updateAI(this);
                } else {
                    let dist = Math.abs(this.character.x - this.boss.x);
                    let alertDist = this.boss.alertDistance || 450;
                    if (dist <= alertDist) {
                        if (typeof this.boss.goAlert === 'function') {
                            this.boss.goAlert();
                        } else if (typeof this.boss.setAnimation === 'function') {
                            this.boss.setAnimation('alert');
                            this.boss.currentState = 'alert';
                        }
                        this.bossAlertShown = true;
                        this.bossBarVisible = true;
                    }
                }
            }
            this.blockCharacterByBarrels();
            this.checkCollisions();
            this.checkThrowableObjects();
            this.checkBottlePickups();
            this.checkCoinPickups();
            this.cleanupProjectiles();
            this.cleanupEnemies();
        }, 1000 / 60);
    }

    blockCharacterByBarrels() {
        const c = this.character;
        const cLeft = c.x + (c.offset?.left || 0);
        const cRight = c.x + c.width - (c.offset?.right || 0);
        const cTop = c.y + (c.offset?.top || 0);
        const cBottom = c.y + c.height - (c.offset?.bottom || 0);

        for (const b of this.level.barrels) {
            const bLeft = b.x + (b.offset?.left || 0);
            const bRight = b.x + b.width - (b.offset?.right || 0);
            const bTop = b.y + (b.offset?.top || 0);
            const bBottom = b.y + b.height - (b.offset?.bottom || 0);
            const overlapX = cRight > bLeft && cLeft < bRight;
            const overlapY = cBottom > bTop && cTop < bBottom;
            if (overlapX && overlapY) {
                const fromLeft = (c.x + c.width / 2) < (b.x + b.width / 2);
                if (fromLeft) {
                    const desiredRight = bLeft - 1;
                    c.x = desiredRight - (c.width - (c.offset?.right || 0));
                } else {
                    const desiredLeft = bRight + 1;
                    c.x = desiredLeft - (c.offset?.left || 0);
                }
            }
        }
    }

    checkThrowableObjects() {
        const now = Date.now();
        const bossBottleDamage = this.rules.bossBottleDamage ?? 100;
        if (this.keyboard.THROW &&
            (now - this.lastThrowTime) >= this.throwCooldown &&
            this.bottleCount > 0 &&
            this.character.canControl) {
            let direction = 1;
            let offsetX = Math.round(this.character.width * 0.66);
            if (this.character.otherDirection) {
                direction = -1;
                offsetX = Math.round(-this.character.width * 0.13);
            }
            const startX = this.character.x + offsetX;
            const startY = Math.round(this.character.y + this.character.height * 0.45);
            const bottle = new ThrowableObject(startX, startY, direction);
            this.throwableObjects.push(bottle);
            this.bottleCount = Math.max(0, this.bottleCount - 1);
            const percent = (this.bottleCount / this.bottleMax) * 100;
            this.bottleBar.setPercentage(percent);
            if (this.character.playThrowFrame) {
                this.character.playThrowFrame();
                setTimeout(() => this.character.setStandingFrame(), 200);
            }
            this.lastThrowTime = now;
        }
        this.throwableObjects.forEach((bottle) => {
            if (bottle.isSplashing) return;
            this.level.enemies.forEach((enemy) => {
                if (!bottle.isSplashing && bottle.isColliding(enemy)) {
                    if (enemy instanceof Endboss && !enemy.isDead()) {
                        enemy.hit(bossBottleDamage);
                        if (this.bossBar) {
                            const value = enemy.isDead() ? 0 : enemy.energy;
                            this.bossBar.setPercentage(value);
                        }
                    }
                    bottle.splash();
                }
            });
        });
    }

    updateCharacterGround() {
        let ground = this.baseGroundTopY;
        const c = this.character;
        const cLeft = c.x + (c.offset?.left || 0);
        const cRight = c.x + c.width - (c.offset?.right || 0);
        const cBottom = c.y + c.height - (c.offset?.bottom || 0);

        for (const p of this.level.platforms) {
            const pLeft = p.x + (p.offset?.left || 0);
            const pRight = p.x + p.width - (p.offset?.right || 0);
            const pTop = p.y + (p.offset?.top || 0);
            const overlapsX = cRight > pLeft && cLeft < pRight;
            const aboveTop = cBottom <= pTop + 10;
            const falling = c.speedY <= 0;
            if (overlapsX && aboveTop && falling) {
                const candidate = pTop - c.height + (c.offset?.bottom || 0);
                if (candidate < ground) ground = candidate;
            }
        }
        for (const b of this.level.barrels) {
            const bLeft = b.x + (b.offset?.left || 0);
            const bRight = b.x + b.width - (b.offset?.right || 0);
            const bTop = b.y + (b.offset?.top || 0);
            const overlapsX = cRight > bLeft && cLeft < bRight;
            const aboveTop = cBottom <= bTop + 10;
            const falling = c.speedY <= 0;
            if (overlapsX && aboveTop && falling) {
                const candidate = bTop - c.height + (c.offset?.bottom || 0);
                if (candidate < ground) ground = candidate;
            }
        }
        c.groundTopY = ground;
    }

    cleanupProjectiles() {
        this.throwableObjects = this.throwableObjects.filter(b => !b.markForRemoval);
    }

    spawnGroundBottles() {
        const img1 = 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png';
        const img2 = 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png';
        this.groundBottles = [
            new BottlePickup(img1, 450),
            new BottlePickup(img1, 900),
            new BottlePickup(img1, 1350),
            new BottlePickup(img2, 1750),
            new BottlePickup(img2, 2050)
        ];
    }

    checkBottlePickups() {
        this.groundBottles = this.groundBottles.filter((pickup) => {
            const collides = this.character.isColliding(pickup);
            if (!collides) return true;
            if (this.bottleCount < this.bottleMax) {
                this.bottleCount++;
                const percent = (this.bottleCount / this.bottleMax) * 100;
                this.bottleBar.setPercentage(percent);
                return false;
            } else {
                return true;
            }
        });
    }

    spawnCoins() {
        this.coinPickups = [
            new CoinPickup(520),
            new CoinPickup(780),
            new CoinPickup(1120),
            new CoinPickup(1600),
            new CoinPickup(1980)
        ];
    }

    checkCoinPickups() {
        var self = this;
        this.coinPickups = this.coinPickups.filter(function (coin) {
            var collides = self.character.isColliding(coin);
            if (!collides) {
                return true;
            }
            if (self.coinCount < self.coinMax) {
                self.coinCount++;
                var percent = (self.coinCount / self.coinMax) * 100;
                self.coinBar.setPercentage(percent);
                return false;
            }
            return true;
        });
    }

    checkCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (!(enemy instanceof Chicken || enemy instanceof ChickenSmall)) return;
            this.level.barrels.forEach((b) => {
                const collides =
                    (enemy.x + enemy.width - (enemy.offset?.right || 0)) > (b.x + (b.offset?.left || 0)) &&
                    (enemy.y + enemy.height - (enemy.offset?.bottom || 0)) > (b.y + (b.offset?.top || 0)) &&
                    (enemy.x + (enemy.offset?.left || 0)) < (b.x + b.width - (b.offset?.right || 0)) &&
                    (enemy.y + (enemy.offset?.top || 0)) < (b.y + b.height - (b.offset?.bottom || 0));
                if (collides) {
                    enemy.direction *= -1;
                    if (enemy.direction === 1) {
                        enemy.x = b.x - enemy.width - 1;
                    } else {
                        enemy.x = b.x + b.width + 1;
                    }
                }
            });
        });

        this.level.enemies.forEach((enemy) => {
            if (!enemy.canCollide) return;
            if (this.character.isColliding(enemy)) {
                const isChicken = (enemy instanceof Chicken) || (enemy instanceof ChickenSmall);
                if (isChicken && this.character.isStomping(enemy)) {
                    let enemyTopOffset = 0;
                    if (enemy.offset && typeof enemy.offset.top === 'number') {
                        enemyTopOffset = enemy.offset.top;
                    }
                    const enemyTop = enemy.y + enemyTopOffset;
                    let charBottomOffset = 0;
                    if (this.character.offset && typeof this.character.offset.bottom === 'number') {
                        charBottomOffset = this.character.offset.bottom;
                    }
                    this.character.y = enemyTop - (this.character.height - charBottomOffset);
                    this.character.speedY = 20;
                    enemy.die();
                    return;
                }
                if (!this.character.isHurt() && !this.character.isDead()) {
                    const contactDamage = (enemy instanceof Endboss)
                        ? (this.rules.bossContactDamage ?? 30)
                        : (this.rules.enemyContactDamage ?? 20);
                    this.character.applyDamage(contactDamage);
                    this.statusBar.setPercentage(this.character.energy);
                    const push = 40;
                    if (this.character.x < enemy.x) {
                        this.character.x -= push;
                    } else {
                        this.character.x += push;
                    }
                    this.character.speedY = 15;
                }
            }
        });
    }

    cleanupEnemies() {
        this.level.enemies = this.level.enemies.filter(e => !e.markForRemoval);
    }

    freezeAll() {
        this.character.speed = 0;
        this.character.speedY = 0;
        if (this.boss) {
            if (typeof this.boss.freeze === 'function') {
                this.boss.freeze();
            } else {
                if (this.boss.animationInterval) {
                    clearInterval(this.boss.animationInterval);
                    this.boss.animationInterval = null;
                }
                this.boss.walkSpeed = 0;
                this.boss.alertSpeed = 0;
                this.boss.attackSpeed = 0;
            }
        }
        this.level.enemies.forEach((e) => {
            if (typeof e.freeze === 'function') {
                e.freeze();
            } else {
                e.speed = 0;
            }
        });
        this.level.clouds.forEach((c) => {
            if (typeof c.freeze === 'function') {
                c.freeze();
            } else {
                c.speed = 0;
            }
        });
        this.throwableObjects.forEach((b) => {
            if (typeof b.freeze === 'function') {
                b.freeze();
            } else {
                if (b.moveInterval) clearInterval(b.moveInterval);
                if (b.rotationInterval) clearInterval(b.rotationInterval);
                if (b.splashInterval) clearInterval(b.splashInterval);
                b.speedY = 0;
            }
        });
        this.groundBottles.forEach((p) => {
            if (typeof p.freeze === 'function') p.freeze();
        });
        this.coinPickups.forEach((c) => {
            if (typeof c.freeze === 'function') c.freeze();
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.platforms);
        this.addObjectsToMap(this.level.barrels);
        this.addObjectsToMap(this.groundBottles);
        this.addObjectsToMap(this.coinPickups);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.restore();
        this.ctx.save();
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        if (this.bossBarVisible) {
            this.addToMap(this.bossBar);
        }
        this.addToMap(this.coinBar);
        this.ctx.restore();
        requestAnimationFrame(() => this.draw());
    }


    addObjectsToMap(objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    }

    addToMap(movableObject) {
        if (movableObject.otherDirection) {
            this.flipImage(movableObject);
        }
        movableObject.draw(this.ctx);
        movableObject.drawFrame(this.ctx);
        if (movableObject.otherDirection) {
            this.flipImageBack(movableObject);
        }
    }

    flipImage(movableObject) {
        this.ctx.save();
        this.ctx.translate(movableObject.width, 0);
        this.ctx.scale(-1, 1);
        movableObject.x = movableObject.x * -1;
    }

    flipImageBack(movableObject) {
        movableObject.x = movableObject.x * -1;
        this.ctx.restore();
    }
}