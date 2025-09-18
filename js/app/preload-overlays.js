(function preloadOverlays() {
    const sources = [
        'img/You won, you lost/Game over A.png',
        'img/You won, you lost/You Win A.png'
    ];
    for (const src of sources) {
        const img = new Image();
        img.src = src;
    }
})();