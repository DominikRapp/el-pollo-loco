let LeaderboardCore = createLeaderboardCore();

/**
 * Factory that exposes all core leaderboard utilities.
 * @returns {object} Public API for core leaderboard logic
 */
function createLeaderboardCore() {
    return {
        formatTime: formatMillisecondsAsClock,
        calculatePoints: calculateScorePoints,
        buildSortKey: buildSortableKeyMain,
        getTimeFieldName: getTimeFieldName,
        normalizeEntriesTimes: normalizeEntriesTimes,
        compareEntries: compareEntries,
        resolveComparableTime: resolveComparableTime,
        resolveTimeValueForKind: resolveTimeValueForKind,
        resolvePointsValue: resolvePointsValue,
        buildSavedPayload: buildSavedPayload,
        resolveTotalTimeFromInput: resolveTotalTimeFromInput,
        padNonNegativeInteger: padNonNegativeInteger,
        invertAndPad: invertAndPad
    };
}

/**
 * Formats a millisecond duration as a MM:SS clock string.
 * Returns '–' for invalid values and '00:00' if value is unrealistically large.
 * @param {number|string} millisecondsValue - Duration in milliseconds
 * @returns {string} Formatted time string (MM:SS)
 */
function formatMillisecondsAsClock(millisecondsValue) {
    const numericMilliseconds = Number(millisecondsValue);
    if (!Number.isFinite(numericMilliseconds)) return '–';
    if (numericMilliseconds >= 9999999999) return '00:00';
    const totalSeconds = Math.max(0, Math.floor(numericMilliseconds / 1000));
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const minutesText = String(totalMinutes).padStart(2, '0');
    const secondsText = String(remainingSeconds).padStart(2, '0');
    return minutesText + ':' + secondsText;
}

/**
 * Calculates total points from a counts object using weighted categories.
 * @param {object} [countsObject={}] - Object with per-category counts
 * @param {number} [countsObject.levelComplete=0] - Completed levels
 * @param {number} [countsObject.boss=0] - Bosses defeated
 * @param {number} [countsObject.chicken=0] - Chickens collected
 * @param {number} [countsObject.chickenSmall=0] - Small chickens collected
 * @param {number} [countsObject.bottle=0] - Bottles collected
 * @param {number} [countsObject.coin=0] - Coins collected
 * @returns {number} Total score points
 */
function calculateScorePoints(countsObject = {}) {
    const { levelComplete = 0, boss = 0, chicken = 0, chickenSmall = 0, bottle = 0, coin = 0 } = countsObject || {};
    const totalPoints = levelComplete * 10 + boss * 5 + chicken * 4 + chickenSmall * 3 + bottle * 2 + coin * 1;
    return totalPoints;
}

/**
 * Pads a non-negative integer with leading zeros up to a fixed width.
 * Negative values are clamped to 0.
 * @param {number} value - Number to pad
 * @param {number} width - Minimum width of the resulting string
 * @returns {string} Zero-padded integer string
 */
function padNonNegativeInteger(value, width) {
    const integerValue = Math.max(0, Math.floor(value || 0));
    return String(integerValue).padStart(width, '0');
}

/**
 * Inverts a bounded integer relative to a max value and pads it.
 * Useful for creating descending sort keys on ascending indexes.
 * @param {number} rawValue - Original value to invert
 * @param {number} maxValue - Maximum bound (inclusive)
 * @param {number} width - Pad width for the result
 * @returns {string} Inverted and zero-padded string
 */
function invertAndPad(rawValue, maxValue, width) {
    const bounded = Math.min(maxValue, Math.max(0, Math.floor(rawValue || 0)));
    const inverted = maxValue - bounded;
    return padNonNegativeInteger(inverted, width);
}

/**
 * Builds a lexicographically sortable key for leaderboard entries.
 * Sorts by: higher points first, then lower time, then earlier created.
 * @param {number} pointsValue - Computed points
 * @param {number} timeMilliseconds - Time in milliseconds
 * @param {number} createdAtMilliseconds - Unix epoch ms when created
 * @returns {string} Composite sortable key
 */
function buildSortableKeyMain(pointsValue, timeMilliseconds, createdAtMilliseconds) {
    const paddedPoints = padNonNegativeInteger(pointsValue, 6);
    const paddedInvertedTime = invertAndPad(timeMilliseconds, 9999999999, 10);
    const paddedInvertedCreated = invertAndPad(createdAtMilliseconds, 9999999999999, 13);
    return paddedPoints + ':' + paddedInvertedTime + ':' + paddedInvertedCreated;
}

/**
 * Resolves which time field name to use for a given leaderboard kind.
 * @param {'total'|'level'} kind - Leaderboard kind
 * @returns {'totalTimeMs'|'timeMs'} Field name for time
 */
function getTimeFieldName(kind) {
    return kind === 'total' ? 'totalTimeMs' : 'timeMs';
}

/**
 * Normalizes an array of entries ensuring both time fields are present and numeric.
 * Fills missing time fields using the comparable time.
 * @param {object[]} entryArray - Array of raw entry objects
 * @param {string} timeFieldName - Primary time field to normalize
 * @returns {object[]} New array with normalized time fields
 */
function normalizeEntriesTimes(entryArray, timeFieldName) {
    return entryArray.map((entryObject) => {
        const preferredTime = resolveComparableTime(entryObject, timeFieldName);
        return {
            ...entryObject,
            [timeFieldName]: preferredTime,
            timeMs: typeof entryObject.timeMs === 'number' ? entryObject.timeMs : preferredTime,
            totalTimeMs: typeof entryObject.totalTimeMs === 'number' ? entryObject.totalTimeMs : preferredTime
        };
    });
}

/**
 * Compares two entries for sorting: points desc, time asc, createdAt asc.
 * @param {object} leftEntry - First entry
 * @param {object} rightEntry - Second entry
 * @param {string} timeFieldName - Time field to compare
 * @returns {number} Negative if left < right, positive if left > right, 0 if equal
 */
function compareEntries(leftEntry, rightEntry, timeFieldName) {
    if (rightEntry.points !== leftEntry.points) return rightEntry.points - leftEntry.points;
    const leftTime = leftEntry[timeFieldName];
    const rightTime = rightEntry[timeFieldName];
    if (leftTime !== rightTime) return leftTime - rightTime;
    const leftCreated = typeof leftEntry.createdAt === 'number' ? leftEntry.createdAt : Number.MAX_SAFE_INTEGER;
    const rightCreated = typeof rightEntry.createdAt === 'number' ? rightEntry.createdAt : Number.MAX_SAFE_INTEGER;
    return leftCreated - rightCreated;
}

/**
 * Resolves a numeric time to compare from an entry given a preferred field.
 * Falls back across known time fields; returns MAX_SAFE_INTEGER if none.
 * @param {object} entryObject - Entry to read from
 * @param {string} timeFieldName - Preferred time field name
 * @returns {number} Comparable time value
 */
function resolveComparableTime(entryObject, timeFieldName) {
    if (typeof entryObject[timeFieldName] === 'number') return entryObject[timeFieldName];
    if (typeof entryObject.timeMs === 'number') return entryObject.timeMs;
    if (typeof entryObject.totalTimeMs === 'number') return entryObject.totalTimeMs;
    return Number.MAX_SAFE_INTEGER;
}

/**
 * Resolves the time value to use for a candidate entry based on kind.
 * @param {'total'|'level'} kind - Leaderboard kind
 * @param {object} candidateEntry - Entry source object
 * @returns {number} Time in milliseconds (0 if not provided)
 */
function resolveTimeValueForKind(kind, candidateEntry) {
    if (kind === 'total') {
        if (typeof candidateEntry.totalTimeMs === 'number') return candidateEntry.totalTimeMs;
        if (typeof candidateEntry.timeMs === 'number') return candidateEntry.timeMs;
        if (typeof candidateEntry.totalMs === 'number') return candidateEntry.totalMs;
        if (typeof candidateEntry.durationMs === 'number') return candidateEntry.durationMs;
        if (typeof candidateEntry.elapsedMs === 'number') return candidateEntry.elapsedMs;
        return 0;
    }
    if (typeof candidateEntry.timeMs === 'number') return candidateEntry.timeMs;
    if (typeof candidateEntry.totalTimeMs === 'number') return candidateEntry.totalTimeMs;
    return 0;
}

/**
 * Resolves points value from an entry, computing from counts if missing.
 * @param {object} candidateEntry - Entry source object
 * @returns {number} Points value
 */
function resolvePointsValue(candidateEntry) {
    if (typeof candidateEntry.points === 'number') return candidateEntry.points;
    return calculateScorePoints(candidateEntry.counts || {});
}

/**
 * Builds the final payload to store for a leaderboard entry.
 * Merges candidate fields with computed points, time, createdAt and sortKey.
 * @param {object} candidateEntry - Original entry data
 * @param {number} pointsValue - Computed points
 * @param {string} timeFieldName - Name of the time field to set
 * @param {number} timeValue - Time in milliseconds
 * @param {number} createdAtMilliseconds - Unix epoch ms when created
 * @param {string} sortKey - Precomputed sortable key
 * @returns {object} Payload ready to save
 */
function buildSavedPayload(candidateEntry, pointsValue, timeFieldName, timeValue, createdAtMilliseconds, sortKey) {
    return {
        ...candidateEntry,
        points: pointsValue,
        [timeFieldName]: timeValue,
        createdAt: createdAtMilliseconds,
        sortKey: sortKey
    };
}

/**
 * Resolves a total time from a flexible input shape.
 * Tries several known field names and falls back to 0.
 * @param {object} input - Source object possibly containing time fields
 * @returns {number} Resolved total time in milliseconds
 */
function resolveTotalTimeFromInput(input) {
    if (typeof input.totalTimeMs === 'number') return input.totalTimeMs;
    if (typeof input.timeMs === 'number') return input.timeMs;
    if (typeof input.totalMs === 'number') return input.totalMs;
    if (typeof input.durationMs === 'number') return input.durationMs;
    if (typeof input.elapsedMs === 'number') return input.elapsedMs;
    return 0;
}