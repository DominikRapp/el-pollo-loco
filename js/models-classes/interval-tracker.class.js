function wrapSet(originalSet, store) {
    return function (callback, ms) {
        const id = originalSet(callback, ms);
        store.add(id);
        return id;
    };
}

function wrapClear(originalClear, store) {
    return function (id) {
        store.delete(id);
        return originalClear(id);
    };
}

function createTracker(oClearInterval, oClearTimeout, intervals, timeouts) {
    return {
        clearAll() {
            for (const id of intervals) oClearInterval(id);
            for (const id of timeouts) oClearTimeout(id);
            intervals.clear();
            timeouts.clear();
        },
        count() {
            return intervals.size + timeouts.size;
        }
    };
}

(function () {
    const oSI = window.setInterval, oCI = window.clearInterval;
    const oST = window.setTimeout, oCT = window.clearTimeout;
    const intervals = new Set(), timeouts = new Set();
    window.setInterval = wrapSet(oSI, intervals);
    window.clearInterval = wrapClear(oCI, intervals);
    window.setTimeout = wrapSet(oST, timeouts);
    window.clearTimeout = wrapClear(oCT, timeouts);
    window.IntervalTracker = createTracker(oCI, oCT, intervals, timeouts);
})();