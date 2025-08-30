class ChickenSmall extends BaseChicken {

    constructor(x, options = {}) {
        super({
            x,
            width: 70,
            height: 70,
            speed: 0.8,
            offset: { top: 6, left: 6, right: 6, bottom: 8 },
            walkImages: [
                'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
                'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
                'img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
            ],
            deadImage: 'img/3_enemies_chicken/chicken_small/2_dead/dead.png',
            patrol: options.patrol
        });
    }
}