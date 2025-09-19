let LeaderboardAPI = createLeaderboardApiMain();

function createLeaderboardApiMain() {
    return {
        init: leaderboardInit,
        formatTime: formatMillisecondsAsClock,
        calculatePoints: calculateScorePoints,
        buildSortKey: buildSortableKeyMain,
        fetchTop10: fetchTopTenEntries,
        qualifiesForTop10: qualifiesForTopTen,
        submitIfTop10: submitIfQualifiesForTopTen,
        makeLevelEntry: createLevelEntryPayload,
        makeTotalEntry: createTotalEntryPayload
    };
}

function leaderboardInit(initOptions) {
    ensureFirebaseSdkLoaded();
    const options = normalizeInitOptions(initOptions);
    ensureFirebaseApp(options.appConfig);
    setDatabaseInstance(firebase.database());
    setRootDatabaseUrl(options.databaseURL);
}

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

function calculateScorePoints(countsObject = {}) {
    const {
        levelComplete = 0,
        boss = 0,
        chicken = 0,
        chickenSmall = 0,
        bottle = 0,
        coin = 0
    } = countsObject || {};
    const totalPoints =
        levelComplete * 10 +
        boss * 5 +
        chicken * 4 +
        chickenSmall * 3 +
        bottle * 2 +
        coin * 1;
    return totalPoints;
}

function buildSortableKeyMain(pointsValue, timeMilliseconds, createdAtMilliseconds) {
    const paddedPoints = padNonNegativeInteger(pointsValue, 6);
    const paddedInvertedTime = invertAndPad(timeMilliseconds, 9999999999, 10);
    const paddedInvertedCreated = invertAndPad(createdAtMilliseconds, 9999999999999, 13);
    return paddedPoints + ':' + paddedInvertedTime + ':' + paddedInvertedCreated;
}

async function fetchTopTenEntries(kind, levelIdentifier) {
    const reference = getDatabaseReference(kind, levelIdentifier)
        .orderByChild('sortKey')
        .limitToLast(10);
    const snapshot = await reference.get();
    if (!snapshot.exists()) return [];
    const timeFieldName = getTimeFieldName(kind);
    const entryList = normalizeEntriesTimes(Object.values(snapshot.val() || {}), timeFieldName);
    const sortedList = entryList.sort((a, b) => compareEntries(a, b, timeFieldName));
    return sortedList.slice(0, 10);
}

async function qualifiesForTopTen(kind, candidateEntry, levelIdentifier) {
    const currentTopTen = await fetchTopTenEntries(kind, levelIdentifier);
    if (currentTopTen.length < 10) return true;
    const worstEntry = currentTopTen[currentTopTen.length - 1];
    const timeFieldName = getTimeFieldName(kind);
    const candidateTime = resolveComparableTime(candidateEntry, timeFieldName);
    const worstTime = resolveComparableTime(worstEntry, timeFieldName);
    if (candidateEntry.points > worstEntry.points) return true;
    if (candidateEntry.points === worstEntry.points && candidateTime < worstTime) return true;
    return false;
}

async function submitIfQualifiesForTopTen(kind, candidateEntry, levelIdentifier) {
    const createdAtMilliseconds = Date.now();
    const timeFieldName = getTimeFieldName(kind);
    const timeValue = resolveTimeValueForKind(kind, candidateEntry);
    const pointsValue = resolvePointsValue(candidateEntry);
    const sortKey = buildSortableKeyMain(pointsValue, timeValue, createdAtMilliseconds);
    const payloadToSave = buildSavedPayload(candidateEntry, pointsValue, timeFieldName, timeValue, createdAtMilliseconds, sortKey);
    await getDatabaseReference(kind, levelIdentifier).push(payloadToSave);
    const updatedTopTen = await fetchTopTenEntries(kind, levelIdentifier);
    return { saved: true, rec: true, top: updatedTopTen };
}

function createLevelEntryPayload(input) {
    const pointsForEntry = calculateScorePoints(input.counts);
    const createdAtMilliseconds = Date.now();
    const sortKey = buildSortableKeyMain(pointsForEntry, input.timeMs, createdAtMilliseconds);
    return {
        name: input.name,
        level: input.level,
        timeMs: input.timeMs,
        counts: input.counts,
        points: pointsForEntry,
        sortKey: sortKey,
        createdAt: createdAtMilliseconds
    };
}

function createTotalEntryPayload(input) {
    const resolvedTotalTime = resolveTotalTimeFromInput(input);
    const safeCounts = input.counts || {};
    const pointsForEntry = calculateScorePoints(safeCounts);
    const createdAtMilliseconds = Date.now();
    const sortKey = buildSortableKeyMain(pointsForEntry, resolvedTotalTime, createdAtMilliseconds);
    return {
        name: input.name,
        highestLevel: input.highestLevel,
        totalTimeMs: resolvedTotalTime,
        counts: safeCounts,
        points: pointsForEntry,
        sortKey: sortKey,
        createdAt: createdAtMilliseconds
    };
}

function ensureFirebaseSdkLoaded() {
    const isLoaded = typeof window !== 'undefined' && typeof window.firebase !== 'undefined';
    if (!isLoaded) throw new Error('Firebase SDK not loaded');
}

function normalizeInitOptions(initOptions) {
    const options = initOptions || {};
    return {
        appConfig: options.appConfig || {},
        databaseURL: options.databaseURL || ''
    };
}

function ensureFirebaseApp(appConfig) {
    if (!firebase.apps.length) firebase.initializeApp(appConfig);
}

function padNonNegativeInteger(value, width) {
    const integerValue = Math.max(0, Math.floor(value || 0));
    return String(integerValue).padStart(width, '0');
}

function invertAndPad(rawValue, maxValue, width) {
    const bounded = Math.min(maxValue, Math.max(0, Math.floor(rawValue || 0)));
    const inverted = maxValue - bounded;
    return padNonNegativeInteger(inverted, width);
}

function getTimeFieldName(kind) {
    return kind === 'total' ? 'totalTimeMs' : 'timeMs';
}

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

function compareEntries(leftEntry, rightEntry, timeFieldName) {
    if (rightEntry.points !== leftEntry.points) return rightEntry.points - leftEntry.points;
    const leftTime = leftEntry[timeFieldName];
    const rightTime = rightEntry[timeFieldName];
    if (leftTime !== rightTime) return leftTime - rightTime;
    const leftCreated = typeof leftEntry.createdAt === 'number' ? leftEntry.createdAt : Number.MAX_SAFE_INTEGER;
    const rightCreated = typeof rightEntry.createdAt === 'number' ? rightEntry.createdAt : Number.MAX_SAFE_INTEGER;
    return leftCreated - rightCreated;
}

function resolveComparableTime(entryObject, timeFieldName) {
    if (typeof entryObject[timeFieldName] === 'number') return entryObject[timeFieldName];
    if (typeof entryObject.timeMs === 'number') return entryObject.timeMs;
    if (typeof entryObject.totalTimeMs === 'number') return entryObject.totalTimeMs;
    return Number.MAX_SAFE_INTEGER;
}

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

function resolvePointsValue(candidateEntry) {
    if (typeof candidateEntry.points === 'number') return candidateEntry.points;
    return calculateScorePoints(candidateEntry.counts || {});
}

function buildSavedPayload(candidateEntry, pointsValue, timeFieldName, timeValue, createdAtMilliseconds, sortKey) {
    return {
        ...candidateEntry,
        points: pointsValue,
        [timeFieldName]: timeValue,
        createdAt: createdAtMilliseconds,
        sortKey: sortKey
    };
}

function resolveTotalTimeFromInput(input) {
    if (typeof input.totalTimeMs === 'number') return input.totalTimeMs;
    if (typeof input.timeMs === 'number') return input.timeMs;
    if (typeof input.totalMs === 'number') return input.totalMs;
    if (typeof input.durationMs === 'number') return input.durationMs;
    if (typeof input.elapsedMs === 'number') return input.elapsedMs;
    return 0;
}

let internalDatabaseInstance = null;
let internalRootDatabaseUrl = '';

function setDatabaseInstance(databaseInstance) {
    internalDatabaseInstance = databaseInstance;
}

function setRootDatabaseUrl(databaseUrl) {
    internalRootDatabaseUrl = databaseUrl || '';
}

function getDatabaseReference(kind, levelIdentifier) {
    if (!internalDatabaseInstance) throw new Error('Database not initialized');
    if (kind === 'total') return internalDatabaseInstance.ref('leaderboards/total');
    if (kind === 'level') return internalDatabaseInstance.ref('leaderboards/levels/' + levelIdentifier);
    throw new Error('invalid kind');
}