class Chicken extends BaseChicken {
    constructor(x, options = {}) {
        super({
            x,
            width: 100,
            height: 100,
            speed: 0.6,
            offset: { top: 5, left: 3, right: 5, bottom: 0 },
            walkImages: [
                'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
                'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
                'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
            ],
            deadImage: 'img/3_enemies_chicken/chicken_normal/2_dead/dead.png',
            patrol: options.patrol
        });
    }
}