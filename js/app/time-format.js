/**
 * Formats a time value in milliseconds as "MM:SS".
 * Values are floored to whole seconds (no rounding).
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time string in "MM:SS"
 */
function formatMilliseconds(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const wholeMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const minutesText = String(wholeMinutes).padStart(2, '0');
    const secondsText = String(remainingSeconds).padStart(2, '0');
    return minutesText + ':' + secondsText;
}

/**
 * Formats a time value in milliseconds as "MM:SS".
 * Safely handles falsy inputs by treating them as 0.
 * @param {number} milliseconds - Time in milliseconds (falsy values treated as 0)
 * @returns {string} Formatted time string in "MM:SS"
 */
function formatMillisecondsNumber(milliseconds) {
    const totalSeconds = Math.floor((milliseconds || 0) / 1000);
    const wholeMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const minutesText = String(wholeMinutes).padStart(2, '0');
    const secondsText = String(remainingSeconds).padStart(2, '0');
    return minutesText + ':' + secondsText;
}

/**
 * Attaches time-formatting helpers to the app context.
 * After attaching:
 * - app.formatMs(ms) -> "MM:SS"
 * - app.formatMsNumber(ms) -> "MM:SS" (treats falsy ms as 0)
 * @param {object} app - The application context to extend
 */
function attachTimeFormat(app) {
    app.formatMs = function (milliseconds) { return formatMilliseconds(milliseconds); };
    app.formatMsNumber = function (milliseconds) { return formatMillisecondsNumber(milliseconds); };
}