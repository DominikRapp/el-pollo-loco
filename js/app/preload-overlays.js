/**
 * Immediately preloads overlay images (win/lose) into the browser cache.
 * Uses HTMLImageElement to hint the browser to fetch these assets early.
 * @function preloadOverlays
 * @returns {void}
 */
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