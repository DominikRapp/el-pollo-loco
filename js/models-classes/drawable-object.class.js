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

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    draw(ctx) {
        if (!this.img || !this.visible) return;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    drawFrame(ctx) {
        if (!this.showFrames) return;
        if (!this.isDebuggable()) return;
        this.drawOuterRect(ctx);
        this.drawInnerRect(ctx);
    }

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

    drawOuterRect(ctx) {
        ctx.beginPath();
        ctx.lineWidth = '2';
        ctx.strokeStyle = 'blue';
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }

    drawInnerRect(ctx) {
        const r = this.getOffsetRect();
        ctx.beginPath();
        ctx.lineWidth = '2';
        ctx.strokeStyle = 'red';
        ctx.rect(r.x, r.y, r.w, r.h);
        ctx.stroke();
    }

    getOffsetRect() {
        const x = this.x + this.offset.left;
        const y = this.y + this.offset.top;
        const w = this.width - this.offset.left - this.offset.right;
        const h = this.height - this.offset.top - this.offset.bottom;
        return { x, y, w, h };
    }

    loadImages(array) {
        array.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

}