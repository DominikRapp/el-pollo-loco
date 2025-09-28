/**
 * Formats a duration (ms) as mm:ss. Returns '–' for invalid input.
 * @param {number} milliseconds - Non-negative duration in milliseconds
 * @returns {string} Formatted time string in mm:ss
 */
function formatMinutesSeconds(milliseconds) {
    if (typeof milliseconds !== 'number' || milliseconds < 0) return '–';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

/**
 * Detects whether a leaderboard entry is a placeholder based on time and createdAt.
 * @param {object} entry - Entry object
 * @param {string} key - Time field key on the entry (e.g., 'timeMs', 'totalTimeMs')
 * @returns {boolean} True if the entry should be considered placeholder
 */
function isPlaceholderEntry(entry, key) {
    const timeValue = Number(entry && entry[key]);
    const createdAt = Number(entry && entry.createdAt);
    return createdAt === 0 || timeValue >= 9999999999;
}

/**
 * Resolves a displayable time string for an entry and field.
 * Shows '00:00' for placeholders and '–' for missing entries.
 * @param {object|null|undefined} entry - Entry object or null/undefined
 * @param {string} key - Time field key (e.g., 'timeMs', 'totalTimeMs')
 * @returns {string} Displayable time string
 */
function toTimeText(entry, key) {
    if (!entry) return '–';
    return isPlaceholderEntry(entry, key) ? '00:00' : formatMinutesSeconds(entry[key]);
}

/**
 * Builds a single "total" leaderboard row as HTML using the row template.
 * @param {object} e - Total entry object
 * @param {number} i - Row index (0-based)
 * @returns {string} HTML string for the row
 */
function toTotalRowData(e, i) {
    const name = e?.name || 'Player';
    const level = typeof e?.highestLevel === 'number' ? e.highestLevel : 0;
    const points = typeof e?.points === 'number' ? e.points : 0;
    const time = toTimeText(e, 'totalTimeMs');
    return totalLeaderboardSimpleRowTemplate({ index: i, name, level, points, time });
}

/**
 * Builds the full "total" leaderboard table HTML.
 * @param {object[]} rows - Array of total leaderboard entries
 * @returns {string} HTML string for the table
 */
function buildTotalTable(rows) {
    const body = (rows || []).map((e, i) => toTotalRowData(e || {}, i)).join('');
    return totalLeaderboardSimpleTableTemplate(body);
}

/**
 * Builds a single "level" leaderboard row as HTML using the row template.
 * @param {number} levelNumber - Level number for the row label
 * @param {object} e - Level entry object
 * @param {number} i - Row index (0-based)
 * @returns {string} HTML string for the row
 */
function toLevelRowData(levelNumber, e, i) {
    const name = e?.name || 'Player';
    const level = 'L' + String(levelNumber);
    const points = typeof e?.points === 'number' ? e.points : 0;
    const time = toTimeText(e, 'timeMs');
    return levelLeaderboardSimpleRowTemplate({ index: i, name, level, points, time });
}

/**
 * Builds the full "level" leaderboard table HTML for a specific level.
 * @param {number} levelNumber - Level number
 * @param {object[]} rows - Array of level leaderboard entries
 * @returns {string} HTML string for the table
 */
function buildLevelTable(levelNumber, rows) {
    const body = (rows || []).map((e, i) => toLevelRowData(levelNumber, e || {}, i)).join('');
    return levelLeaderboardSimpleTableTemplate(body);
}

/**
 * Builds an array of HTML pages by fetching and rendering.
 * @returns {Promise<string[]>} Array of HTML page snippets
 */
async function buildLeaderboardPages() {
    const data = await fetchLeaderboardData(5);
    return renderLeaderboardPages(data);
}

/**
 * Loads leaderboard data for total and 1..levelCount.
 * @param {number} levelCount - Number of levels to fetch
 * @returns {Promise<{total: object[], levels: object[][]}>}
 */
async function fetchLeaderboardData(levelCount) {
    const total = await LeaderboardAPI.fetchTop10('total');
    const levels = [];
    for (let lvl = 1; lvl <= levelCount; lvl++) {
        levels.push(await LeaderboardAPI.fetchTop10('level', lvl));
    }
    return { total, levels };
}

/**
 * Renders pages for total and per-level from provided data.
 * @param {{total: object[], levels: object[][]}} data - Loaded leaderboard data
 * @returns {string[]} Array of HTML page snippets
 */
function renderLeaderboardPages(data) {
    const pages = [];
    pages.push('<h3>Total</h3>' + buildTotalTable(data.total));
    data.levels.forEach((rows, i) => {
        const lvl = i + 1;
        pages.push('<h3>Level ' + lvl + '</h3>' + buildLevelTable(lvl, rows));
    });
    return pages;
}

/**
 * Public view helpers for building leaderboard pages.
 * @type {{buildPages: function(): Promise<string[]>}}
 */
const LeaderboardView = { buildPages: buildLeaderboardPages };