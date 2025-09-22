/**
 * Calls the original set* and stores the returned id.
 * @param {Function} originalSet
 * @param {Set<number>} store
 * @param {...any} args
 * @returns {number}
 */
function setWithStore(originalSet, store, ...args) {
    const id = originalSet(...args);
    store.add(id);
    return id;
}

/**
 * Calls the original clear* and removes the id from the store.
 * @param {Function} originalClear
 * @param {Set<number>} store
 * @param {number} id
 * @returns {void}
 */
function clearWithStore(originalClear, store, id) {
    store.delete(id);
    return originalClear(id);
}

/**
 * Creates a tracker object for clearing/counting timers.
 * @param {Function} oClearInterval
 * @param {Function} oClearTimeout
 * @param {Set<number>} intervals
 * @param {Set<number>} timeouts
 * @returns {{clearAll: Function, count: Function}}
 */
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

/**
 * Creates bound wrappers for set/clear and a tracker.
 * @param {Window} win
 * @returns {{
 *  setInterval: Function,
 *  clearInterval: Function,
 *  setTimeout: Function,
 *  clearTimeout: Function,
 *  tracker: {clearAll: Function, count: Function}
 * }}
 */
function createTrackedTimerBindings(win) {
    const oSI = win.setInterval, oCI = win.clearInterval;
    const oST = win.setTimeout, oCT = win.clearTimeout;
    const intervals = new Set(), timeouts = new Set();

    return {
        setInterval: (...args) => setWithStore(oSI, intervals, ...args),
        clearInterval: (id) => clearWithStore(oCI, intervals, id),
        setTimeout: (...args) => setWithStore(oST, timeouts, ...args),
        clearTimeout: (id) => clearWithStore(oCT, timeouts, id),
        tracker: createTracker(oCI, oCT, intervals, timeouts)
    };
}

/**
 * Installs the tracked wrappers on window.
 */
(function installIntervalTracker() {
    const bindings = createTrackedTimerBindings(window);
    window.setInterval = bindings.setInterval;
    window.clearInterval = bindings.clearInterval;
    window.setTimeout = bindings.setTimeout;
    window.clearTimeout = bindings.clearTimeout;
    window.IntervalTracker = bindings.tracker;
})();