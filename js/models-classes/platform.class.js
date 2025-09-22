/**
 * Tiled platform made of multiple image segments drawn side by side.
 * Class fields above define the segment sprite paths, default segment/total size,
 * and the hitbox offset used for collisions.
 */
class Platform extends DrawableObject {

    segments = [
        'img/10_fix_objects/platform_set/platform1.png',
        'img/10_fix_objects/platform_set/platform2.png',
        'img/10_fix_objects/platform_set/platform3.png',
        'img/10_fix_objects/platform_set/platform4.png',
        'img/10_fix_objects/platform_set/platform5.png'
    ];

    segmentWidth = 216;
    width = 216 * 5;
    height = 80;
    offset = { top: 0, left: 0, right: 0, bottom: 0 };

    /**
     * Creates a platform at (x, y) with configurable segment width and height.
     * Total width is computed as segmentWidth * number of segments.
     * @param {number} x - Left position of the platform.
     * @param {number} y - Top position of the platform.
     * @param {number} [segmentWidth=216] - Width of each segment when drawn.
     * @param {number} [height=80] - Height of the platform when drawn.
     */
    constructor(x, y, segmentWidth = 216, height = 80) {
        super();
        this.segmentWidth = segmentWidth;
        this.width = this.segmentWidth * this.segments.length;
        this.height = height;
        this.x = x;
        this.y = y;
        this.loadImages(this.segments);
    }

    /**
     * Draws each platform segment in sequence across the total width.
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
     */
    draw(ctx) {
        let drawX = this.x;
        for (let i = 0; i < this.segments.length; i++) {
            const path = this.segments[i];
            const img = this.imageCache[path];
            if (img) ctx.drawImage(img, drawX, this.y, this.segmentWidth, this.height);
            drawX += this.segmentWidth;
        }
    }
}