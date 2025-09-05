class SoundManager {
    master = 0.1;
    volumes = { music: 0.1, system: 0.1, characters: 0.1, objects: 0.1 };
    muted = false;
    manifest = {
        'music.menu.loop': { src: 'audio/music/menu_loop.mp3', bus: 'music', loop: true, gain: 0.4, pool: 1 },
        'music.level.loop': { src: 'audio/music/level_loop.mp3', bus: 'music', loop: true, gain: 0.4, pool: 1 },
        'music.boss.loop': { src: 'audio/music/boss_loop.mp3', bus: 'music', loop: true, gain: 0.4, pool: 1 },
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

        'boss.alert': { src: 'audio/boss/alert.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 1 },
        'boss.attack': { src: 'audio/boss/attack.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 2 },
        'boss.step': { src: 'audio/boss/step.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 3 },
        'boss.hit': { src: 'audio/boss/hit.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 2 },
        'boss.dead': { src: 'audio/boss/dead.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 1 },

        'chicken.step': { src: 'audio/chicken/step.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 3 },
        'chicken.dead': { src: 'audio/chicken/dead.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 2 },

        'chicken-small.step': { src: 'audio/chicken-small/step.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 3 },
        'chicken-small.dead': { src: 'audio/chicken-small/dead.mp3', bus: 'characters', loop: false, gain: 1.0, pool: 2 },

        'obj.bottle.pick': { src: 'audio/objects/bottle_pick.mp3', bus: 'objects', loop: false, gain: 1.0, pool: 3 },
        'obj.bottle.splash': { src: 'audio/objects/bottle_splash.mp3', bus: 'objects', loop: false, gain: 1.0, pool: 3 },
        'obj.coin.pick': { src: 'audio/objects/coin_pick.mp3', bus: 'objects', loop: false, gain: 1.0, pool: 5 }

    };
    pools = new Map();
    loopHold = new Map();
    currentMusicId = null;
    fadeHandle = null;

    init() {
        Object.keys(this.manifest).forEach(id => {
            const spec = this.manifest[id];
            const n = Math.max(1, spec.pool || 1);
            const list = [];
            for (let i = 0; i < n; i++) {
                const a = new Audio(spec.src);
                a.preload = 'auto';
                a.loop = false;
                a.volume = 0;
                list.push({ audio: a, busy: false, id });
            }
            this.pools.set(id, list);
        });
        this.applyMuteState();
        window.addEventListener('app-mute-changed', e => this.setMuted(!!(e && e.detail && e.detail.muted)));
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
        a.loop = !!opts.loop && !!spec.loop;
        a.playbackRate = typeof opts.rate === 'number' ? opts.rate : 1;
        try { a.currentTime = 0; } catch { }
        const g = this.effectiveVolume(id, spec, opts.gain);
        a.volume = g;
        a.muted = (this.muted === true) || (g === 0);
        inst.busy = true;
        const onEnd = () => { inst.busy = false; a.removeEventListener('ended', onEnd); };
        a.addEventListener('ended', onEnd);
        a.play().catch(() => { inst.busy = false; });
        return inst;
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

        const musicIds = Object.keys(this.manifest).filter(k => k.startsWith('music.'));
        for (const mid of musicIds) {
            if (mid !== prev && mid !== id) this.stop(mid);
        }

        const aPrev = prev ? this.peekLoopAudio(prev) : null;
        const instNext = this.loop(id);
        const aNext = instNext ? instNext.audio : null;
        if (!aNext) return;

        aNext.volume = 0;

        const t0 = performance.now();
        const dur = Math.max(1, fadeMs);

        const step = (now) => {
            let t = (now - t0) / dur;
            if (t < 0) t = 0;
            if (t > 1) t = 1;

            const nextSpec = this.manifest[id];
            const prevSpec = prev ? this.manifest[prev] : null;

            const nextTarget = this.effectiveVolume(id, nextSpec, 1);
            const prevTarget = prevSpec ? this.effectiveVolume(prev, prevSpec, 1) : 0;

            if (aPrev) aPrev.volume = Math.min(1, Math.max(0, prevTarget * (1 - t)));
            aNext.volume = Math.min(1, Math.max(0, nextTarget * t));

            const nextBusZero = this.clamp01(this.volumes[nextSpec.bus] ?? 1) === 0;
            const prevBusZero = prevSpec ? this.clamp01(this.volumes[prevSpec.bus] ?? 1) === 0 : false;

            if (aPrev) aPrev.muted = (this.muted === true) || prevBusZero || (aPrev.volume === 0);
            aNext.muted = (this.muted === true) || nextBusZero || (aNext.volume === 0);

            if (t < 1) {
                this.fadeHandle = requestAnimationFrame(step);
            } else {
                if (aPrev) {
                    try { aPrev.pause(); } catch { }
                    try { aPrev.currentTime = 0; } catch { }
                }
                this.fadeHandle = null;
            }
        };

        this.fadeHandle = requestAnimationFrame(step);
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
        Object.keys(this.manifest).forEach(id => {
            const list = this.pools.get(id) || [];
            list.forEach(inst => {
                const a = inst.audio;
                const wasMuted = a.muted;
                const wasVol = a.volume;
                a.muted = true;
                try { a.play().then(() => { try { a.pause(); a.currentTime = 0; } catch { } a.muted = wasMuted; a.volume = wasVol; }).catch(() => { a.muted = wasMuted; a.volume = wasVol; }); } catch { }
            });
        });
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
