/**
 * Small chicken enemy with preset size, speed, offsets, walk/dead frames, and optional patrol.
 * Extends BaseChicken and forwards configuration to the base class.
 */
class ChickenSmall extends BaseChicken {

    /**
     * Creates a small chicken at a given X, with optional Y and patrol bounds.
     * @param {number} x - Horizontal start position
     * @param {{ y?: number, patrol?: [number, number] }} [options={}] - Optional vertical position and patrol range
     */
    constructor(x, options = {}) {
        super({
            x,
            y: options.y,
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