/**
 * Preloads overlay images (win/lose) into the browser cache.
 * Falls getUiPaths existiert, wird es genutzt, sonst Fallback-Pfade.
 * @returns {void}
 */
function preloadOverlayImages() {
  const fallback = [
    'img/You won, you lost/Game over A.png',
    'img/You won, you lost/You Win A.png'
  ];
  const sources = (typeof getUiPaths === 'function') ? getUiPaths() : fallback;
  sources.forEach(src => { const img = new Image(); img.decoding = 'async'; img.src = src; });
}
preloadOverlayImages();