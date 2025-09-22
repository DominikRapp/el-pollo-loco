/**
 * Enum-like object representing the possible game states.
 * @readonly
 * @enum {string}
 */
const GameState = {
    /** Intro sequence before menu */
    INTRO: 'INTRO',

    /** Main menu screen */
    MENU: 'MENU',

    /** Active gameplay state */
    GAME: 'GAME',

    /** Game over screen */
    GAMEOVER: 'GAMEOVER',

    /** Victory screen */
    VICTORY: 'VICTORY'
};