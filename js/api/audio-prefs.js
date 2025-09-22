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
 * Global audio preferences API.
 * @type {{load: () => AudioSettings, save: (inputSettings?: Partial<AudioSettings>) => AudioSettings, applyToSfx: (sfxObject: any, optionalSettings?: Partial<AudioSettings>) => void, fromSfx: (sfxObject: any) => AudioSettings}}
 * @example
 * AudioPrefs.save({ master: 0.5, music: 0.3 });
 * AudioPrefs.applyToSfx(engine);
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
 * Loads audio settings from storage and normalizes them.
 * @returns {AudioSettings}
 */
function audioPrefsLoad() {
    const storedObject = storageReadJson(audioPrefsStorageKey());
    return audioPrefsToSettings(storedObject);
}

/**
 * Saves audio settings to storage after normalization.
 * @param {Partial<AudioSettings>} [inputSettings] - Values to persist; missing fields get defaults.
 * @returns {AudioSettings} The normalized settings that were saved.
 * @example
 * const saved = audioPrefsSave({ muted: true });
 */
function audioPrefsSave(inputSettings) {
    const normalizedSettings = audioPrefsNormalizeSettings(inputSettings || {});
    storageWriteJson(audioPrefsStorageKey(), normalizedSettings);
    return normalizedSettings;
}

/**
 * Applies given or stored audio settings to an SFX engine/object.
 * @param {any} sfxObject - Target audio engine with methods like setMuted/setMaster/setBusVolume.
 * @param {Partial<AudioSettings>} [optionalSettings] - Settings to apply; if omitted, stored settings are used.
 * @returns {void}
 */
function audioPrefsApplyToSfx(sfxObject, optionalSettings) {
    if (!sfxObject) return;
    const effectiveSettings = optionalSettings ? audioPrefsNormalizeSettings(optionalSettings) : audioPrefsLoad();
    sfxSetMuted(sfxObject, effectiveSettings.muted);
    sfxSetMaster(sfxObject, effectiveSettings.master);
    sfxApplyBusVolumes(sfxObject, effectiveSettings);
}

/**
 * Reads current values from an SFX engine/object and returns them as settings.
 * @param {any} sfxObject - Source audio engine/object.
 * @returns {AudioSettings}
 */
function audioPrefsFromSfx(sfxObject) {
    if (!sfxObject) return audioPrefsLoad();
    const defaultSettings = audioPrefsCreateDefaultSettings();
    const muted = sfxReadMuted(sfxObject);
    const master = sfxReadMaster(sfxObject, defaultSettings.master);
    const volumes = sfxReadVolumes(sfxObject);
    return {
        muted: muted,
        master: master,
        music: volumes.music,
        system: volumes.system,
        characters: volumes.characters,
        objects: volumes.objects
    };
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
        muted: false,
        master: 0.1,
        music: 0.1,
        system: 0.1,
        characters: 0.1,
        objects: 0.1
    };
}

/**
 * Clamps an input to the [0,1] range and coerces to number.
 * @param {unknown} inputValue
 * @returns {number}
 */
function audioPrefsClampUnit(inputValue) {
    const numericValue = Number(inputValue || 0);
    if (numericValue < 0) return 0;
    if (numericValue > 1) return 1;
    return numericValue;
}

/**
 * Reads and parses JSON from localStorage.
 * @param {string} storageKey
 * @returns {Object<string, any>}
 */
function storageReadJson(storageKey) {
    const rawJson = localStorage.getItem(storageKey);
    if (!rawJson) return {};
    try { return JSON.parse(rawJson); } catch { return {}; }
}

/**
 * Writes an object as JSON to localStorage.
 * @param {string} storageKey
 * @param {any} objectToWrite
 * @returns {void}
 */
function storageWriteJson(storageKey, objectToWrite) {
    localStorage.setItem(storageKey, JSON.stringify(objectToWrite));
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
 * Returns a number if the value is number, otherwise the fallback.
 * @param {unknown} value
 * @param {number} fallbackValue
 * @returns {number}
 */
function getNumberOr(value, fallbackValue) {
    return typeof value === 'number' ? value : fallbackValue;
}

/**
 * Converts a loose object into a fully-typed settings object using defaults.
 * @param {Partial<AudioSettings> & Record<string, any>} sourceObject
 * @returns {AudioSettings}
 */
function audioPrefsToSettings(sourceObject) {
    const defaultSettings = audioPrefsCreateDefaultSettings();
    const muted = getBooleanOr(sourceObject.muted, defaultSettings.muted);
    const master = getNumberOr(sourceObject.master, defaultSettings.master);
    const music = getNumberOr(sourceObject.music, defaultSettings.music);
    const system = getNumberOr(sourceObject.system, defaultSettings.system);
    const characters = getNumberOr(sourceObject.characters, defaultSettings.characters);
    const objects = getNumberOr(sourceObject.objects, defaultSettings.objects);
    return { muted, master, music, system, characters, objects };
}

/**
 * Normalizes a partial settings object: coerces booleans and clamps numbers to [0,1].
 * @param {Partial<AudioSettings>} inputSettings
 * @returns {AudioSettings}
 */
function audioPrefsNormalizeSettings(inputSettings) {
    return {
        muted: !!inputSettings.muted,
        master: audioPrefsClampUnit(inputSettings.master),
        music: audioPrefsClampUnit(inputSettings.music),
        system: audioPrefsClampUnit(inputSettings.system),
        characters: audioPrefsClampUnit(inputSettings.characters),
        objects: audioPrefsClampUnit(inputSettings.objects)
    };
}

/**
 * Checks whether a named function exists on an object and is callable.
 * @param {any} targetObject
 * @param {string} functionName
 * @returns {boolean}
 */
function canCallFunctionOnObject(targetObject, functionName) {
    return !!targetObject && typeof targetObject[functionName] === 'function';
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
 * Sets master volume on an SFX engine/object if supported.
 * @param {any} sfxObject
 * @param {number} masterValue - Expected in range [0,1].
 * @returns {void}
 */
function sfxSetMaster(sfxObject, masterValue) {
    if (canCallFunctionOnObject(sfxObject, 'setMaster')) sfxObject.setMaster(masterValue);
}

/**
 * Sets a named bus volume on an SFX engine/object if supported.
 * @param {any} sfxObject
 * @param {"music"|"system"|"characters"|"objects"|string} busName
 * @param {number} volumeValue - Expected in range [0,1].
 * @returns {void}
 */
function sfxSetBusVolume(sfxObject, busName, volumeValue) {
    if (canCallFunctionOnObject(sfxObject, 'setBusVolume')) sfxObject.setBusVolume(busName, volumeValue);
}

/**
 * Applies per-bus volumes from a settings object to an SFX engine/object.
 * @param {any} sfxObject
 * @param {AudioSettings} settingsObject
 * @returns {void}
 */
function sfxApplyBusVolumes(sfxObject, settingsObject) {
    sfxSetBusVolume(sfxObject, 'music', settingsObject.music);
    sfxSetBusVolume(sfxObject, 'system', settingsObject.system);
    sfxSetBusVolume(sfxObject, 'characters', settingsObject.characters);
    sfxSetBusVolume(sfxObject, 'objects', settingsObject.objects);
}

/**
 * Reads muted state from an SFX engine/object, with localStorage fallback.
 * @param {any} sfxObject
 * @returns {boolean}
 */
function sfxReadMuted(sfxObject) {
    const hasMutedFlag = typeof sfxObject.muted === 'boolean';
    if (hasMutedFlag) return !!sfxObject.muted;
    return localStorage.getItem('muted') === '1';
}

/**
 * Reads master volume from an SFX engine/object or returns a fallback.
 * @param {any} sfxObject
 * @param {number} fallbackValue
 * @returns {number}
 */
function sfxReadMaster(sfxObject, fallbackValue) {
    return typeof sfxObject.master === 'number' ? sfxObject.master : fallbackValue;
}

/**
 * Reads per-bus volumes from an SFX engine/object with defaults.
 * @param {any} sfxObject
 * @returns {{music:number, system:number, characters:number, objects:number}}
 */
function sfxReadVolumes(sfxObject) {
    const defaultSettings = audioPrefsCreateDefaultSettings();
    const volumesObject = (sfxObject && sfxObject.volumes) || {};
    const music = getNumberOr(volumesObject.music, defaultSettings.music);
    const system = getNumberOr(volumesObject.system, defaultSettings.system);
    const characters = getNumberOr(volumesObject.characters, defaultSettings.characters);
    const objects = getNumberOr(volumesObject.objects, defaultSettings.objects);
    return { music, system, characters, objects };
}