let __assetsPreloaded = false;

/**
 * Preloads core game assets (images) and warms up the SFX system once.
 * Subsequent calls resolve immediately without doing any extra work.
 * - Loads a fixed set of image URLs using HTMLImageElement.decode() when available.
 * - Calls window.sfx.warmup() if present to prime audio playback.
 * @returns {Promise<void>} Resolves when all images have been queued/decoded and SFX warmup (if any) completed
 */
function preloadGameAssets() {
    if (__assetsPreloaded) return Promise.resolve();
    __assetsPreloaded = true;
    const p = ['img/You won, you lost/Game over A.png', 'img/You won, you lost/You Win A.png', 'img/2_character_pepe/2_walk/W-21.png', 'img/2_character_pepe/2_walk/W-22.png', 'img/2_character_pepe/2_walk/W-23.png', 'img/2_character_pepe/2_walk/W-24.png', 'img/2_character_pepe/2_walk/W-25.png', 'img/2_character_pepe/2_walk/W-26.png', 'img/2_character_pepe/3_jump/J-31.png', 'img/2_character_pepe/3_jump/J-32.png', 'img/2_character_pepe/3_jump/J-33.png', 'img/2_character_pepe/3_jump/J-34.png', 'img/2_character_pepe/3_jump/J-35.png', 'img/2_character_pepe/3_jump/J-36.png', 'img/2_character_pepe/3_jump/J-37.png', 'img/2_character_pepe/3_jump/J-38.png', 'img/2_character_pepe/3_jump/J-39.png', 'img/2_character_pepe/1_idle/idle/I-1.png', 'img/2_character_pepe/1_idle/idle/I-2.png', 'img/2_character_pepe/1_idle/idle/I-3.png', 'img/2_character_pepe/1_idle/idle/I-4.png', 'img/2_character_pepe/1_idle/idle/I-5.png', 'img/2_character_pepe/1_idle/idle/I-6.png', 'img/2_character_pepe/1_idle/idle/I-7.png', 'img/2_character_pepe/1_idle/idle/I-8.png', 'img/2_character_pepe/1_idle/idle/I-9.png', 'img/2_character_pepe/1_idle/idle/I-10.png', 'img/5_background/layers/air.png', 'img/5_background/layers/1_first_layer/1.png', 'img/5_background/layers/1_first_layer/2.png', 'img/5_background/layers/2_second_layer/1.png', 'img/5_background/layers/2_second_layer/2.png', 'img/5_background/layers/3_third_layer/1.png', 'img/5_background/layers/3_third_layer/2.png', 'img/6_salsa_bottle/salsa_bottle.png', 'img/8_coin/coin_1.png', 'img/8_coin/coin_2.png'];
    const imgs = p.map(src => { const img = new Image(); img.decoding = 'async'; img.src = src; return img.decode ? img.decode().catch(() => { }) : Promise.resolve(); });
    const s = window.sfx;
    const a = (!s || typeof s.warmup !== 'function') ? Promise.resolve() : (() => { try { s.warmup(); } catch { } return Promise.resolve(); })();
    return Promise.all([...imgs, a]).then(() => { });
}