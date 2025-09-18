function startSequence(app) {
    const splash = document.getElementById('splash-start');
    if (!splash) {
        startIntro(app);
        return;
    }
    splash.style.display = 'block';
    splash.style.opacity = '1';
    let opacity = 1;
    setTimeout(() => {
        const fade = () => {
            opacity -= 0.03;
            if (opacity <= 0) {
                splash.style.display = 'none';
                startIntro(app);
                return;
            }
            splash.style.opacity = String(opacity);
            requestAnimationFrame(fade);
        };
        fade();
    }, 900);
}
