let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);

    console.log('My Character is', world.character);


}

document.addEventListener("keydown", (event) => {
console.log(event.keyCode);

    if(event.keyCode == 87) {
        keyboard.UP = true;
    }

    if(event.keyCode == 65) {
        keyboard.LEFT = true;
    }

    if(event.keyCode == 83) {
        keyboard.DOWN = true;
    }

    if(event.keyCode == 68) {
        keyboard.RIGHT = true;
    }

    if(event.keyCode == 32) {
        keyboard.SPACE = true;
    }

    if(event.keyCode == 69) {
        keyboard.THROW = true;
    }
    
});

document.addEventListener("keyup", (event) => {

    if(event.keyCode == 87) {
        keyboard.UP = false;
    }

    if(event.keyCode == 65) {
        keyboard.LEFT = false;
    }

    if(event.keyCode == 83) {
        keyboard.DOWN = false;
    }

    if(event.keyCode == 68) {
        keyboard.RIGHT = false;
    }

    if(event.keyCode == 32) {
        keyboard.SPACE = false;
    }

    if(event.keyCode == 69) {
        keyboard.THROW = false;
    }
    
});