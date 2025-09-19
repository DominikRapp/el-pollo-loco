function attachPlayerName(app) {
    app.persistName = function (name) { return persistPlayerName(app, name); };
}

function persistPlayerName(app, name) {
    persistNameToLocalStorage(name);
    const usedNames = readUsedNamesArray();
    const key = normalizeNameKey(name);
    if (!usedNames.includes(key)) {
        usedNames.push(key);
        writeUsedNamesArray(usedNames);
    }
}

function persistNameToLocalStorage(name) {
    localStorage.setItem('playerName', String(name || ''));
}

function readUsedNamesArray() {
    const rawJson = localStorage.getItem('usedNames') || '[]';
    try { return JSON.parse(rawJson) || []; } catch { return []; }
}

function writeUsedNamesArray(nameArray) {
    localStorage.setItem('usedNames', JSON.stringify(nameArray || []));
}

function normalizeNameKey(name) {
    return String(name || '').toLowerCase();
}