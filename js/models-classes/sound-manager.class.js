/**
 * Central audio manager: loads/controls sound pools, applies master/bus volumes,
 * handles mute state, one-shot playback, loops, and crossfading between music tracks.
 * Class fields above hold defaults, manifest entries, and internal state.
 */
class SoundManager {
    master = 0.1;
    volumes = { music: 0.1, system: 0.1, characters: 0.1, objects: 0.1 };
    muted = false;
    manifest = {
        'music.menu.loop': { src: 'audio/music/menu_loop.mp3', bus: 'music', loop: true, gain: 0.4, pool: 1 },
        'music.level.loop': { src: 'audio/music/level_loop.mp3', bus: 'music', loop: true, gain: 0.2, pool: 1 },
        'music.boss.loop': { src: 'audio/music/boss_loop.mp3', bus: 'music', loop: true, gain: 0.2, pool: 1 },
        'music.intro': { src: 'audio/music/intro.mp3', bus: 'music', loop: false, gain: 0.8, pool: 1 },
        'sys.countdown.tick': { src: 'audio/system/countdown_tick.mp3', bus: 'system', loop: false, gain: 0.4, pool: 1 },
        'sys.gameover.sting': { src: 'audio/system/gameover_sting.mp3', bus: 'system', loop: false, gain: 0.4, pool: 2 },
        'sys.win.sting': { src: 'audio/system/win_sting.mp3', bus: 'system', loop: false, gain: 0.4, pool: 2 },
        'character.step': { src: 'audio/character/step_01.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 3 },
        'character.jump': { src: 'audio/character/jump.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 2 },
        'character.throw': { src: 'audio/character/throw.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 2 },
        'character.hit': { src: 'audio/character/hit.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 2 },
        'character.snore.loop': { src: 'audio/character/snore_loop.mp3', bus: 'characters', loop: true, gain: 1.0, pool: 1 },
        'character.dead': { src: 'audio/character/dead.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 1 },
        'boss.alert': { src: 'audio/boss/alert.mp3', bus: 'characters', loop: false, gain: 0.4, pool: 1 },
        'boss.attack': { src: 'audio/boss/attack.mp3', bus: 'characters', loop: false, gain: 0.4, pool: 2 },
        'boss.step': { src: 'audio/boss/step.mp3', bus: 'characters', loop: false, gain: 0.4, pool: 3 },
        'boss.hit': { src: 'audio/boss/hit.mp3', bus: 'characters', loop: false, gain: 0.4, pool: 2 },
        'boss.dead': { src: 'audio/boss/dead.mp3', bus: 'characters', loop: false, gain: 0.4, pool: 1 },
        'chicken.step': { src: 'audio/chicken/step.mp3', bus: 'characters', loop: false, gain: 0.05, pool: 3 },
        'chicken.dead': { src: 'audio/chicken/dead.mp3', bus: 'characters', loop: false, gain: 0.4, pool: 2 },
        'chicken-small.step': { src: 'audio/chicken-small/step.mp3', bus: 'characters', loop: false, gain: 0.05, pool: 3 },
        'chicken-small.dead': { src: 'audio/chicken-small/dead.mp3', bus: 'characters', loop: false, gain: 0.4, pool: 2 },
        'obj.bottle.pick': { src: 'audio/objects/bottle_pick.mp3', bus: 'objects', loop: false, gain: 0.4, pool: 3 },
        'obj.bottle.splash': { src: 'audio/objects/bottle_splash.mp3', bus: 'objects', loop: false, gain: 0.4, pool: 3 },
        'obj.coin.pick': { src: 'audio/objects/coin_pick.mp3', bus: 'objects', loop: false, gain: 0.4, pool: 5 }
    };
    pools = new Map();
    loopHold = new Map();
    currentMusicId = null;
    fadeHandle = null;
    ready = false;
    support = null;

    /**
     * Builds audio pools, applies mute state, and signals readiness.
     */
    init() {
        this.support = new SoundSupport(this);
        this.support.createAllPools();
        this.support.applyMuteState();
        this.attachMuteListener();
        this.markReady();
    }

    /**
     * Subscribes to a custom mute event from the app shell.
     */
    attachMuteListener() {
        window.addEventListener('app-mute-changed', e => {
            this.setMuted(!!(e && e.detail && e.detail.muted));
        });
    }

    /**
     * Marks the system ready and emits a 'sfx-ready' event.
     */
    markReady() {
        this.ready = true;
        window.dispatchEvent(new CustomEvent('sfx-ready'));
    }

    /**
     * Toggles global mute and reapplies volumes.
     * @param {boolean} on
     */
    setMuted(on) {
        this.muted = !!on;
        this.support.applyVolumes();
    }

    /**
     * Sets master volume [0..1] and reapplies volumes.
     * @param {number} value
     */
    setMaster(value) {
        this.master = this.support.clamp01(value);
        this.support.applyVolumes();
    }

    /**
     * Sets per-bus volume [0..1] and reapplies volumes.
     * @param {'music'|'system'|'characters'|'objects'} bus
     * @param {number} value
     */
    setBusVolume(bus, value) {
        if (!this.volumes.hasOwnProperty(bus)) return;
        this.volumes[bus] = this.support.clamp01(value);
        this.support.applyVolumes();
    }

    /**
     * Plays a one-shot sound by id.
     * @param {string} id - Key from the manifest
     * @param {object} [opts]
     * @param {number} [opts.gain] - Extra gain multiplier
     * @param {number} [opts.rate] - Playback rate
     * @param {boolean} [opts.loop] - Force loop override
     * @returns {object|undefined} instance handle or undefined if unavailable
     */
    play(id, opts = {}) {
        const spec = this.manifest[id];
        if (!spec) return;
        const inst = this.support.acquire(id);
        if (!inst) return;
        const a = inst.audio;
        this.support.applyPlaybackOptions(a, spec, opts);
        this.support.resetCurrentTime(a);
        const g = this.support.effectiveVolume(id, spec, opts.gain);
        this.support.applyGainMute(a, g);
        this.support.markBusy(inst, true);
        this.support.attachOnEnd(a, inst);
        this.support.startPlayback(a, inst);
        return inst;
    }

    /**
     * Starts (or resumes) a looping sound and keeps a reference.
     * @param {string} id
     * @param {object} [opts]
     * @returns {object|undefined} loop instance
     */
    loop(id, opts = {}) {
        return this.support.loop(id, opts);
    }

    /**
     * Stops a specific sound (all instances for that id).
     * @param {string} id
     */
    stop(id) {
        this.support.stop(id);
    }

    /**
     * Stops all sounds, optionally only those whose id starts with a prefix.
     * @param {string|null} [prefix]
     */
    stopAll(prefix = null) {
        this.support.stopAll(prefix);
    }

    /**
     * Crossfades from current music track to another.
     * @param {string} id - Target music id
     * @param {number} [fadeMs=400] - Fade duration in ms
     */
    musicTo(id, fadeMs = 400) {
        if (this.currentMusicId === id) return;
        const prev = this.currentMusicId;
        this.currentMusicId = id;
        if (this.fadeHandle) cancelAnimationFrame(this.fadeHandle);
        this.stopOtherMusic(prev, id);
        const { aPrev, aNext } = this.getPrevNextAudio(prev, id);
        if (!aNext) return;
        aNext.volume = 0;
        const state = { aPrev, aNext, id, prev, t0: performance.now(), dur: Math.max(1, fadeMs) };
        this.fadeHandle = requestAnimationFrame(ts => this.stepCrossfade(state, ts));
    }

    /**
     * Ensures unrelated music ids are fully stopped.
     * @param {string|null} prev
     * @param {string} id
     */
    stopOtherMusic(prev, id) {
        const ids = Object.keys(this.manifest).filter(k => k.startsWith('music.'));
        for (const mid of ids) {
            if (mid !== prev && mid !== id) this.stop(mid);
        }
    }

    /**
     * Retrieves audio elements for previous and next tracks.
     * @param {string|null} prev
     * @param {string} id
     * @returns {{aPrev: HTMLAudioElement|null, aNext: HTMLAudioElement|null}}
     */
    getPrevNextAudio(prev, id) {
        const aPrev = prev ? this.support.peekLoopAudio(prev) : null;
        const instNext = this.loop(id);
        const aNext = instNext ? instNext.audio : null;
        return { aPrev, aNext };
    }

    /**
     * Performs one crossfade animation step.
     * @param {object} state
     * @param {number} now
     */
    stepCrossfade(state, now) {
        const t = this.support.clamp01((now - state.t0) / state.dur);
        const ctx = this.support.buildFadeContext(state);
        this.support.applyFadeVolumes(ctx, t);
        this.support.applyFadeMutes(ctx);
        if (t < 1) {
            this.fadeHandle = requestAnimationFrame(ts => this.stepCrossfade(state, ts));
        } else {
            this.support.finishFade(ctx);
        }
    }

    /**
     * Reapplies computed volumes to all active audio.
     */
    applyVolumes() {
        this.support.applyVolumes();
    }

    /**
     * Reapplies mute state to all active audio.
     */
    applyMuteState() {
        this.support.applyMuteState();
    }

    /**
     * Unlocks audio on first user gesture and pre-warms buffers.
     */
    unlock() {
        if (this.unlocked) return;
        this.unlocked = true;
        this.support.warmAllAudio();
    }

    /**
     * Prepares pools or decodes sounds ahead of time.
     */
    warmup() {
        this.support.warmup();
    }

    /**
     * Returns cross-bus scaling factor for a sound id.
     * @param {string} id
     * @returns {number}
     */
    crossBusScale(id) {
        return this.support.crossBusScale(id);
    }
}