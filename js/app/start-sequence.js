/**
 * Begins the app start sequence. Shows a splash (if present), preloads assets,
 * and transitions to the intro once the splash fades out.
 * If the splash element is missing, it immediately starts the intro.
 * @param {object} app - The game application context
 */
function startSequence(app) {
    const splashElement = document.getElementById('splash-start');
    if (!splashElement) { startIntro(app); try { preloadGameAssets(); } catch { } return; }
    showSplashElement(splashElement);
    try { preloadGameAssets(); } catch { }
    fadeOutSplashThenStart(app, splashElement);
}

/**
 * Makes the splash element visible and fully opaque.
 * @param {HTMLElement} splashElement - The splash element to show
 */
function showSplashElement(splashElement) {
    splashElement.style.display = 'block';
    splashElement.style.opacity = '1';
}

/**
 * Fades out the splash element, then starts the intro flow.
 * Uses a short delay before animating, then gradually decreases opacity
 * using requestAnimationFrame until the element is hidden.
 * @param {object} app - The game application context
 * @param {HTMLElement} splashElement - The splash element to fade out and hide
 */
function fadeOutSplashThenStart(app, splashElement) {
    let currentOpacity = 1;
    setTimeout(function () {
        function step() {
            currentOpacity -= 0.03;
            if (currentOpacity <= 0) { splashElement.style.display = 'none'; startIntro(app); return; }
            splashElement.style.opacity = String(currentOpacity);
            requestAnimationFrame(step);
        }
        step();
    }, 900);
}