/**
 * Formats a time value in milliseconds as "MM:SS".
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} "MM:SS"
 */
function formatMilliseconds(milliseconds) {
    return msToTimeString(milliseconds);
}

/**
 * Formats a time value in milliseconds as "MM:SS".
 * Falsy inputs are treated as 0.
 * @param {number} milliseconds - Time in milliseconds (falsy → 0)
 * @returns {string} "MM:SS"
 */
function formatMillisecondsNumber(milliseconds) {
    return msToTimeString(milliseconds || 0);
}

/**
 * Attaches time-formatting helpers to the app context.
 * @param {object} app - The application context to extend
 */
function attachTimeFormat(app) {
    app.formatMs = function (milliseconds) { return formatMilliseconds(milliseconds); };
    app.formatMsNumber = function (milliseconds) { return formatMillisecondsNumber(milliseconds); };
}

/**
 * Converts milliseconds to "MM:SS" (expects a number).
 * @param {number} ms - Time in milliseconds
 * @returns {string} "MM:SS"
 */
function msToTimeString(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const wholeMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return String(wholeMinutes).padStart(2, '0') + ':' + String(remainingSeconds).padStart(2, '0');
}