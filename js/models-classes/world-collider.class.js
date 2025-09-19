class WorldCollider {

    blockCharacterByBarrels(world) {
        const c = world.character;
        const barrels = world.level.barrels || [];
        for (const b of barrels) {
            const cRect = this.rectWithOffsets(c);
            const bRect = this.rectWithOffsets(b);
            if (this.rectsOverlap(cRect, bRect)) {
                this.resolveHorizontal(c, b, bRect);
            }
        }
    }

    rectWithOffsets(o) {
        const off = o?.offset || {};
        const left = o.x + (off.left || 0);
        const top = o.y + (off.top || 0);
        const right = o.x + o.width - (off.right || 0);
        const bottom = o.y + o.height - (off.bottom || 0);
        return { left, top, right, bottom };
    }

    rectsOverlap(a, b) {
        const overlapX = a.right > b.left && a.left < b.right;
        const overlapY = a.bottom > b.top && a.top < b.bottom;
        return overlapX && overlapY;
    }

    fromLeft(c, b) {
        return (c.x + c.width / 2) < (b.x + b.width / 2);
    }

    resolveHorizontal(c, b, bRect) {
        if (this.fromLeft(c, b)) {
            const desiredRight = bRect.left - 1;
            c.x = desiredRight - (c.width - (c.offset?.right || 0));
        } else {
            const desiredLeft = bRect.right + 1;
            c.x = desiredLeft - (c.offset?.left || 0);
        }
    }

    updateCharacterGround(world) {
        let ground = world.baseGroundTopY;
        const c = world.character;
        ground = this.updateGroundFromList(world.level.platforms, c, ground);
        ground = this.updateGroundFromList(world.level.barrels, c, ground);
        c.groundTopY = ground;
    }

    updateGroundFromList(list, c, ground) {
        for (const o of (list || [])) {
            if (!this.canStandOn(c, o)) continue;
            const candidate = this.groundCandidate(c, o);
            if (candidate < ground) ground = candidate;
        }
        return ground;
    }

    canStandOn(c, o) {
        const cLeft = c.x + (c.offset?.left || 0);
        const cRight = c.x + c.width - (c.offset?.right || 0);
        const cBottom = c.y + c.height - (c.offset?.bottom || 0);
        const oLeft = o.x + (o.offset?.left || 0);
        const oRight = o.x + o.width - (o.offset?.right || 0);
        const oTop = o.y + (o.offset?.top || 0);
        const overlapX = cRight > oLeft && cLeft < oRight;
        const aboveTop = cBottom <= oTop + 10;
        const falling = c.speedY <= 0;
        return overlapX && aboveTop && falling;
    }

    groundCandidate(c, o) {
        const oTop = o.y + (o.offset?.top || 0);
        return oTop - c.height + (c.offset?.bottom || 0);
    }

    checkCollisions(world) {
        this.blockEnemiesByBarrels(world);
        const now = Date.now();
        for (const enemy of world.level.enemies || []) {
            this.handleEnemyCollision(world, enemy, now);
        }
    }

    blockEnemiesByBarrels(world) {
        const enemies = world.level.enemies || [];
        const barrels = world.level.barrels || [];
        for (const e of enemies) {
            if (!this.isChicken(e)) continue;
            for (const b of barrels) {
                if (!this.rectsOverlap(this.getRect(e), this.getRect(b))) continue;
                e.direction *= -1;
                if ((e.x + e.width / 2) < (b.x + b.width / 2)) {
                    e.x = b.x - e.width - 1;
                } else {
                    e.x = b.x + b.width + 1;
                }
            }
        }
    }

    handleEnemyCollision(world, enemy, now) {
        if (!enemy.canCollide) return;
        const c = world.character;
        if (!c.isColliding(enemy)) return;
        if (this.isChicken(enemy) && c.isStomping(enemy)) {
            this.handleStomp(world, enemy);
            return;
        }
        if (!this.canApplyDamage(world, enemy, now)) return;
        this.applyDamageFlow(world, enemy, now);
    }

    isChicken(e) {
        return (e instanceof Chicken) || (e instanceof ChickenSmall);
    }

    getRect(o) {
        const off = o?.offset || {};
        const l = o.x + (off.left || 0);
        const t = o.y + (off.top || 0);
        const r = o.x + o.width - (off.right || 0);
        const b = o.y + o.height - (off.bottom || 0);
        return { l, t, r, b };
    }

    rectsOverlap(a, b) {
        const ox = a.r > b.l && a.l < b.r;
        const oy = a.b > b.t && a.t < b.b;
        return ox && oy;
    }

    handleStomp(world, enemy) {
        const c = world.character;
        const eTop = enemy.y + (enemy.offset?.top || 0);
        const cBotOff = c.offset?.bottom || 0;
        c.y = eTop - (c.height - cBotOff);
        c.speedY = 20;
        enemy.die();
        if (enemy instanceof ChickenSmall) {
            world.stats.chickenSmall = (world.stats.chickenSmall || 0) + 1;
        } else if (enemy instanceof Chicken) {
            world.stats.chicken = (world.stats.chicken || 0) + 1;
        }
    }

    canApplyDamage(world, enemy, now) {
        const c = world.character;
        if (c.isHurt() || c.isDead()) return false;
        if (enemy instanceof Endboss) {
            const dt = now - world.lastBossHitTime;
            if (dt < world.bossHitCooldownMs) return false;
        }
        return true;
    }

    applyDamageFlow(world, enemy, now) {
        const c = world.character;
        const dmg = (enemy instanceof Endboss)
            ? (world.rules.bossContactDamage ?? 20)
            : (world.rules.enemyContactDamage ?? 20);
        c.applyDamage(dmg);
        world.statusBar.setPercentage(c.energy);
        if (enemy instanceof Endboss) world.lastBossHitTime = now;
        const push = 40;
        c.x += (c.x < enemy.x) ? -push : push;
        c.speedY = 15;
        if (typeof c.energy === 'number' && c.energy <= 0) {
            world.gameOver = true;
            world.freezeAll();
        }
    }

}
