/**
 * Centralized keyboard state holder for gameplay and UI.
 * Each boolean field indicates whether a control/action is currently active
 * (pressed or toggled) so other systems can poll without handling raw events here.
 */
class Keyboard {

    LEFT = false;
    RIGHT = false;
    SPACE = false;
    THROW = false;
    RESTART = false;
    LEADERBOARD = false;
    INSTRUCTIONS = false;
    SETTINGS = false;
    HOME = false;
    FULLSCREEN = false;
    MUTE = false;
}