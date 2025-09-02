(function () {
    const originalSetInterval = window.setInterval;
    const originalClearInterval = window.clearInterval;
    const originalSetTimeout = window.setTimeout;
    const originalClearTimeout = window.clearTimeout;

    const activeIntervals = new Set();
    const activeTimeouts = new Set();

    window.setInterval = function (callbackFunction, milliseconds) {
        const intervalId = originalSetInterval(callbackFunction, milliseconds);
        activeIntervals.add(intervalId);
        return intervalId;
    };

    window.clearInterval = function (intervalId) {
        activeIntervals.delete(intervalId);
        return originalClearInterval(intervalId);
    };

    window.setTimeout = function (callbackFunction, milliseconds) {
        const timeoutId = originalSetTimeout(callbackFunction, milliseconds);
        activeTimeouts.add(timeoutId);
        return timeoutId;
    };

    window.clearTimeout = function (timeoutId) {
        activeTimeouts.delete(timeoutId);
        return originalClearTimeout(timeoutId);
    };

    window.IntervalTracker = {
        clearAll: function () {
            for (const intervalId of activeIntervals) {
                originalClearInterval(intervalId);
            }
            for (const timeoutId of activeTimeouts) {
                originalClearTimeout(timeoutId);
            }
            activeIntervals.clear();
            activeTimeouts.clear();
        },
        count: function () {
            return activeIntervals.size + activeTimeouts.size;
        }
    };
})();