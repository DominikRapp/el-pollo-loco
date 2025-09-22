/**
 * Base drawable entity with image loading, drawing, debug frame rendering,
 * and basic geometry helpers used by all game objects that appear on canvas.
 * Class fields above define default position, size, visibility, and hitbox offset.
 */
class DrawableObject {

    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 130;
    height = 150;
    width = 100;
    offset = { top: 0, left: 0, right: 0, bottom: 0 };
    visible = true;
    showFrames = false;

    /**
     * Loads a single image and sets it as the current sprite.
     * @param {string} path - Image file path.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Draws the current sprite onto the canvas if visible.
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
     */
    draw(ctx) {
        if (!this.img || !this.visible) return;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Draws debug rectangles (outer bounds and hitbox) when enabled.
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
     */
    drawFrame(ctx) {
        if (!this.showFrames) return;
        if (!this.isDebuggable()) return;
        this.drawOuterRect(ctx);
        this.drawInnerRect(ctx);
    }

    /**
     * Limits frame drawing to known gameplay objects.
     * @returns {boolean}
     */
    isDebuggable() {
        return (
            this instanceof Character ||
            this instanceof Chicken ||
            this instanceof ChickenSmall ||
            this instanceof Endboss ||
            this instanceof ThrowableObject ||
            this instanceof BottlePickup ||
            this instanceof CoinPickup ||
            this instanceof Platform ||
            this instanceof Barrel
        );
    }

    /**
     * Renders the outer object rectangle.
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
     */
    drawOuterRect(ctx) {
        ctx.beginPath();
        ctx.lineWidth = '2';
        ctx.strokeStyle = 'blue';
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }

    /**
     * Renders the inner hitbox rectangle using offsets.
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
     */
    drawInnerRect(ctx) {
        const r = this.getOffsetRect();
        ctx.beginPath();
        ctx.lineWidth = '2';
        ctx.strokeStyle = 'red';
        ctx.rect(r.x, r.y, r.w, r.h);
        ctx.stroke();
    }

    /**
     * Computes the hitbox rectangle after applying offsets.
     * @returns {{x:number,y:number,w:number,h:number}}
     */
    getOffsetRect() {
        const x = this.x + this.offset.left;
        const y = this.y + this.offset.top;
        const w = this.width - this.offset.left - this.offset.right;
        const h = this.height - this.offset.top - this.offset.bottom;
        return { x, y, w, h };
    }

    /**
     * Preloads multiple images into the cache for quick swapping.
     * @param {string[]} array - List of image paths.
     */
    loadImages(array) {
        array.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

}