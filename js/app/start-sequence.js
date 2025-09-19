function startSequence(app) {
    const splashElement = document.getElementById('splash-start');
    if (!splashElement) { startIntro(app); return; }
    showSplashElement(splashElement);
    fadeOutSplashThenStart(app, splashElement);
}

function showSplashElement(splashElement) {
    splashElement.style.display = 'block';
    splashElement.style.opacity = '1';
}

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
