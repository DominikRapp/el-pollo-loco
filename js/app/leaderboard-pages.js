function attachLeaderboardPages(app) {
    app.buildLeaderboardPages = function () { return buildLeaderboardPages(); };
}

function buildLeaderboardPages() {
    const rawData = readStoredLeaderboardJson();
    const totalEntries = ensureTop10Array(rawData.total);
    const levelEntries = buildLevelEntries(rawData.levels);
    const pages = [];
    pages.push('<h3>Gesamt</h3>' + buildTotalTableHtml(totalEntries));
    for (let levelNumber = 1; levelNumber <= 5; levelNumber++) {
        pages.push('<h3>Level ' + levelNumber + '</h3>' + buildLevelTableHtml(levelEntries[levelNumber]));
    }
    return pages;
}

function readStoredLeaderboardJson() {
    const rawJson = localStorage.getItem('leaderboard_rankings') || '{}';
    try { return JSON.parse(rawJson) || {}; } catch { return {}; }
}

function ensureTop10Array(candidate) {
    if (!Array.isArray(candidate)) return [];
    return candidate.slice(0, 10);
}

function buildLevelEntries(levelsObject) {
    const levels = levelsObject || {};
    return {
        1: ensureTop10Array(levels['1']),
        2: ensureTop10Array(levels['2']),
        3: ensureTop10Array(levels['3']),
        4: ensureTop10Array(levels['4']),
        5: ensureTop10Array(levels['5'])
    };
}

function formatNumberOrDash(value) {
    return (typeof value === 'number') ? String(value) : '–';
}

function formatMillisecondsToMMSS(milliseconds) {
    if (typeof milliseconds !== 'number' || milliseconds < 0) return '–';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function computePointsFromCounts(counts) {
    const c = counts || {};
    const levelComplete = Number(c.levelComplete || 0);
    const boss = Number(c.boss || 0);
    const chicken = Number(c.chicken || 0);
    const chickenSmall = Number(c.chickenSmall || 0);
    const bottle = Number(c.bottle || 0);
    const coin = Number(c.coin || 0);
    return levelComplete * 10 + boss * 5 + chicken * 4 + chickenSmall * 3 + bottle * 2 + coin * 1;
}

function sortByPointsTimeCreated(entryArray, timeFieldName) {
    const copy = (entryArray || []).slice();
    copy.sort((a, b) => compareEntries(a, b, timeFieldName));
    return copy.slice(0, 10);
}

function compareEntries(left, right, timeFieldName) {
    const leftPoints = computePointsFromCounts((left && left.counts) || {});
    const rightPoints = computePointsFromCounts((right && right.counts) || {});
    if (rightPoints !== leftPoints) return rightPoints - leftPoints;
    const leftTime = (typeof left?.[timeFieldName] === 'number') ? left[timeFieldName] : Number.MAX_SAFE_INTEGER;
    const rightTime = (typeof right?.[timeFieldName] === 'number') ? right[timeFieldName] : Number.MAX_SAFE_INTEGER;
    if (leftTime !== rightTime) return leftTime - rightTime;
    const leftCreated = (typeof left?.createdAt === 'number') ? left.createdAt : Number.MAX_SAFE_INTEGER;
    const rightCreated = (typeof right?.createdAt === 'number') ? right.createdAt : Number.MAX_SAFE_INTEGER;
    return leftCreated - rightCreated;
}

function isPlaceholderEntry(entry) {
    return Number(entry && entry.createdAt) === 0;
}

function buildTotalTableHtml(entries) {
    const rows = buildTotalRowsHtml(entries);
    return totalLeaderboardTableTemplate(rows);
}

function buildTotalRowsHtml(entries) {
    const sorted = sortByPointsTimeCreated(entries, 'totalTimeMs');
    const parts = [];
    sorted.forEach((entry, index) => parts.push(buildTotalRowHtml(entry, index)));
    return parts.join('');
}

function buildTotalRowHtml(entry, index) {
    const name = entry?.name || 'Player';
    const highestLevel = (typeof entry?.highestLevel === 'number') ? entry.highestLevel : 0;
    const counts = entry?.counts || {};
    const points = computePointsFromCounts(counts);
    const boss = counts.boss || 0;
    const chicken = counts.chicken || 0;
    const chickenSmall = counts.chickenSmall || 0;
    const bottle = counts.bottle || 0;
    const coin = counts.coin || 0;
    const timeText = isPlaceholderEntry(entry) ? '00:00' : formatMillisecondsToMMSS(typeof entry?.totalTimeMs === 'number' ? entry.totalTimeMs : null);
    const d = {
        index, name, highestLevel: formatNumberOrDash(highestLevel), timeText, points: formatNumberOrDash(points), boss: formatNumberOrDash(boss),
        chicken: formatNumberOrDash(chicken), chickenSmall: formatNumberOrDash(chickenSmall), bottle: formatNumberOrDash(bottle), coin: formatNumberOrDash(coin)
    };
    return totalLeaderboardRowTemplate(d);
}


function buildLevelTableHtml(entries) {
    const rows = buildLevelRowsHtml(entries);
    return levelLeaderboardTableTemplate(rows);
}

function buildLevelRowsHtml(entries) {
    const sorted = sortByPointsTimeCreated(entries, 'timeMs');
    const parts = [];
    sorted.forEach((entry, index) => parts.push(buildLevelRowHtml(entry, index)));
    return parts.join('');
}

function buildLevelRowHtml(entry, index) {
    const name = entry?.name || 'Player';
    const counts = entry?.counts || {};
    const points = computePointsFromCounts(counts);
    const boss = counts.boss || 0;
    const chicken = counts.chicken || 0;
    const chickenSmall = counts.chickenSmall || 0;
    const bottle = counts.bottle || 0;
    const coin = counts.coin || 0;
    const timeText = isPlaceholderEntry(entry) ? '00:00' : formatMillisecondsToMMSS(typeof entry?.timeMs === 'number' ? entry.timeMs : null);
    const d = {
        index, name, timeText, points: formatNumberOrDash(points), boss: formatNumberOrDash(boss),
        chicken: formatNumberOrDash(chicken), chickenSmall: formatNumberOrDash(chickenSmall), bottle: formatNumberOrDash(bottle), coin: formatNumberOrDash(coin)
    };
    return levelLeaderboardRowTemplate(d);
}

