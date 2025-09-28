let LeaderboardAPI = createLeaderboardApiMain();

/**
 * Creates the public API for the leaderboard module.
 * @returns {object} API with all available leaderboard methods
 */
function createLeaderboardApiMain() {
    return {
        init: leaderboardInit,
        formatTime: LeaderboardCore.formatTime,
        calculatePoints: LeaderboardCore.calculatePoints,
        buildSortKey: LeaderboardCore.buildSortKey,
        fetchTop10: fetchTopTenEntries,
        qualifiesForTop10: qualifiesForTopTen,
        submitIfTop10: submitIfQualifiesForTopTen,
        makeLevelEntry: createLevelEntryPayload,
        makeTotalEntry: createTotalEntryPayload
    };
}

/**
 * Initializes the leaderboard with Firebase.
 * @param {object} initOptions - Initialization options
 * @param {object} initOptions.appConfig - Firebase app configuration
 * @param {string} initOptions.databaseURL - Firebase Realtime Database URL
 * @throws {Error} If Firebase SDK is not loaded
 */
function leaderboardInit(initOptions) {
    ensureFirebaseSdkLoaded();
    const options = normalizeInitOptions(initOptions);
    ensureFirebaseApp(options.appConfig);
    setDatabaseInstance(firebase.database());
    setRootDatabaseUrl(options.databaseURL);
}

/**
 * Fetches the top 10 leaderboard entries.
 * @param {'total'|'level'} kind - Type of leaderboard
 * @param {string} [levelIdentifier] - Level ID if kind is 'level'
 * @returns {Promise<object[]>} List of up to 10 leaderboard entries
 */
async function fetchTopTenEntries(kind, levelIdentifier) {
    const reference = getDatabaseReference(kind, levelIdentifier)
        .orderByChild('sortKey')
        .limitToLast(10);
    const snapshot = await reference.get();
    if (!snapshot.exists()) return [];
    const timeFieldName = LeaderboardCore.getTimeFieldName(kind);
    const entryList = LeaderboardCore.normalizeEntriesTimes(Object.values(snapshot.val() || {}), timeFieldName);
    const sortedList = entryList.sort((a, b) => LeaderboardCore.compareEntries(a, b, timeFieldName));
    return sortedList.slice(0, 10);
}

/**
 * Checks if a new entry qualifies for the top 10.
 * @param {'total'|'level'} kind - Type of leaderboard
 * @param {object} candidateEntry - Entry to check
 * @param {string} [levelIdentifier] - Level ID if kind is 'level'
 * @returns {Promise<boolean>} True if entry qualifies
 */
async function qualifiesForTopTen(kind, candidateEntry, levelIdentifier) {
    const currentTopTen = await fetchTopTenEntries(kind, levelIdentifier);
    if (currentTopTen.length < 10) return true;
    const worstEntry = currentTopTen[currentTopTen.length - 1];
    const timeFieldName = LeaderboardCore.getTimeFieldName(kind);
    const candidateTime = LeaderboardCore.resolveComparableTime(candidateEntry, timeFieldName);
    const worstTime = LeaderboardCore.resolveComparableTime(worstEntry, timeFieldName);
    if (candidateEntry.points > worstEntry.points) return true;
    if (candidateEntry.points === worstEntry.points && candidateTime < worstTime) return true;
    return false;
}

/**
 * Submits the entry only if it qualifies for Top 10.
 * @param {'total'|'level'} kind - Leaderboard type
 * @param {object} candidateEntry - Entry data
 * @param {string} [levelIdentifier] - Level ID for 'level'
 * @returns {Promise<{saved: boolean, rec: boolean, top: object[]}>} 
 * rec=true wenn qualifiziert; saved=true wenn gespeichert
 */
async function submitIfQualifiesForTopTen(kind, candidateEntry, levelIdentifier) {
  const ok = await qualifiesForTopTen(kind, candidateEntry, levelIdentifier);
  if (!ok) return { saved: false, rec: false, top: await fetchTopTenEntries(kind, levelIdentifier) };
  const at = Date.now();
  const tf = LeaderboardCore.getTimeFieldName(kind);
  const tv = LeaderboardCore.resolveTimeValueForKind(kind, candidateEntry);
  const pv = LeaderboardCore.resolvePointsValue(candidateEntry);
  const sk = LeaderboardCore.buildSortKey(pv, tv, at);
  const payload = LeaderboardCore.buildSavedPayload(candidateEntry, pv, tf, tv, at, sk);
  await getDatabaseReference(kind, levelIdentifier).push(payload);
  return { saved: true, rec: true, top: await fetchTopTenEntries(kind, levelIdentifier) };
}

/**
 * Creates a leaderboard entry payload for a single level.
 * @param {object} input - Entry input
 * @param {string} input.name - Player name
 * @param {string} input.level - Level identifier
 * @param {number} input.timeMs - Time in milliseconds
 * @param {object} input.counts - Object with score counts
 * @returns {object} Level entry payload
 */
function createLevelEntryPayload(input) {
    const pointsForEntry = LeaderboardCore.calculatePoints(input.counts);
    const createdAtMilliseconds = Date.now();
    const sortKey = LeaderboardCore.buildSortKey(pointsForEntry, input.timeMs, createdAtMilliseconds);
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

/**
 * Creates a leaderboard entry payload for total progress.
 * @param {object} input - Entry input
 * @param {string} input.name - Player name
 * @param {string} input.highestLevel - Highest level reached
 * @param {number} [input.totalTimeMs] - Total time (optional)
 * @param {object} [input.counts] - Object with score counts
 * @returns {object} Total entry payload
 */
function createTotalEntryPayload(input) {
    const resolvedTotalTime = LeaderboardCore.resolveTotalTimeFromInput(input);
    const safeCounts = input.counts || {};
    const pointsForEntry = LeaderboardCore.calculatePoints(safeCounts);
    const createdAtMilliseconds = Date.now();
    const sortKey = LeaderboardCore.buildSortKey(pointsForEntry, resolvedTotalTime, createdAtMilliseconds);
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

/**
 * Ensures Firebase SDK is available.
 * @throws {Error} If SDK is not loaded
 */
function ensureFirebaseSdkLoaded() {
    const isLoaded = typeof window !== 'undefined' && typeof window.firebase !== 'undefined';
    if (!isLoaded) throw new Error('Firebase SDK not loaded');
}

/**
 * Normalizes initialization options.
 * @param {object} initOptions - User provided options
 * @returns {{appConfig: object, databaseURL: string}}
 */
function normalizeInitOptions(initOptions) {
    const options = initOptions || {};
    return {
        appConfig: options.appConfig || {},
        databaseURL: options.databaseURL || ''
    };
}

/**
 * Ensures a Firebase app is initialized.
 * @param {object} appConfig - Firebase app config
 */
function ensureFirebaseApp(appConfig) {
    if (!firebase.apps.length) firebase.initializeApp(appConfig);
}

let internalDatabaseInstance = null;
let internalRootDatabaseUrl = '';

/**
 * Sets the internal database instance.
 * @param {object} databaseInstance - Firebase database instance
 */
function setDatabaseInstance(databaseInstance) {
    internalDatabaseInstance = databaseInstance;
}

/**
 * Sets the root database URL.
 * @param {string} databaseUrl - Database root URL
 */
function setRootDatabaseUrl(databaseUrl) {
    internalRootDatabaseUrl = databaseUrl || '';
}

/**
 * Returns the correct database reference.
 * @param {'total'|'level'} kind - Leaderboard type
 * @param {string} [levelIdentifier] - Level ID if kind is 'level'
 * @returns {object} Firebase database reference
 * @throws {Error} If database is not initialized or kind is invalid
 */
function getDatabaseReference(kind, levelIdentifier) {
    if (!internalDatabaseInstance) throw new Error('Database not initialized');
    if (kind === 'total') return internalDatabaseInstance.ref('leaderboards/total');
    if (kind === 'level') return internalDatabaseInstance.ref('leaderboards/levels/' + levelIdentifier);
    throw new Error('invalid kind');
}