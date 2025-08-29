class World {
    character = new Character();
    level = level1;
    enemies = level1.enemies;
    clouds = level1.clouds;
    backgroundObjects = level1.backgroundObjects;
    acnvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    throwableObjects = [];
    lastThrowTime = 0;
    throwCooldown = 1000;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
        this.run();
    }

    setWorld() {
        this.character.world = this;
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowableObjects();
            this.cleanupProjectiles();
        }, 200);
    }

    checkThrowableObjects() {
        const now = Date.now();
        if (this.keyboard.THROW && (now - this.lastThrowTime) >= this.throwCooldown) {
            let direction = 1;
            let offsetX = 100;
            if (this.character.otherDirection) {
                direction = -1;
                offsetX = -20;
            }
            let startX = this.character.x + offsetX;
            let startY = this.character.y + 100;
            let throwDirection = direction;
            let bottle = new ThrowableObject(startX, startY, throwDirection);
            this.throwableObjects.push(bottle);
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
                        enemy.hit();
                    }
                    bottle.splash();
                }
            });
        });
    }

    cleanupProjectiles() {
        this.throwableObjects = this.throwableObjects.filter(b => !b.markForRemoval);
    }

    checkCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (this.character.isColliding(enemy)) {
                if (this.character.isStomping && this.character.isStomping(enemy)) {
                    this.character.speedY = 20;
                    return;
                }
                if (!this.character.isHurt() && !this.character.isDead()) {
                    this.character.hit();
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

    draw() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusBar);
        this.ctx.translate(this.camera_x, 0);
        this.ctx.translate(-this.camera_x, 0);
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
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