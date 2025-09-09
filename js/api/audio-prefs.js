const AudioPrefs = (() => {
    const key = 'audioSettings';
    const def = { muted: false, master: 0.1, music: 0.1, system: 0.1, characters: 0.1, objects: 0.1 };
    const load = () => {
        try {
            const x = JSON.parse(localStorage.getItem(key) || '{}');
            return {
                muted: typeof x.muted === 'boolean' ? x.muted : def.muted,
                master: typeof x.master === 'number' ? x.master : def.master,
                music: typeof x.music === 'number' ? x.music : def.music,
                system: typeof x.system === 'number' ? x.system : def.system,
                characters: typeof x.characters === 'number' ? x.characters : def.characters,
                objects: typeof x.objects === 'number' ? x.objects : def.objects
            };
        } catch { return { ...def }; }
    };
    const save = (s) => {
        const obj = {
            muted: !!s.muted,
            master: Math.max(0, Math.min(1, Number(s.master || 0))),
            music: Math.max(0, Math.min(1, Number(s.music || 0))),
            system: Math.max(0, Math.min(1, Number(s.system || 0))),
            characters: Math.max(0, Math.min(1, Number(s.characters || 0))),
            objects: Math.max(0, Math.min(1, Number(s.objects || 0)))
        };
        localStorage.setItem(key, JSON.stringify(obj));
        return obj;
    };
    const applyToSfx = (sfx, s) => {
        if (!sfx) return;
        const st = s || load();
        if (typeof sfx.setMuted === 'function') sfx.setMuted(!!st.muted);
        if (typeof sfx.setMaster === 'function') sfx.setMaster(st.master);
        if (typeof sfx.setBusVolume === 'function') {
            sfx.setBusVolume('music', st.music);
            sfx.setBusVolume('system', st.system);
            sfx.setBusVolume('characters', st.characters);
            sfx.setBusVolume('objects', st.objects);
        }
    };
    const fromSfx = (sfx) => {
        if (!sfx) return load();
        const v = sfx.volumes || {};
        return {
            muted: !!(typeof sfx.muted === 'boolean' ? sfx.muted : (localStorage.getItem('muted') === '1')),
            master: typeof sfx.master === 'number' ? sfx.master : def.master,
            music: typeof v.music === 'number' ? v.music : def.music,
            system: typeof v.system === 'number' ? v.system : def.system,
            characters: typeof v.characters === 'number' ? v.characters : def.characters,
            objects: typeof v.objects === 'number' ? v.objects : def.objects
        };
    };
    return { load, save, applyToSfx, fromSfx };
})();
