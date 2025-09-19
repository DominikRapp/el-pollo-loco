class WorldItems {

    checkThrowableObjects(world) {
        const now = Date.now();
        const bossBottleDamage = world.rules.bossBottleDamage ?? 100;
        this.handleThrowInput(world, now);
        this.updateBottleCollisions(world, bossBottleDamage);
    }

    handleThrowInput(world, now) {
        const k = world.keyboard;
        const c = world.character;
        if (!(k.THROW && (now - world.lastThrowTime) >= world.throwCooldown && world.bottleCount > 0 && c.canControl)) return;
        let direction = 1;
        let offsetX = Math.round(c.width * 0.66);
        if (c.otherDirection) { direction = -1; offsetX = Math.round(-c.width * 0.13); }
        const startX = c.x + offsetX;
        const startY = Math.round(c.y + c.height * 0.45);
        const bottle = new ThrowableObject(startX, startY, direction);
        world.throwableObjects.push(bottle);
        world.bottleCount--;
        const percent = (world.bottleCount / world.bottleMax) * 100;
        world.bottleBar.setPercentage(percent);
        world.lastThrowTime = now;
        if (window.sfx) window.sfx.play('character.throw');
    }

    updateBottleCollisions(world, dmg) {
        const bottles = world.throwableObjects || [];
        const enemies = world.level.enemies || [];
        for (const bottle of bottles) {
            if (bottle.isSplashing) continue;
            for (const enemy of enemies) {
                if (!bottle.isSplashing && bottle.isColliding(enemy)) {
                    this.onBottleHit(world, bottle, enemy, dmg);
                }
            }
        }
    }

    onBottleHit(world, bottle, enemy, dmg) {
        if (enemy instanceof Endboss && !enemy.isDead()) {
            const wasAlive = !enemy.isDead();
            enemy.hit(dmg);
            if (wasAlive && enemy.isDead() && !world.bossDefeated) {
                world.stats.boss = 1;
                world.bossDefeated = true;
            }
            if (world.bossBar) {
                const value = enemy.isDead() ? 0 : enemy.energy;
                world.bossBar.setPercentage(value);
            }
        }
        bottle.splash();
    }

    spawnGroundBottles(world) {
        const img1 = 'img/6_salsa_bottle/1_salsa_bottle_on_ground.png';
        const img2 = 'img/6_salsa_bottle/2_salsa_bottle_on_ground.png';
        world.groundBottles = [
            new BottlePickup(img1, 450),
            new BottlePickup(img1, 900),
            new BottlePickup(img1, 1350),
            new BottlePickup(img2, 1750),
            new BottlePickup(img2, 2050)
        ];
    }

    checkBottlePickups(world) {
        world.groundBottles = world.groundBottles.filter((pickup) => {
            const collides = world.character.isColliding(pickup);
            if (!collides) return true;
            if (world.bottleCount < world.bottleMax) {
                world.bottleCount++;
                world.stats.bottle = (world.stats.bottle || 0) + 1;
                const percent = (world.bottleCount / world.bottleMax) * 100;
                world.bottleBar.setPercentage(percent);
                if (window.sfx) window.sfx.play('obj.bottle.pick');
                return false;
            } else {
                return true;
            }
        });
    }

    spawnCoins(world) {
        world.coinPickups = [
            new CoinPickup(520),
            new CoinPickup(780),
            new CoinPickup(1120),
            new CoinPickup(1600),
            new CoinPickup(1980)
        ];
    }

    checkCoinPickups(world) {
        const heal = this.getCoinHeal(world);
        const list = world.coinPickups || [];
        world.coinPickups = list.filter(p => this.keepOrConsumeCoin(world, p, heal));
    }

    getCoinHeal(world) {
        const v = world?.rules?.coinHeal;
        return (typeof v === 'number') ? v : 20;
    }

    keepOrConsumeCoin(world, coin, heal) {
        if (!world.character.isColliding(coin)) return true;
        if (world.coinCount >= world.coinMax) return true;
        this.consumeCoin(world, heal);
        if (window.sfx) window.sfx.play('obj.coin.pick');
        return false;
    }

    consumeCoin(world, heal) {
        world.coinCount++;
        world.stats.coin = (world.stats.coin || 0) + 1;
        const percent = (world.coinCount / world.coinMax) * 100;
        world.coinBar.setPercentage(percent);
        const cur = world.character.energy;
        const next = Math.min(100, cur + heal);
        if (next !== cur) {
            world.character.energy = next;
            world.statusBar.setPercentage(world.character.energy);
        }
    }

}
