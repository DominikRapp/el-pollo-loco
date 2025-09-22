/**
 * Attaches a method to persist the player's name onto the app object.
 * @param {object} app - Application object to extend
 */
function attachPlayerName(app) {
    app.persistName = function (name) { return persistPlayerName(app, name); };
}

/**
 * Persists the player's name and tracks it in a deduplicated "used names" list.
 * @param {object} app - Application object (not used currently, passed for symmetry)
 * @param {string} name - Player name to persist
 * @returns {void}
 */
function persistPlayerName(app, name) {
    persistNameToLocalStorage(name);
    const usedNames = readUsedNamesArray();
    const key = normalizeNameKey(name);
    if (!usedNames.includes(key)) {
        usedNames.push(key);
        writeUsedNamesArray(usedNames);
    }
}

/**
 * Stores the player's name in localStorage under the key "playerName".
 * @param {string} name - Player name to store
 * @returns {void}
 */
function persistNameToLocalStorage(name) {
    localStorage.setItem('playerName', String(name || ''));
}

/**
 * Reads the array of previously used (normalized) names from localStorage.
 * @returns {string[]} Array of used names (may be empty)
 */
function readUsedNamesArray() {
    const rawJson = localStorage.getItem('usedNames') || '[]';
    try { return JSON.parse(rawJson) || []; } catch { return []; }
}

/**
 * Writes the array of used (normalized) names to localStorage.
 * @param {string[]} nameArray - Array of names to store
 * @returns {void}
 */
function writeUsedNamesArray(nameArray) {
    localStorage.setItem('usedNames', JSON.stringify(nameArray || []));
}

/**
 * Normalizes a name for deduplication by lowercasing and ensuring a string.
 * @param {string} name - Raw player name input
 * @returns {string} Normalized, lowercase name key
 */
function normalizeNameKey(name) {
    return String(name || '').toLowerCase();
}