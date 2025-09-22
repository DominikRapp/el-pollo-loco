/**
 * Helper for SoundManager that owns audio element pools, playback control,
 * volume/mute application, warming/preloading, and music crossfade support.
 * Methods below are short and focused for clarity.
 */
class SoundSupport {
    ctx;

    /**
     * Saves a reference to the owning SoundManager.
     * @param {SoundManager} ctx
     */
    constructor(ctx) {
        this.ctx = ctx;
    }

    /**
     * Builds audio pools for every manifest id.
     */
    createAllPools() {
        const ids = Object.keys(this.ctx.manifest || {});
        for (const id of ids) {
            const spec = this.ctx.manifest[id];
            this.createPoolFor(id, spec);
        }
    }

    /**
     * Creates a pool for a single sound id.
     * @param {string} id
     * @param {object} spec
     */
    createPoolFor(id, spec) {
        const n = Math.max(1, spec?.pool || 1);
        const list = [];
        for (let i = 0; i < n; i++) {
            list.push(this.makeAudioEntry(id, spec.src));
        }
        this.ctx.pools.set(id, list);
    }

    /**
     * Creates one audio instance entry.
     * @param {string} id
     * @param {string} src
     * @returns {{audio: HTMLAudioElement, busy: boolean, id: string}}
     */
    makeAudioEntry(id, src) {
        const a = new Audio(src);
        a.preload = 'auto';
        a.loop = false;
        a.volume = 0;
        return { audio: a, busy: false, id };
    }

    /**
     * Gets a free (or fallback) instance from the pool.
     * @param {string} id
     * @returns {object|null}
     */
    acquire(id) {
        const list = this.ctx.pools.get(id);
        if (!list || list.length === 0) return null;
        for (let i = 0; i < list.length; i++) {
            if (!list[i].busy && list[i].audio.paused) return list[i];
        }
        return list[0];
    }

    /**
     * Applies per-play options (loop/rate).
     * @param {HTMLAudioElement} a
     * @param {object} spec
     * @param {object} opts
     */
    applyPlaybackOptions(a, spec, opts) {
        a.loop = !!opts.loop && !!spec.loop;
        a.playbackRate = typeof opts.rate === 'number' ? opts.rate : 1;
    }

    /**
     * Safely resets playback head to 0.
     * @param {HTMLAudioElement} a
     */
    resetCurrentTime(a) {
        try { a.currentTime = 0; } catch { }
    }

    /**
     * Calculates effective volume with master, bus, gain, and override.
     * @param {string} id
     * @param {object} spec
     * @param {number} [gainOverride]
     * @returns {number}
     */
    effectiveVolume(id, spec, gainOverride) {
        if (this.ctx.muted === true) return 0;
        const bus = spec.bus;
        const busVol = this.clamp01(this.ctx.volumes[bus] ?? 1);
        if (busVol === 0) return 0;
        const base = typeof spec.gain === 'number' ? spec.gain : 1;
        const g = typeof gainOverride === 'number' ? gainOverride : 1;
        const v = this.ctx.master * busVol * base * g;
        return this.clamp01(v);
    }

    /**
     * Clamps a value to [0..1].
     * @param {number} x
     * @returns {number}
     */
    clamp01(x) {
        if (x < 0) return 0;
        if (x > 1) return 1;
        return x;
    }

    /**
     * Applies volume and mute flags to an element.
     * @param {HTMLAudioElement} a
     * @param {number} g
     */
    applyGainMute(a, g) {
        a.volume = g;
        a.muted = (this.ctx.muted === true) || (g === 0);
    }

    /**
     * Marks an instance busy/free.
     * @param {object} inst
     * @param {boolean} flag
     */
    markBusy(inst, flag) {
        inst.busy = !!flag;
    }

    /**
     * Clears busy flag when playback ends.
     * @param {HTMLAudioElement} a
     * @param {object} inst
     */
    attachOnEnd(a, inst) {
        const onEnd = () => {
            inst.busy = false;
            a.removeEventListener('ended', onEnd);
        };
        a.addEventListener('ended', onEnd);
    }

    /**
     * Starts playback and handles autoplay rejection.
     * @param {HTMLAudioElement} a
     * @param {object} inst
     */
    startPlayback(a, inst) {
        a.play().catch(() => { inst.busy = false; });
    }

    /**
     * Ensures a loop is running for id (reuses if active).
     * @param {string} id
     * @param {object} [opts]
     * @returns {object|undefined}
     */
    loop(id, opts = {}) {
        const spec = this.ctx.manifest[id];
        if (!spec) return;
        const existing = this.ctx.loopHold.get(id);
        if (existing && existing.audio && !existing.audio.paused) return existing;
        const inst = this.ctx.play(id, { loop: true, rate: opts.rate, gain: opts.gain });
        if (inst) this.ctx.loopHold.set(id, inst);
        return inst;
    }

    /**
     * Stops all instances for a specific id.
     * @param {string} id
     */
    stop(id) {
        const list = this.ctx.pools.get(id) || [];
        list.forEach(inst => {
            try { inst.audio.pause(); } catch { }
            try { inst.audio.currentTime = 0; } catch { }
            inst.busy = false;
        });
        this.ctx.loopHold.delete(id);
        if (this.ctx.currentMusicId === id) this.ctx.currentMusicId = null;
    }

    /**
     * Stops all sounds, optionally filtered by id prefix.
     * @param {string|null} prefix
     */
    stopAll(prefix = null) {
        const ids = prefix ? Object.keys(this.ctx.manifest).filter(k => k.startsWith(prefix)) : Object.keys(this.ctx.manifest);
        ids.forEach(id => this.stop(id));
    }

    /**
     * Recomputes and applies volumes/mutes to all active audio.
     */
    applyVolumes() {
        Object.keys(this.ctx.manifest).forEach(id => {
            const spec = this.ctx.manifest[id];
            const list = this.ctx.pools.get(id) || [];
            const g = this.effectiveVolume(id, spec, 1);
            const busVol = this.clamp01(this.ctx.volumes[spec.bus] ?? 1);
            list.forEach(inst => {
                const a = inst.audio;
                a.volume = g;
                a.muted = (this.ctx.muted === true) || (busVol === 0) || (g === 0);
            });
        });
    }

    /**
     * Applies only the global mute flag across all audio.
     */
    applyMuteState() {
        Object.keys(this.ctx.manifest).forEach(id => {
            const list = this.ctx.pools.get(id) || [];
            list.forEach(inst => {
                inst.audio.muted = this.ctx.muted === true;
            });
        });
    }

    /**
     * Warms every audio element in every pool (silent play/pause).
     */
    warmAllAudio() {
        const ids = Object.keys(this.ctx.manifest || {});
        for (const id of ids) {
            const list = this.ctx.pools.get(id) || [];
            this.warmList(list);
        }
    }

    /**
     * Warms a list of instances.
     * @param {Array} list
     */
    warmList(list) {
        for (const inst of list) {
            this.warmInstance(inst);
        }
    }

    /**
     * Warms a single instance with safe play/pause.
     * @param {object} inst
     */
    warmInstance(inst) {
        const a = inst.audio;
        const wasMuted = a.muted;
        const wasVol = a.volume;
        a.muted = true;
        try {
            const p = a.play();
            this.handlePlayResult(p, a, wasMuted, wasVol);
        } catch {
            this.restoreAudio(a, wasMuted, wasVol);
        }
    }

    /**
     * Handles async play() result for warm-up.
     * @param {Promise|undefined} p
     * @param {HTMLAudioElement} a
     * @param {boolean} wasMuted
     * @param {number} wasVol
     */
    handlePlayResult(p, a, wasMuted, wasVol) {
        if (p && typeof p.then === 'function') {
            p.then(() => this.afterPlay(a, wasMuted, wasVol))
                .catch(() => this.restoreAudio(a, wasMuted, wasVol));
        } else {
            this.afterPlay(a, wasMuted, wasVol);
        }
    }

    /**
     * Stops and resets after a successful warm-up play.
     * @param {HTMLAudioElement} a
     * @param {boolean} wasMuted
     * @param {number} wasVol
     */
    afterPlay(a, wasMuted, wasVol) {
        try { a.pause(); a.currentTime = 0; } catch { }
        this.restoreAudio(a, wasMuted, wasVol);
    }

    /**
     * Restores previous mute and volume values.
     * @param {HTMLAudioElement} a
     * @param {boolean} wasMuted
     * @param {number} wasVol
     */
    restoreAudio(a, wasMuted, wasVol) {
        a.muted = wasMuted;
        a.volume = wasVol;
    }

    /**
     * Gets the audio element for an active loop (if any).
     * @param {string} id
     * @returns {HTMLAudioElement|null}
     */
    peekLoopAudio(id) {
        const h = this.ctx.loopHold.get(id);
        return h ? h.audio : null;
    }

    /**
     * Returns a cross-bus volume scale for an id.
     * @param {string} id
     * @returns {number}
     */
    crossBusScale(id) {
        const spec = this.ctx.manifest[id];
        if (!spec) return 1;
        const bus = spec.bus;
        return this.clamp01(this.ctx.master * (this.ctx.volumes[bus] || 1) * (spec.gain || 1));
    }

    /**
     * Preloads all audio elements in the pools.
     */
    warmup() {
        for (const [id, list] of this.ctx.pools.entries()) {
            for (const inst of list) {
                const a = inst.audio;
                try { a.preload = 'auto'; a.load(); } catch { }
            }
        }
    }

    /**
     * Builds context for a music crossfade step.
     * @param {object} state
     * @returns {object}
     */
    buildFadeContext(state) {
        const nextSpec = this.ctx.manifest[state.id];
        const prevSpec = state.prev ? this.ctx.manifest[state.prev] : null;
        const nextTarget = this.effectiveVolume(state.id, nextSpec, 1);
        const prevTarget = prevSpec ? this.effectiveVolume(state.prev, prevSpec, 1) : 0;
        const nextBusZero = this.clamp01(this.ctx.volumes[nextSpec?.bus] ?? 1) === 0;
        const prevBusZero = prevSpec ? this.clamp01(this.ctx.volumes[prevSpec.bus] ?? 1) === 0 : false;
        return { ...state, nextSpec, prevSpec, nextTarget, prevTarget, nextBusZero, prevBusZero };
    }

    /**
     * Applies per-frame fade volumes.
     * @param {object} ctx
     * @param {number} t - normalized [0..1]
     */
    applyFadeVolumes(ctx, t) {
        if (ctx.aPrev) ctx.aPrev.volume = this.clamp01(ctx.prevTarget * (1 - t));
        ctx.aNext.volume = this.clamp01(ctx.nextTarget * t);
    }

    /**
     * Applies mutes during fade based on state and targets.
     * @param {object} ctx
     */
    applyFadeMutes(ctx) {
        if (ctx.aPrev) ctx.aPrev.muted = (this.ctx.muted === true) || ctx.prevBusZero || (ctx.aPrev.volume === 0);
        ctx.aNext.muted = (this.ctx.muted === true) || ctx.nextBusZero || (ctx.aNext.volume === 0);
    }

    /**
     * Finalizes a crossfade (stops prev, clears handle).
     * @param {object} ctx
     */
    finishFade(ctx) {
        if (ctx.aPrev) {
            try { ctx.aPrev.pause(); } catch { }
            try { ctx.aPrev.currentTime = 0; } catch { }
        }
        this.ctx.fadeHandle = null;
    }
}