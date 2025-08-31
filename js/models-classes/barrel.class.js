class Barrel extends DrawableObject {
    
    width = 110;
    height = 140;
    offset = { top: 6, left: 10, right: 10, bottom: 0 };
    groundBottomY = 630;

    constructor(x) {
        super().loadImage('img/10_fix_objects/barrel.png');
        this.x = x;
        this.y = this.groundBottomY - this.height;
    }
}