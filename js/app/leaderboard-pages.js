/**
 * Attaches a method to the app that builds leaderboard pages on demand.
 * @param {object} app - Application object to extend
 */
function attachLeaderboardPages(app) {
    app.buildLeaderboardPages = function () { return buildLeaderboardPages(); };
}

/**
 * Builds an array of HTML strings, one per leaderboard page (total + levels 1–5).
 * @returns {string[]} Array of HTML page fragments
 */
function buildLeaderboardPages() {
    const rawData = readStoredLeaderboardJson();
    const totalEntries = ensureTop10Array(rawData.total);
    const levelEntries = buildLevelEntries(rawData.levels);
    const pages = [];
    pages.push('<h3>Gesamt</h3>' + buildTotalTableHtml(totalEntries));
    for (let levelNumber = 1; levelNumber <= 5; levelNumber++) {
        pages.push('<h3>Level ' + levelNumber + '</h3>' + buildLevelTableHtml(levelEntries[levelNumber]));
    }
    return pages;
}

/**
 * Reads the leaderboard JSON from localStorage.
 * @returns {object} Parsed leaderboard object or empty object if not present/invalid
 */
function readStoredLeaderboardJson() {
    const rawJson = localStorage.getItem('leaderboard_rankings') || '{}';
    try { return JSON.parse(rawJson) || {}; } catch { return {}; }
}

/**
 * Ensures the provided candidate is an array and returns at most 10 items.
 * @param {any} candidate - Potential array of entries
 * @returns {object[]} Top 10 (or fewer) entries, or an empty array
 */
function ensureTop10Array(candidate) {
    if (!Array.isArray(candidate)) return [];
    return candidate.slice(0, 10);
}

/**
 * Normalizes the per-level entries, ensuring arrays for levels 1–5 limited to top 10.
 * @param {object} [levelsObject] - Object mapping level numbers (as strings) to arrays
 * @returns {{1: object[], 2: object[], 3: object[], 4: object[], 5: object[]}} Normalized level entries
 */
function buildLevelEntries(levelsObject) {
    const levels = levelsObject || {};
    return {
        1: ensureTop10Array(levels['1']),
        2: ensureTop10Array(levels['2']),
        3: ensureTop10Array(levels['3']),
        4: ensureTop10Array(levels['4']),
        5: ensureTop10Array(levels['5'])
    };
}

/**
 * Formats a number as a string, or returns an en dash if not a number.
 * @param {unknown} value - Value to format
 * @returns {string} Stringified number or '–'
 */
function formatNumberOrDash(value) {
    return (typeof value === 'number') ? String(value) : '–';
}

/**
 * Formats milliseconds into "MM:SS" or returns an en dash for invalid inputs.
 * @param {unknown} milliseconds - Milliseconds to format
 * @returns {string} Time string "MM:SS" or '–'
 */
function formatMillisecondsToMMSS(milliseconds) {
    if (typeof milliseconds !== 'number' || milliseconds < 0) return '–';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

/**
 * Computes points from a counts object using weighted categories.
 * Weights: levelComplete=10, boss=5, chicken=4, chickenSmall=3, bottle=2, coin=1.
 * @param {object} [counts] - Count fields used to calculate points
 * @returns {number} Total points
 */
function computePointsFromCounts(counts) {
    const c = counts || {};
    const levelComplete = Number(c.levelComplete || 0);
    const boss = Number(c.boss || 0);
    const chicken = Number(c.chicken || 0);
    const chickenSmall = Number(c.chickenSmall || 0);
    const bottle = Number(c.bottle || 0);
    const coin = Number(c.coin || 0);
    return levelComplete * 10 + boss * 5 + chicken * 4 + chickenSmall * 3 + bottle * 2 + coin * 1;
}

/**
 * Returns a new array sorted by points (desc), then time (asc), then createdAt (asc), limited to top 10.
 * @param {object[]} entryArray - Array of entries to sort
 * @param {string} timeFieldName - Name of the time field to compare (e.g., 'timeMs' or 'totalTimeMs')
 * @returns {object[]} Sorted top 10 entries
 */
function sortByPointsTimeCreated(entryArray, timeFieldName) {
    const copy = (entryArray || []).slice();
    copy.sort((a, b) => compareEntries(a, b, timeFieldName));
    return copy.slice(0, 10);
}

/**
 * Compares two entries by points (desc), then time (asc), then createdAt (asc).
 * Missing/invalid times fall back to Number.MAX_SAFE_INTEGER.
 * @param {object} left - Left entry
 * @param {object} right - Right entry
 * @param {string} timeFieldName - Field name used for time comparison
 * @returns {number} Negative if left < right, positive if left > right, 0 if equal (for Array.prototype.sort)
 */
function compareEntries(left, right, timeFieldName) {
    const leftPoints = computePointsFromCounts((left && left.counts) || {});
    const rightPoints = computePointsFromCounts((right && right.counts) || {});
    if (rightPoints !== leftPoints) return rightPoints - leftPoints;
    const leftTime = (typeof left?.[timeFieldName] === 'number') ? left[timeFieldName] : Number.MAX_SAFE_INTEGER;
    const rightTime = (typeof right?.[timeFieldName] === 'number') ? right[timeFieldName] : Number.MAX_SAFE_INTEGER;
    if (leftTime !== rightTime) return leftTime - rightTime;
    const leftCreated = (typeof left?.createdAt === 'number') ? left.createdAt : Number.MAX_SAFE_INTEGER;
    const rightCreated = (typeof right?.createdAt === 'number') ? right.createdAt : Number.MAX_SAFE_INTEGER;
    return leftCreated - rightCreated;
}

/**
 * Detects a placeholder entry by checking if createdAt is exactly 0.
 * @param {object} entry - Entry to inspect
 * @returns {boolean} True if entry is a placeholder
 */
function isPlaceholderEntry(entry) {
    return Number(entry && entry.createdAt) === 0;
}

/**
 * Builds the full HTML for the total leaderboard table.
 * @param {object[]} entries - Total entries (unsorted)
 * @returns {string} HTML string for the table
 */
function buildTotalTableHtml(entries) {
    const rows = buildTotalRowsHtml(entries);
    return totalLeaderboardTableTemplate(rows);
}

/**
 * Builds one row of the total leaderboard table.
 * @param {object} entry - Leaderboard entry
 * @param {number} index - Zero-based rank index
 * @returns {string} HTML string for a single row
 */
function buildTotalRowHtml(entry, index) {
    const d = mapTotalEntryToRowData(entry, index);
    return totalLeaderboardRowTemplate(d);
}

/**
 * Maps a total-entry object to the row template data shape.
 * @param {object} entry - Leaderboard entry
 * @param {number} index - Zero-based rank index
 * @returns {{index:number,name:string,highestLevel:string,timeText:string,points:string,boss:string,chicken:string,chickenSmall:string,bottle:string,coin:string}}
 */
function mapTotalEntryToRowData(entry, index) {
    const name = entry?.name || 'Player';
    const highestLevel = (typeof entry?.highestLevel === 'number') ? entry.highestLevel : 0;
    const counts = entry?.counts || {};
    const points = computePointsFromCounts(counts);
    const boss = counts.boss || 0;
    const chicken = counts.chicken || 0;
    const chickenSmall = counts.chickenSmall || 0;
    const bottle = counts.bottle || 0;
    const coin = counts.coin || 0;
    const timeText = isPlaceholderEntry(entry) ? '00:00' : formatMillisecondsToMMSS(typeof entry?.totalTimeMs === 'number' ? entry.totalTimeMs : null);
    return { index, name, highestLevel: formatNumberOrDash(highestLevel), timeText, points: formatNumberOrDash(points), boss: formatNumberOrDash(boss), chicken: formatNumberOrDash(chicken), chickenSmall: formatNumberOrDash(chickenSmall), bottle: formatNumberOrDash(bottle), coin: formatNumberOrDash(coin) };
}

/**
 * Builds one row of a level leaderboard table.
 * @param {object} entry - Leaderboard entry
 * @param {number} index - Zero-based rank index
 * @returns {string} HTML string for a single row
 */
function buildLevelRowHtml(entry, index) {
    const d = mapLevelEntryToRowData(entry, index);
    return levelLeaderboardRowTemplate(d);
}

/**
 * Maps a level-entry object to the row template data shape.
 * @param {object} entry - Leaderboard entry
 * @param {number} index - Zero-based rank index
 * @returns {{index:number,name:string,timeText:string,points:string,boss:string,chicken:string,chickenSmall:string,bottle:string,coin:string}}
 */
function mapLevelEntryToRowData(entry, index) {
    const name = entry?.name || 'Player';
    const counts = entry?.counts || {};
    const points = computePointsFromCounts(counts);
    const boss = counts.boss || 0;
    const chicken = counts.chicken || 0;
    const chickenSmall = counts.chickenSmall || 0;
    const bottle = counts.bottle || 0;
    const coin = counts.coin || 0;
    const timeText = isPlaceholderEntry(entry) ? '00:00' : formatMillisecondsToMMSS(typeof entry?.timeMs === 'number' ? entry.timeMs : null);
    return { index, name, timeText, points: formatNumberOrDash(points), boss: formatNumberOrDash(boss), chicken: formatNumberOrDash(chicken), chickenSmall: formatNumberOrDash(chickenSmall), bottle: formatNumberOrDash(bottle), coin: formatNumberOrDash(coin) };
}


/**
 * Builds the full HTML for a single level's leaderboard table.
 * @param {object[]} entries - Level entries (unsorted)
 * @returns {string} HTML string for the table
 */
function buildLevelTableHtml(entries) {
    const rows = buildLevelRowsHtml(entries);
    return levelLeaderboardTableTemplate(rows);
}

/**
 * Builds the rows HTML for a level leaderboard table after sorting.
 * @param {object[]} entries - Level entries (unsorted)
 * @returns {string} Concatenated HTML for table rows
 */
function buildLevelRowsHtml(entries) {
    const sorted = sortByPointsTimeCreated(entries, 'timeMs');
    const parts = [];
    sorted.forEach((entry, index) => parts.push(buildLevelRowHtml(entry, index)));
    return parts.join('');
}

/**
 * Builds one row of a level leaderboard table.
 * @param {object} entry - Leaderboard entry
 * @param {number} index - Zero-based rank index
 * @returns {string} HTML string for a single row
 */
function buildLevelRowHtml(entry, index) {
    const name = entry?.name || 'Player';
    const counts = entry?.counts || {};
    const points = computePointsFromCounts(counts);
    const boss = counts.boss || 0;
    const chicken = counts.chicken || 0;
    const chickenSmall = counts.chickenSmall || 0;
    const bottle = counts.bottle || 0;
    const coin = counts.coin || 0;
    const timeText = isPlaceholderEntry(entry) ? '00:00' : formatMillisecondsToMMSS(typeof entry?.timeMs === 'number' ? entry.timeMs : null);
    const d = { index, name, timeText, points: formatNumberOrDash(points), boss: formatNumberOrDash(boss), chicken: formatNumberOrDash(chicken), chickenSmall: formatNumberOrDash(chickenSmall), bottle: formatNumberOrDash(bottle), coin: formatNumberOrDash(coin) };
    return levelLeaderboardRowTemplate(d);
}