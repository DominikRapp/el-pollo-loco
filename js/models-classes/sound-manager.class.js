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
        'chicken.step': { src: 'audio/chicken/step.mp3', bus: 'characters', loop: false, gain: 0.1, pool: 3 },
        'chicken.dead': { src: 'audio/chicken/dead.mp3', bus: 'characters', loop: false, gain: 0.4, pool: 2 },
        'chicken-small.step': { src: 'audio/chicken-small/step.mp3', bus: 'characters', loop: false, gain: 0.1, pool: 3 },
        'chicken-small.dead': { src: 'audio/chicken-small/dead.mp3', bus: 'characters', loop: false, gain: 0.4, pool: 2 },
        'obj.bottle.pick': { src: 'audio/objects/bottle_pick.mp3', bus: 'objects', loop: false, gain: 0.4, pool: 3 },
        'obj.bottle.splash': { src: 'audio/objects/bottle_splash.mp3', bus: 'objects', loop: false, gain: 0.4, pool: 3 },
        'obj.coin.pick': { src: 'audio/objects/coin_pick.mp3', bus: 'objects', loop: false, gain: 0.4, pool: 5 }
    };
    pools = new Map();
    loopHold = new Map();
    currentMusicId = null;
    fadeHandle = null;

    init() {
        this.createAllPools();
        this.applyMuteState();
        this.attachMuteListener();
        this.markReady();
    }

    createAllPools() {
        const ids = Object.keys(this.manifest || {});
        for (const id of ids) {
            const spec = this.manifest[id];
            this.createPoolFor(id, spec);
        }
    }

    createPoolFor(id, spec) {
        const n = Math.max(1, spec?.pool || 1);
        const list = [];
        for (let i = 0; i < n; i++) {
            list.push(this.makeAudioEntry(id, spec.src));
        }
        this.pools.set(id, list);
    }

    makeAudioEntry(id, src) {
        const a = new Audio(src);
        a.preload = 'auto';
        a.loop = false;
        a.volume = 0;
        return { audio: a, busy: false, id };
    }

    attachMuteListener() {
        window.addEventListener('app-mute-changed', e => {
            this.setMuted(!!(e && e.detail && e.detail.muted));
        });
    }

    markReady() {
        this.ready = true;
        window.dispatchEvent(new CustomEvent('sfx-ready'));
    }

    setMuted(on) {
        this.muted = !!on;
        this.applyVolumes();
    }

    setMaster(value) {
        this.master = this.clamp01(value);
        this.applyVolumes();
    }

    setBusVolume(bus, value) {
        if (!this.volumes.hasOwnProperty(bus)) return;
        this.volumes[bus] = this.clamp01(value);
        this.applyVolumes();
    }

    play(id, opts = {}) {
        const spec = this.manifest[id];
        if (!spec) return;
        const inst = this.acquire(id);
        if (!inst) return;
        const a = inst.audio;
        this.applyPlaybackOptions(a, spec, opts);
        this.resetCurrentTime(a);
        const g = this.effectiveVolume(id, spec, opts.gain);
        this.applyGainMute(a, g);
        this.markBusy(inst, true);
        this.attachOnEnd(a, inst);
        this.startPlayback(a, inst);
        return inst;
    }

    applyPlaybackOptions(a, spec, opts) {
        a.loop = !!opts.loop && !!spec.loop;
        a.playbackRate = typeof opts.rate === 'number' ? opts.rate : 1;
    }

    resetCurrentTime(a) {
        try { a.currentTime = 0; } catch { }
    }

    applyGainMute(a, g) {
        a.volume = g;
        a.muted = (this.muted === true) || (g === 0);
    }

    markBusy(inst, flag) {
        inst.busy = !!flag;
    }

    attachOnEnd(a, inst) {
        const onEnd = () => {
            inst.busy = false;
            a.removeEventListener('ended', onEnd);
        };
        a.addEventListener('ended', onEnd);
    }

    startPlayback(a, inst) {
        a.play().catch(() => { inst.busy = false; });
    }

    loop(id, opts = {}) {
        const spec = this.manifest[id];
        if (!spec) return;
        const existing = this.loopHold.get(id);
        if (existing && existing.audio && !existing.audio.paused) return existing;
        const inst = this.play(id, { loop: true, rate: opts.rate, gain: opts.gain });
        if (inst) this.loopHold.set(id, inst);
        return inst;
    }

    stop(id) {
        const list = this.pools.get(id) || [];
        list.forEach(inst => {
            try { inst.audio.pause(); } catch { }
            try { inst.audio.currentTime = 0; } catch { }
            inst.busy = false;
        });
        this.loopHold.delete(id);
        if (this.currentMusicId === id) this.currentMusicId = null;
    }

    stopAll(prefix = null) {
        const ids = prefix ? Object.keys(this.manifest).filter(k => k.startsWith(prefix)) : Object.keys(this.manifest);
        ids.forEach(id => this.stop(id));
    }

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

    stopOtherMusic(prev, id) {
        const ids = Object.keys(this.manifest).filter(k => k.startsWith('music.'));
        for (const mid of ids) {
            if (mid !== prev && mid !== id) this.stop(mid);
        }
    }

    getPrevNextAudio(prev, id) {
        const aPrev = prev ? this.peekLoopAudio(prev) : null;
        const instNext = this.loop(id);
        const aNext = instNext ? instNext.audio : null;
        return { aPrev, aNext };
    }

    stepCrossfade(state, now) {
        const t = this.clamp01((now - state.t0) / state.dur);
        const ctx = this.buildFadeContext(state);
        this.applyFadeVolumes(ctx, t);
        this.applyFadeMutes(ctx);
        if (t < 1) {
            this.fadeHandle = requestAnimationFrame(ts => this.stepCrossfade(state, ts));
        } else {
            this.finishFade(ctx);
        }
    }

    buildFadeContext(state) {
        const nextSpec = this.manifest[state.id];
        const prevSpec = state.prev ? this.manifest[state.prev] : null;
        const nextTarget = this.effectiveVolume(state.id, nextSpec, 1);
        const prevTarget = prevSpec ? this.effectiveVolume(state.prev, prevSpec, 1) : 0;
        const nextBusZero = this.clamp01(this.volumes[nextSpec?.bus] ?? 1) === 0;
        const prevBusZero = prevSpec ? this.clamp01(this.volumes[prevSpec.bus] ?? 1) === 0 : false;
        return { ...state, nextSpec, prevSpec, nextTarget, prevTarget, nextBusZero, prevBusZero };
    }

    applyFadeVolumes(ctx, t) {
        if (ctx.aPrev) ctx.aPrev.volume = this.clamp01(ctx.prevTarget * (1 - t));
        ctx.aNext.volume = this.clamp01(ctx.nextTarget * t);
    }

    applyFadeMutes(ctx) {
        if (ctx.aPrev) ctx.aPrev.muted = (this.muted === true) || ctx.prevBusZero || (ctx.aPrev.volume === 0);
        ctx.aNext.muted = (this.muted === true) || ctx.nextBusZero || (ctx.aNext.volume === 0);
    }

    finishFade(ctx) {
        if (ctx.aPrev) {
            try { ctx.aPrev.pause(); } catch { }
            try { ctx.aPrev.currentTime = 0; } catch { }
        }
        this.fadeHandle = null;
    }

    acquire(id) {
        const list = this.pools.get(id);
        if (!list || list.length === 0) return null;
        for (let i = 0; i < list.length; i++) {
            if (!list[i].busy && list[i].audio.paused) return list[i];
        }
        return list[0];
    }

    effectiveVolume(id, spec, gainOverride) {
        if (this.muted === true) return 0;
        const bus = spec.bus;
        const busVol = this.clamp01(this.volumes[bus] ?? 1);
        if (busVol === 0) return 0;
        const base = typeof spec.gain === 'number' ? spec.gain : 1;
        const g = typeof gainOverride === 'number' ? gainOverride : 1;
        const v = this.master * busVol * base * g;
        return this.clamp01(v);
    }

    applyVolumes() {
        Object.keys(this.manifest).forEach(id => {
            const spec = this.manifest[id];
            const list = this.pools.get(id) || [];
            const g = this.effectiveVolume(id, spec, 1);
            const busVol = this.clamp01(this.volumes[spec.bus] ?? 1);
            list.forEach(inst => {
                const a = inst.audio;
                a.volume = g;
                a.muted = (this.muted === true) || (busVol === 0) || (g === 0);
            });
        });
    }

    applyMuteState() {
        Object.keys(this.manifest).forEach(id => {
            const list = this.pools.get(id) || [];
            list.forEach(inst => {
                inst.audio.muted = this.muted === true;
            });
        });
    }

    unlock() {
        if (this.unlocked) return;
        this.unlocked = true;
        this.warmAllAudio();
    }

    warmAllAudio() {
        const ids = Object.keys(this.manifest || {});
        for (const id of ids) {
            const list = this.pools.get(id) || [];
            this.warmList(list);
        }
    }

    warmList(list) {
        for (const inst of list) {
            this.warmInstance(inst);
        }
    }

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

    handlePlayResult(p, a, wasMuted, wasVol) {
        if (p && typeof p.then === 'function') {
            p.then(() => this.afterPlay(a, wasMuted, wasVol))
                .catch(() => this.restoreAudio(a, wasMuted, wasVol));
        } else {
            this.afterPlay(a, wasMuted, wasVol);
        }
    }

    afterPlay(a, wasMuted, wasVol) {
        try { a.pause(); a.currentTime = 0; } catch { }
        this.restoreAudio(a, wasMuted, wasVol);
    }

    restoreAudio(a, wasMuted, wasVol) {
        a.muted = wasMuted;
        a.volume = wasVol;
    }

    peekLoopAudio(id) {
        const h = this.loopHold.get(id);
        return h ? h.audio : null;
    }

    crossBusScale(id) {
        const spec = this.manifest[id];
        if (!spec) return 1;
        const bus = spec.bus;
        return this.clamp01(this.master * (this.volumes[bus] || 1) * (spec.gain || 1));
    }

    clamp01(x) {
        if (x < 0) return 0;
        if (x > 1) return 1;
        return x;
    }
}
