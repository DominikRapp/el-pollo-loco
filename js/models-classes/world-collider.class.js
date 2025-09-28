/**
 * Collision helper for the world: blocks character/enemies on barrels,
 * resolves ground standing, handles enemy contact (stomp/damage/knockback),
 * and detects bottle collisions with obstacles. Methods are documented briefly
 * for quick orientation; fields/locals are not commented individually.
 */
class WorldCollider {

    /**
     * Prevents the character from overlapping barrels horizontally.
     * @param {object} world
     */
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

    /**
     * Builds an axis-aligned rectangle from an object using its offsets.
     * @param {object} o
     * @returns {{left:number, top:number, right:number, bottom:number}}
     */
    rectWithOffsets(o) {
        const off = o?.offset || {};
        const left = o.x + (off.left || 0);
        const top = o.y + (off.top || 0);
        const right = o.x + o.width - (off.right || 0);
        const bottom = o.y + o.height - (off.bottom || 0);
        return { left, top, right, bottom };
    }

    /**
     * Checks rectangle overlap on X and Y axes.
     * @param {{left:number, top:number, right:number, bottom:number}} a
     * @param {{left:number, top:number, right:number, bottom:number}} b
     * @returns {boolean}
     */
    rectsOverlap(a, b) {
        const overlapX = a.right > b.left && a.left < b.right;
        const overlapY = a.bottom > b.top && a.top < b.bottom;
        return overlapX && overlapY;
    }

    /**
     * Returns true if character center is left of barrel center.
     * @param {object} c
     * @param {object} b
     * @returns {boolean}
     */
    fromLeft(c, b) {
        return (c.x + c.width / 2) < (b.x + b.width / 2);
    }

    /**
     * Pushes the character to the proper side of the barrel when overlapping.
     * @param {object} c
     * @param {object} b
     * @param {{left:number, right:number}} bRect
     */
    resolveHorizontal(c, b, bRect) {
        if (this.fromLeft(c, b)) {
            const desiredRight = bRect.left - 1;
            c.x = desiredRight - (c.width - (c.offset?.right || 0));
        } else {
            const desiredLeft = bRect.right + 1;
            c.x = desiredLeft - (c.offset?.left || 0);
        }
    }

    /**
     * Recomputes the character's ground Y based on platforms and barrels.
     * @param {object} world
     */
    updateCharacterGround(world) {
        let ground = world.baseGroundTopY;
        const c = world.character;
        ground = this.updateGroundFromList(world.level.platforms, c, ground);
        ground = this.updateGroundFromList(world.level.barrels, c, ground);
        c.groundTopY = ground;
    }

    /**
     * Returns the best (highest) ground candidate from a list for the character.
     * @param {Array} list
     * @param {object} c
     * @param {number} ground
     * @returns {number}
     */
    updateGroundFromList(list, c, ground) {
        for (const o of (list || [])) {
            if (!this.canStandOn(c, o)) continue;
            const candidate = this.groundCandidate(c, o);
            if (candidate < ground) ground = candidate;
        }
        return ground;
    }

    /**
     * True if character is horizontally over the object, above its top, and falling.
     * @param {object} c
     * @param {object} o
     * @returns {boolean}
     */
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

    /**
     * Calculates the Y position where character should stand on the object.
     * @param {object} c
     * @param {object} o
     * @returns {number}
     */
    groundCandidate(c, o) {
        const oTop = o.y + (o.offset?.top || 0);
        return oTop - c.height + (c.offset?.bottom || 0);
    }

    /**
     * Top-level enemy collision handling (blocking, stomp, contact damage).
     * @param {object} world
     */
    checkCollisions(world) {
        this.blockEnemiesByBarrels(world);
        const now = Date.now();
        for (const enemy of world.level.enemies || []) {
            this.handleEnemyCollision(world, enemy, now);
        }
    }

    /**
     * Stops chickens at barrels and flips their direction.
     * @param {object} world
     */
    blockEnemiesByBarrels(world) {
        const enemies = world.level.enemies || [];
        const barrels = world.level.barrels || [];
        for (const e of enemies) {
            if (!this.isChicken(e)) continue;
            for (const b of barrels) {
                if (!this.rectsOverlapCompact(this.getRect(e), this.getRect(b))) continue;
                e.direction *= -1;
                if ((e.x + e.width / 2) < (b.x + b.width / 2)) {
                    e.x = b.x - e.width - 1;
                } else {
                    e.x = b.x + b.width + 1;
                }
            }
        }
    }

    /**
     * Overlap test for compact rects from getRect().
     * @param {{l:number,t:number,r:number,b:number}} a
     * @param {{l:number,t:number,r:number,b:number}} b
     * @returns {boolean}
     */
    rectsOverlapCompact(a, b) {
        const ox = a.r > b.l && a.l < b.r;
        const oy = a.b > b.t && a.t < b.b;
        return ox && oy;
    }

    /**
     * Handles stomp kills and contact damage with cooldowns.
     * @param {object} world
     * @param {object} enemy
     * @param {number} now
     */
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

    /**
     * True if the enemy is a chicken type.
     * @param {object} e
     * @returns {boolean}
     */
    isChicken(e) {
        return (e instanceof Chicken) || (e instanceof ChickenSmall);
    }

    /**
     * Builds a compact rect {l,t,r,b} from an object using offsets.
     * @param {object} o
     * @returns {{l:number,t:number,r:number,b:number}}
     */
    getRect(o) {
        const off = o?.offset || {};
        const l = o.x + (off.left || 0);
        const t = o.y + (off.top || 0);
        const r = o.x + o.width - (off.right || 0);
        const b = o.y + o.height - (off.bottom || 0);
        return { l, t, r, b };
    }

    /**
     * Overlap test for compact rects from getRect().
     * @param {{l:number,t:number,r:number,b:number}} a
     * @param {{l:number,t:number,r:number,b:number}} b
     * @returns {boolean}
     */
    rectsOverlap(a, b) {
        const ox = a.r > b.l && a.l < b.r;
        const oy = a.b > b.t && a.t < b.b;
        return ox && oy;
    }

    /**
     * Resolves a stomp: place character on enemy, bounce up, kill enemy, update stats.
     * @param {object} world
     * @param {object} enemy
     */
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

    /**
     * Checks if damage can be applied (invuln states / boss cooldown).
     * @param {object} world
     * @param {object} enemy
     * @param {number} now
     * @returns {boolean}
     */
    canApplyDamage(world, enemy, now) {
        const c = world.character;
        if (c.isHurt() || c.isDead()) return false;
        if (enemy instanceof Endboss) {
            const dt = now - world.lastBossHitTime;
            if (dt < world.bossHitCooldownMs) return false;
        }
        return true;
    }

    /**
     * Applies contact damage, updates HUD, sets cooldowns, and adds knockback.
     * Also triggers game over when energy reaches 0.
     * @param {object} world
     * @param {object} enemy
     * @param {number} now
     */
    applyDamageFlow(world, enemy, now) {
        const c = world.character;
        const dmg = (enemy instanceof Endboss)
            ? (world.rules.bossContactDamage ?? 20)
            : (world.rules.enemyContactDamage ?? 20);
        c.applyDamage(dmg);
        world.statusBar.setPercentage(c.energy);
        if (enemy instanceof Endboss) world.lastBossHitTime = now;
        const dir = (c.x < enemy.x) ? -1 : 1;
        this.knockbackAgainstBarrels(world, dir * 40);
        c.speedY = 15;
        if (typeof c.energy === 'number' && c.energy <= 0) {
            world.gameOver = true;
            world.freezeAll();
        }
    }

    /**
     * Moves the character horizontally by dx but prevents clipping into barrels.
     * @param {object} world
     * @param {number} dx
     */
    knockbackAgainstBarrels(world, dx) {
        const c = world.character, cRect = this.rectWithOffsets(c);
        let move = dx;
        for (const b of (world.level.barrels || [])) {
            const r = this.rectWithOffsets(b);
            if (!(cRect.bottom > r.top && cRect.top < r.bottom)) continue;
            if (dx > 0 && cRect.right <= r.left) {
                move = Math.min(move, Math.max(0, (r.left - 1) - cRect.right));
            } else if (dx < 0 && cRect.left >= r.right) {
                move = Math.max(move, Math.min(0, (r.right + 1) - cRect.left));
            }
        }
        c.x += move; this.blockCharacterByBarrels(world);
    }

    /**
     * Returns the first obstacle (platform/barrel) the bottle hits, or null.
     * @param {object} world
     * @param {object} bottle
     * @returns {object|null}
     */
    bottleObstacleCollision(world, bottle) {
        const obs = [...(world.level.platforms || []), ...(world.level.barrels || [])];
        const bRect = this.rectWithOffsets(bottle);
        for (const o of obs) {
            const oRect = this.rectWithOffsets(o);
            if (this.rectsOverlap(bRect, oRect)) return o;
        }
        return null;
    }

}