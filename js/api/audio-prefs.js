/**
 * @typedef {Object} AudioSettings
 * @property {boolean} muted - Global mute toggle.
 * @property {number} master - Master volume (0..1).
 * @property {number} music - Music bus volume (0..1).
 * @property {number} system - System/UI bus volume (0..1).
 * @property {number} characters - Characters/voice bus volume (0..1).
 * @property {number} objects - Objects/FX bus volume (0..1).
 */

/**
 * Global audio preferences API (load/save/apply/from SFX).
 * @type {{load: () => AudioSettings, save: (input?: Partial<AudioSettings>) => AudioSettings, applyToSfx: (sfx: any, opt?: Partial<AudioSettings>) => void, fromSfx: (sfx: any) => AudioSettings}}
 */
let AudioPrefs = createAudioPrefsMain();

/**
 * Factory for the audio prefs API.
 * @returns {{load: () => AudioSettings, save: (inputSettings?: Partial<AudioSettings>) => AudioSettings, applyToSfx: (sfxObject: any, optionalSettings?: Partial<AudioSettings>) => void, fromSfx: (sfxObject: any) => AudioSettings}}
 */
function createAudioPrefsMain() {
    return {
        load: audioPrefsLoad,
        save: audioPrefsSave,
        applyToSfx: audioPrefsApplyToSfx,
        fromSfx: audioPrefsFromSfx
    };
}

/**
 * Loads audio settings from storage, completes defaults, then clamps to [0,1].
 * @returns {AudioSettings}
 */
function audioPrefsLoad() {
    const raw = storageReadJson(audioPrefsStorageKey());
    const loose = audioPrefsToSettings(raw);
    return audioPrefsNormalizeSettings(loose);
}

/**
 * Saves audio settings by merging with current settings, then normalizing.
 * @param {Partial<AudioSettings>} [inputSettings]
 * @returns {AudioSettings}
 */
function audioPrefsSave(inputSettings) {
    const base = audioPrefsLoad();
    const merged = { ...base, ...(inputSettings || {}) };
    const normalized = audioPrefsNormalizeSettings(merged);
    storageWriteJson(audioPrefsStorageKey(), normalized);
    return normalized;
}

/**
 * Applies effective audio settings to an SFX engine.
 * @param {any} sfxObject
 * @param {Partial<AudioSettings>} [optionalSettings]
 * @returns {void}
 */
function audioPrefsApplyToSfx(sfxObject, optionalSettings) {
    if (!sfxObject) return;
    const settings = getEffectiveAudioSettings(optionalSettings);
    applyAudioSettingsToSfx(sfxObject, settings);
}

/**
 * Builds effective settings by merging saved prefs with overrides.
 * @param {Partial<AudioSettings>} [overrides]
 * @returns {AudioSettings}
 */
function getEffectiveAudioSettings(overrides) {
    const merged = overrides ? { ...audioPrefsLoad(), ...overrides } : audioPrefsLoad();
    return audioPrefsNormalizeSettings(merged);
}

/**
 * Applies mute → master → bus volumes to SFX engine.
 * @param {any} sfxObject
 * @param {AudioSettings} settings
 * @returns {void}
 */
function applyAudioSettingsToSfx(sfxObject, settings) {
    sfxSetMuted(sfxObject, settings.muted);
    sfxSetMaster(sfxObject, settings.master);
    sfxApplyBusVolumes(sfxObject, settings);
}

/**
 * Reads settings from an SFX engine and returns a normalized settings object.
 * @param {any} sfxObject
 * @returns {AudioSettings}
 */
function audioPrefsFromSfx(sfxObject) {
    if (!sfxObject) return audioPrefsLoad();
    const snap = readSfxSnapshot(sfxObject);
    const settings = buildSettingsFromSnapshot(snap);
    return audioPrefsNormalizeSettings(settings);
}

/**
 * Reads raw values from SFX engine (muted, master, per-bus).
 * @param {any} sfxObject
 * @returns {{muted:boolean, master:number, music:number, system:number, characters:number, objects:number}}
 */
function readSfxSnapshot(sfxObject) {
    const base = audioPrefsCreateDefaultSettings();
    const muted = sfxReadMuted(sfxObject);
    const master = sfxReadMaster(sfxObject, base.master);
    const v = sfxReadVolumes(sfxObject);
    return { muted, master, music: v.music, system: v.system, characters: v.characters, objects: v.objects };
}

/**
 * Builds a settings object from a raw snapshot.
 * @param {{muted:boolean, master:number, music:number, system:number, characters:number, objects:number}} snap
 * @returns {AudioSettings}
 */
function buildSettingsFromSnapshot(snap) {
    return { muted: snap.muted, master: snap.master, music: snap.music, system: snap.system, characters: snap.characters, objects: snap.objects };
}

/**
 * Storage key used for persisting audio settings.
 * @returns {string}
 */
function audioPrefsStorageKey() {
    return 'audioSettings';
}

/**
 * Creates a full settings object with default values.
 * @returns {AudioSettings}
 */
function audioPrefsCreateDefaultSettings() {
    return {
        muted: getDefaultMuted(),
        master: getDefaultVolume(),
        music: getDefaultVolume(),
        system: getDefaultVolume(),
        characters: getDefaultVolume(),
        objects: getDefaultVolume()
    };
}

/**
 * Default muted state.
 * @returns {boolean}
 */
function getDefaultMuted() {
    return false;
}

/**
 * Default volume for any bus.
 * @returns {number}
 */
function getDefaultVolume() {
    return 0.1;
}

/**
 * Coerces any input to a finite number and clamps it to [0,1].
 * @param {unknown} inputValue
 * @returns {number}
 */
function audioPrefsClampUnit(inputValue) {
    const v = Number.parseFloat(String(inputValue));
    if (!Number.isFinite(v)) return 0;
    if (v <= 0) return 0;
    if (v >= 1) return 1;
    return v;
}

/**
 * Reads and parses JSON from localStorage.
 * @param {string} storageKey
 * @returns {Object<string, any>}
 */
function storageReadJson(storageKey) {
    const raw = localStorage.getItem(storageKey);
    return parseJsonSafe(raw);
}

/**
 * Writes an object as JSON to localStorage.
 * @param {string} storageKey
 * @param {any} objectToWrite
 * @returns {void}
 */
function storageWriteJson(storageKey, objectToWrite) {
    const json = toJsonSafe(objectToWrite);
    localStorage.setItem(storageKey, json);
}

/**
 * Safely parses JSON into an object; empty object on failure.
 * @param {string|null} raw
 * @returns {Object<string, any>}
 */
function parseJsonSafe(raw) {
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
}

/**
 * Safely serializes a value to JSON; "{}" on failure.
 * @param {any} value
 * @returns {string}
 */
function toJsonSafe(value) {
    try { return JSON.stringify(value ?? {}); } catch { return "{}"; }
}

/**
 * Returns a boolean if the value is boolean, otherwise the fallback.
 * @param {unknown} value
 * @param {boolean} fallbackValue
 * @returns {boolean}
 */
function getBooleanOr(value, fallbackValue) {
    return typeof value === 'boolean' ? value : fallbackValue;
}

/**
 * Returns a finite number parsed from value; otherwise the fallback.
 * @param {unknown} value
 * @param {number} fallbackValue
 * @returns {number}
 */
function getNumberOr(value, fallbackValue) {
    const v = Number.parseFloat(String(value));
    return Number.isFinite(v) ? v : fallbackValue;
}

/**
 * Converts a loose object into a fully-typed settings object using defaults.
 * @param {Partial<AudioSettings> & Record<string, any>} sourceObject
 * @returns {AudioSettings}
 */
function audioPrefsToSettings(sourceObject) {
    const d = audioPrefsCreateDefaultSettings();
    return {
        muted: getBooleanOr(sourceObject.muted, d.muted),
        master: getNumberOr(sourceObject.master, d.master),
        music: getNumberOr(sourceObject.music, d.music),
        system: getNumberOr(sourceObject.system, d.system),
        characters: getNumberOr(sourceObject.characters, d.characters),
        objects: getNumberOr(sourceObject.objects, d.objects)
    };
}

/**
 * Normalizes settings by merging defaults first, then clamping to [0,1].
 * @param {Partial<AudioSettings>} inputSettings
 * @returns {AudioSettings}
 */
function audioPrefsNormalizeSettings(inputSettings) {
    const base = audioPrefsCreateDefaultSettings();
    const src = { ...base, ...(inputSettings || {}) };
    return {
        muted: !!src.muted,
        master: audioPrefsClampUnit(src.master),
        music: audioPrefsClampUnit(src.music),
        system: audioPrefsClampUnit(src.system),
        characters: audioPrefsClampUnit(src.characters),
        objects: audioPrefsClampUnit(src.objects)
    };
}

/**
 * Checks whether a named function exists on an object and is callable.
 * @param {any} targetObject
 * @param {string} functionName
 * @returns {boolean}
 */
function canCallFunctionOnObject(targetObject, functionName) {
    return isObjectValid(targetObject) && isFunctionCallable(targetObject[functionName]);
}

/**
 * Checks if the provided value is a non-null object.
 * @param {any} value
 * @returns {boolean}
 */
function isObjectValid(value) {
    return !!value && typeof value === 'object';
}

/**
 * Checks if the provided value is a function.
 * @param {any} value
 * @returns {boolean}
 */
function isFunctionCallable(value) {
    return typeof value === 'function';
}

/**
 * Sets muted state on an SFX engine/object if supported.
 * @param {any} sfxObject
 * @param {boolean} isMuted
 * @returns {void}
 */
function sfxSetMuted(sfxObject, isMuted) {
    if (canCallFunctionOnObject(sfxObject, 'setMuted')) sfxObject.setMuted(!!isMuted);
}

/**
 * Sets master volume after clamping to [0,1].
 * @param {any} sfxObject
 * @param {number} masterValue
 * @returns {void}
 */
function sfxSetMaster(sfxObject, masterValue) {
    if (canCallFunctionOnObject(sfxObject, 'setMaster')) {
        sfxObject.setMaster(audioPrefsClampUnit(masterValue));
    }
}

/**
 * Sets a bus volume on SFX engine after clamping.
 * @param {any} sfxObject
 * @param {"music"|"system"|"characters"|"objects"|string} busName
 * @param {number} volumeValue
 * @returns {void}
 */
function sfxSetBusVolume(sfxObject, busName, volumeValue) {
    if (canCallFunctionOnObject(sfxObject, 'setBusVolume')) {
        sfxObject.setBusVolume(busName, audioPrefsClampUnit(volumeValue));
    }
}

/**
 * Applies per-bus volumes to an SFX engine using known bus names.
 * @param {any} sfxObject
 * @param {AudioSettings} settingsObject
 * @returns {void}
 */
function sfxApplyBusVolumes(sfxObject, settingsObject) {
    if (!sfxObject || !settingsObject) return;
    for (const bus of getKnownBusNames()) {
        sfxSetBusVolume(sfxObject, bus, settingsObject[bus]);
    }
}

/**
 * Returns the canonical list of audio bus names.
 * @returns {Array<"music"|"system"|"characters"|"objects">}
 */
function getKnownBusNames() {
    return ['music', 'system', 'characters', 'objects'];
}

/**
 * Reads muted state from SFX; falls absent, use saved prefs, then legacy key.
 * @param {any} sfxObject
 * @returns {boolean}
 */
function sfxReadMuted(sfxObject) {
    if (typeof sfxObject?.muted === 'boolean') return !!sfxObject.muted;
    const saved = audioPrefsLoad();
    if (typeof saved.muted === 'boolean') return saved.muted;
    return localStorage.getItem('muted') === '1';
}

/**
 * Reads master volume from SFX, falls back, then clamps to [0,1].
 * @param {any} sfxObject
 * @param {number} fallbackValue
 * @returns {number}
 */
function sfxReadMaster(sfxObject, fallbackValue) {
    const raw = (sfxObject && sfxObject.master);
    const v = getNumberOr(raw, fallbackValue);
    return audioPrefsClampUnit(v);
}

/**
 * Reads per-bus volumes from an SFX engine and normalizes them.
 * @param {any} sfxObject
 * @returns {{music:number, system:number, characters:number, objects:number}}
 */
function sfxReadVolumes(sfxObject) {
    const base = audioPrefsCreateDefaultSettings();
    const v = (sfxObject && sfxObject.volumes) || {};
    return {
        music: audioPrefsClampUnit(getNumberOr(v.music, base.music)),
        system: audioPrefsClampUnit(getNumberOr(v.system, base.system)),
        characters: audioPrefsClampUnit(getNumberOr(v.characters, base.characters)),
        objects: audioPrefsClampUnit(getNumberOr(v.objects, base.objects))
    };
}