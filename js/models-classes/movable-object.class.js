/**
 * Movable entity with gravity, collisions, health, and basic movement helpers.
 * Class fields above define physics (speed, acceleration, gravity), combat (energy, i-frames),
 * collision flags/offsets, and ground reference for snapping.
 */
class MovableObject extends DrawableObject {

    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;
    damageProtectionTime = 500;
    offset = { top: 0, left: 0, right: 0, bottom: 0 };
    canCollide = true;
    groundTopY = 370;
    gravityInterval = null;

    /**
     * Starts the gravity loop once (60 FPS).
     */
    applyGravity() {
        if (this.gravityInterval) return;
        this.gravityInterval = setInterval(() => {
            this.stepGravity();
        }, 1000 / 60);
    }

    /**
     * Chooses gravity behavior based on object type (throwable vs default).
     */
    stepGravity() {
        if (this.isThrowable()) {
            this.stepThrowableGravity();
            return;
        }
        this.stepDefaultGravity();
    }

    /**
     * Returns true if this object uses throwable physics.
     * @returns {boolean}
     */
    isThrowable() {
        return this instanceof ThrowableObject;
    }

    /**
     * Gravity step for throwable objects (projectile arc).
     */
    stepThrowableGravity() {
        if (this.isAboveGround() || this.speedY > 0) {
            this.y -= this.speedY;
            this.speedY -= this.acceleration;
        }
    }

    /**
     * Gravity step for regular objects; snaps to ground when landing.
     */
    stepDefaultGravity() {
        if (this.isAboveGround() || this.speedY !== 0) {
            this.y -= this.speedY;
            this.speedY -= this.acceleration;
            if (this.y >= this.groundTopY && this.speedY <= 0) {
                this.y = this.groundTopY;
                this.speedY = 0;
            }
        }
    }

    /**
     * Stops the gravity loop (e.g., on pause or removal).
     */
    freeze() {
        if (this.gravityInterval) {
            clearInterval(this.gravityInterval);
            this.gravityInterval = null;
        }
    }

    /**
     * Checks if the object is above ground; throwables are always treated as airborne.
     * @returns {boolean}
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < this.groundTopY;
        }
    }

    /**
     * Axis-aligned bounding-box collision using each object's offset hitbox.
     * @param {MovableObject} movableObject
     * @returns {boolean}
     */
    isColliding(movableObject) {
        return (this.x + this.width - this.offset.right) > (movableObject.x + movableObject.offset.left) &&
            (this.y + this.height - this.offset.bottom) > (movableObject.y + movableObject.offset.top) &&
            (this.x + this.offset.left) < (movableObject.x + movableObject.width - movableObject.offset.right) &&
            (this.y + this.offset.top) < (movableObject.y + movableObject.height - movableObject.offset.bottom);
    }

    /**
     * Applies standard damage and starts brief invulnerability if still alive.
     */
    hit() {
        this.energy -= 20;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    /**
     * Returns true while invulnerability (i-frames) is active after a hit.
     * @returns {boolean}
     */
    isHurt() {
        const timePassed = new Date().getTime() - this.lastHit;
        return timePassed < this.damageProtectionTime;
    }

    /**
     * True when energy is depleted.
     * @returns {boolean}
     */
    isDead() {
        return this.energy == 0;
    }

    /**
     * Cycles through a provided image array to animate sprites.
     * @param {string[]} images
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /**
     * Moves right by current speed.
     */
    moveRight() {
        this.x += this.speed;
    }

    /**
     * Moves left by current speed.
     */
    moveLeft() {
        this.x -= this.speed;
    }

    /**
     * Starts an upward movement by setting vertical speed.
     */
    jump() {
        this.speedY = 30;
    }
}