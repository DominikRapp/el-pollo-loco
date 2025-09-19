let AudioPrefs = createAudioPrefsMain();

function createAudioPrefsMain() {
    return {
        load: audioPrefsLoad,
        save: audioPrefsSave,
        applyToSfx: audioPrefsApplyToSfx,
        fromSfx: audioPrefsFromSfx
    };
}

function audioPrefsLoad() {
    const storedObject = storageReadJson(audioPrefsStorageKey());
    return audioPrefsToSettings(storedObject);
}

function audioPrefsSave(inputSettings) {
    const normalizedSettings = audioPrefsNormalizeSettings(inputSettings || {});
    storageWriteJson(audioPrefsStorageKey(), normalizedSettings);
    return normalizedSettings;
}

function audioPrefsApplyToSfx(sfxObject, optionalSettings) {
    if (!sfxObject) return;
    const effectiveSettings = optionalSettings ? audioPrefsNormalizeSettings(optionalSettings) : audioPrefsLoad();
    sfxSetMuted(sfxObject, effectiveSettings.muted);
    sfxSetMaster(sfxObject, effectiveSettings.master);
    sfxApplyBusVolumes(sfxObject, effectiveSettings);
}

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

function audioPrefsStorageKey() {
    return 'audioSettings';
}

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

function audioPrefsClampUnit(inputValue) {
    const numericValue = Number(inputValue || 0);
    if (numericValue < 0) return 0;
    if (numericValue > 1) return 1;
    return numericValue;
}

function storageReadJson(storageKey) {
    const rawJson = localStorage.getItem(storageKey);
    if (!rawJson) return {};
    try { return JSON.parse(rawJson); } catch { return {}; }
}

function storageWriteJson(storageKey, objectToWrite) {
    localStorage.setItem(storageKey, JSON.stringify(objectToWrite));
}

function getBooleanOr(value, fallbackValue) {
    return typeof value === 'boolean' ? value : fallbackValue;
}

function getNumberOr(value, fallbackValue) {
    return typeof value === 'number' ? value : fallbackValue;
}

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

function canCallFunctionOnObject(targetObject, functionName) {
    return !!targetObject && typeof targetObject[functionName] === 'function';
}

function sfxSetMuted(sfxObject, isMuted) {
    if (canCallFunctionOnObject(sfxObject, 'setMuted')) sfxObject.setMuted(!!isMuted);
}

function sfxSetMaster(sfxObject, masterValue) {
    if (canCallFunctionOnObject(sfxObject, 'setMaster')) sfxObject.setMaster(masterValue);
}

function sfxSetBusVolume(sfxObject, busName, volumeValue) {
    if (canCallFunctionOnObject(sfxObject, 'setBusVolume')) sfxObject.setBusVolume(busName, volumeValue);
}

function sfxApplyBusVolumes(sfxObject, settingsObject) {
    sfxSetBusVolume(sfxObject, 'music', settingsObject.music);
    sfxSetBusVolume(sfxObject, 'system', settingsObject.system);
    sfxSetBusVolume(sfxObject, 'characters', settingsObject.characters);
    sfxSetBusVolume(sfxObject, 'objects', settingsObject.objects);
}

function sfxReadMuted(sfxObject) {
    const hasMutedFlag = typeof sfxObject.muted === 'boolean';
    if (hasMutedFlag) return !!sfxObject.muted;
    return localStorage.getItem('muted') === '1';
}

function sfxReadMaster(sfxObject, fallbackValue) {
    return typeof sfxObject.master === 'number' ? sfxObject.master : fallbackValue;
}

function sfxReadVolumes(sfxObject) {
    const defaultSettings = audioPrefsCreateDefaultSettings();
    const volumesObject = (sfxObject && sfxObject.volumes) || {};
    const music = getNumberOr(volumesObject.music, defaultSettings.music);
    const system = getNumberOr(volumesObject.system, defaultSettings.system);
    const characters = getNumberOr(volumesObject.characters, defaultSettings.characters);
    const objects = getNumberOr(volumesObject.objects, defaultSettings.objects);
    return { music, system, characters, objects };
}