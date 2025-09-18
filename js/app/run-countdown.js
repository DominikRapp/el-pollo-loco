function runCountdown(app, seconds, onDone) {
    if (app.cdRunning) return;
    app.cdRunning = true;
    if (app.cdTimer) {
        clearInterval(app.cdTimer);
        app.cdTimer = null;
    }

    const cd = document.getElementById('countdown');
    if (!cd) {
        app.cdRunning = false;
        if (typeof onDone === 'function') onDone();
        return;
    }

    let n = seconds;
    cd.style.display = 'flex';
    cd.textContent = String(n);

    if (window.sfx) {
        window.sfx.stop('sys.countdown.tick');
        window.sfx.play('sys.countdown.tick');
    }

    app.cdTimer = setInterval(() => {
        n -= 1;
        if (n > 0) {
            cd.textContent = String(n);
        } else {
            cd.textContent = 'Go!';
            clearInterval(app.cdTimer);
            app.cdTimer = null;
            setTimeout(() => {
                cd.style.display = 'none';
                app.cdRunning = false;
                if (typeof onDone === 'function') onDone();
            }, 600);
        }
    }, 1000);
}
