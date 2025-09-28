/**
 * Normal chicken enemy with preset size, speed, offsets, frames, and optional patrol.
 * Extends BaseChicken and forwards configuration to the base class.
 */
class Chicken extends BaseChicken {
    /**
     * Creates a normal chicken at a given X, with optional patrol bounds.
     * @param {number} x - Horizontal start position
     * @param {{ patrol?: [number, number] }} [options={}]
     */
    constructor(x, options = {}) {
        super(makeChickenConfig(x, options));
    }
}

/**
 * Builds the configuration object for a normal chicken.
 * @param {number} x - Horizontal start position
 * @param {{ patrol?: [number, number] }} [options={}]
 * @returns {object}
 */
function makeChickenConfig(x, options = {}) {
    return {
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
    };
}