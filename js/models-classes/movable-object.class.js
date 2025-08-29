class MovableObject extends DrawableObject {

    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;
    damageProtectionTime = 1000;
    offset =
        {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };

    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }

    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < 130;
        }
    }

    isColliding(movableObject) {
    return (this.x + this.width - this.offset.right) > (movableObject.x + movableObject.offset.left) &&
           (this.y + this.height - this.offset.bottom) > (movableObject.y + movableObject.offset.top) &&
           (this.x + this.offset.left) < (movableObject.x + movableObject.width - movableObject.offset.right) &&
           (this.y + this.offset.top) < (movableObject.y + movableObject.height - movableObject.offset.bottom);
}

    hit() {
        this.energy -= 20;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        const timePassed = new Date().getTime() - this.lastHit;
        return timePassed < this.damageProtectionTime;
    }

    isDead() {
        return this.energy == 0;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        this.speedY = 30;
    }
}