function formatMinutesSeconds(milliseconds) {
    if (typeof milliseconds !== 'number' || milliseconds < 0) return '–';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function isPlaceholderEntry(entry, key) {
    const timeValue = Number(entry && entry[key]);
    const createdAt = Number(entry && entry.createdAt);
    return createdAt === 0 || timeValue >= 9999999999;
}

function toTimeText(entry, key) {
    if (!entry) return '–';
    return isPlaceholderEntry(entry, key) ? '00:00' : formatMinutesSeconds(entry[key]);
}

function toTotalRowData(e, i) {
    const name = e?.name || 'Player';
    const level = typeof e?.highestLevel === 'number' ? e.highestLevel : 0;
    const points = typeof e?.points === 'number' ? e.points : 0;
    const time = toTimeText(e, 'totalTimeMs');
    return totalLeaderboardSimpleRowTemplate({ index: i, name, level, points, time });
}

function buildTotalTable(rows) {
    const body = (rows || []).map((e, i) => toTotalRowData(e || {}, i)).join('');
    return totalLeaderboardSimpleTableTemplate(body);
}

function toLevelRowData(levelNumber, e, i) {
    const name = e?.name || 'Player';
    const level = 'L' + String(levelNumber);
    const points = typeof e?.points === 'number' ? e.points : 0;
    const time = toTimeText(e, 'timeMs');
    return levelLeaderboardSimpleRowTemplate({ index: i, name, level, points, time });
}

function buildLevelTable(levelNumber, rows) {
    const body = (rows || []).map((e, i) => toLevelRowData(levelNumber, e || {}, i)).join('');
    return levelLeaderboardSimpleTableTemplate(body);
}

async function buildLeaderboardPages() {
    const pages = [];
    const totalRows = await LeaderboardAPI.fetchTop10('total');
    pages.push('<h3>Total</h3>' + buildTotalTable(totalRows));
    for (let lvl = 1; lvl <= 5; lvl++) {
        const rows = await LeaderboardAPI.fetchTop10('level', lvl);
        pages.push('<h3>Level ' + lvl + '</h3>' + buildLevelTable(lvl, rows));
    }
    return pages;
}

const LeaderboardView = { buildPages: buildLeaderboardPages };
