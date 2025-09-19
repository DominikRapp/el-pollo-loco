function formatMilliseconds(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const wholeMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const minutesText = String(wholeMinutes).padStart(2, '0');
    const secondsText = String(remainingSeconds).padStart(2, '0');
    return minutesText + ':' + secondsText;
}

function formatMillisecondsNumber(milliseconds) {
    const totalSeconds = Math.floor((milliseconds || 0) / 1000);
    const wholeMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const minutesText = String(wholeMinutes).padStart(2, '0');
    const secondsText = String(remainingSeconds).padStart(2, '0');
    return minutesText + ':' + secondsText;
}

function attachTimeFormat(app) {
    app.formatMs = function (milliseconds) { return formatMilliseconds(milliseconds); };
    app.formatMsNumber = function (milliseconds) { return formatMillisecondsNumber(milliseconds); };
}
