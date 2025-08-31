let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard, level1); // level1 kann durch 2 - 5 ersetzt werden um momentan die level durchzusehen und anzupassen
}

document.addEventListener("keydown", (event) => {

    if (event.keyCode == 65) {
        keyboard.LEFT = true;
    }

    if (event.keyCode == 68) {
        keyboard.RIGHT = true;
    }

    if (event.keyCode == 32) {
        keyboard.SPACE = true;
    }

    if (event.keyCode == 83) {
        keyboard.THROW = true;
    }

    if (event.keyCode == 82) {
        keyboard.RESTART = true;
    }

});

document.addEventListener("keyup", (event) => {

    if (event.keyCode == 65) {
        keyboard.LEFT = false;
    }

    if (event.keyCode == 68) {
        keyboard.RIGHT = false;
    }

    if (event.keyCode == 32) {
        keyboard.SPACE = false;
    }

    if (event.keyCode == 83) {
        keyboard.THROW = false;
    }

    if (event.keyCode == 82) {
        keyboard.RESTART = false;
    }

});