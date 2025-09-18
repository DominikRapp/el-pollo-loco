function buildLeaderboardPagesImpl() {
    const raw = localStorage.getItem('leaderboard_rankings') || '{}';
    let data = {};
    try { data = JSON.parse(raw) || {}; } catch { data = {}; }
    const ensureArr = (x) => Array.isArray(x) ? x.slice(0, 10) : [];
    const total = ensureArr(data.total);
    const levels = {
        1: ensureArr(data.levels && data.levels['1']),
        2: ensureArr(data.levels && data.levels['2']),
        3: ensureArr(data.levels && data.levels['3']),
        4: ensureArr(data.levels && data.levels['4']),
        5: ensureArr(data.levels && data.levels['5'])
    };
    const fmt = (n) => typeof n === 'number' ? String(n) : '–';
    const mmss = (ms) => {
        if (typeof ms !== 'number' || ms < 0) return '–';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    };
    const pts = (c) => {
        const lc = Number(c && c.levelComplete || 0);
        const b = Number(c && c.boss || 0);
        const ch = Number(c && c.chicken || 0);
        const cs = Number(c && c.chickenSmall || 0);
        const bo = Number(c && c.bottle || 0);
        const co = Number(c && c.coin || 0);
        return lc * 10 + b * 5 + ch * 4 + cs * 3 + bo * 2 + co * 1;
    };
    const sortByPointsThenTimeThenCreated = (arr, timeKey) => {
        return arr.slice().sort((a, b) => {
            const pa = pts(a.counts || {}), pb = pts(b.counts || {});
            if (pb !== pa) return pb - pa;
            const ta = typeof a[timeKey] === 'number' ? a[timeKey] : Number.MAX_SAFE_INTEGER;
            const tb = typeof b[timeKey] === 'number' ? b[timeKey] : Number.MAX_SAFE_INTEGER;
            if (ta !== tb) return ta - tb;
            const ca = typeof a.createdAt === 'number' ? a.createdAt : Number.MAX_SAFE_INTEGER;
            const cb = typeof b.createdAt === 'number' ? b.createdAt : Number.MAX_SAFE_INTEGER;
            return ca - cb;
        }).slice(0, 10);
    };
    const isPlaceholder = (e) => Number(e && e.createdAt) === 0;
    const rankRowsTotal = (arr) => {
        const rows = [];
        const sorted = sortByPointsThenTimeThenCreated(arr, 'totalTimeMs');
        sorted.forEach((e, i) => {
            const name = e && e.name ? e.name : 'Player';
            const highest = e && typeof e.highestLevel === 'number' ? e.highestLevel : 0;
            const timeStr = isPlaceholder(e) ? '00:00' : mmss(e && typeof e.totalTimeMs === 'number' ? e.totalTimeMs : null);
            const c = e && e.counts ? e.counts : {};
            const score = pts(c);
            const b = c.boss || 0;
            const ch = c.chicken || 0;
            const cs = c.chickenSmall || 0;
            const bo = c.bottle || 0;
            const co = c.coin || 0;
            rows.push(
                '<tr>'
                + '<td>' + (i + 1) + '.</td>'
                + '<td>' + name + '</td>'
                + '<td>' + fmt(highest) + '</td>'
                + '<td>' + timeStr + '</td>'
                + '<td>' + fmt(score) + '</td>'
                + '<td>' + fmt(b) + '</td>'
                + '<td>' + fmt(ch) + '</td>'
                + '<td>' + fmt(cs) + '</td>'
                + '<td>' + fmt(bo) + '</td>'
                + '<td>' + fmt(co) + '</td>'
                + '</tr>'
            );
        });
        return rows.join('');
    };
    const rankRowsLevel = (arr) => {
        const rows = [];
        const sorted = sortByPointsThenTimeThenCreated(arr, 'timeMs');
        sorted.forEach((e, i) => {
            const name = e && e.name ? e.name : 'Player';
            const timeStr = isPlaceholder(e) ? '00:00' : mmss(e && typeof e.timeMs === 'number' ? e.timeMs : null);
            const c = e && e.counts ? e.counts : {};
            const score = pts(c);
            const b = c.boss || 0;
            const ch = c.chicken || 0;
            const cs = c.chickenSmall || 0;
            const bo = c.bottle || 0;
            const co = c.coin || 0;
            rows.push(
                '<tr>'
                + '<td>' + (i + 1) + '.</td>'
                + '<td>' + name + '</td>'
                + '<td>' + timeStr + '</td>'
                + '<td>' + fmt(score) + '</td>'
                + '<td>' + fmt(b) + '</td>'
                + '<td>' + fmt(ch) + '</td>'
                + '<td>' + fmt(cs) + '</td>'
                + '<td>' + fmt(bo) + '</td>'
                + '<td>' + fmt(co) + '</td>'
                + '</tr>'
            );
        });
        return rows.join('');
    };
    const tableTotal =
        '<table class="leaderboard-table">'
        + '<thead>'
        + '<tr>'
        + '<th>#</th><th>Name</th><th>Höchstes Level</th><th>Gesamtzeit</th><th>Punkte</th>'
        + '<th>Boss</th><th>Chicken</th><th>Chicken Small</th><th>Bottles</th><th>Coins</th>'
        + '</tr>'
        + '</thead>'
        + '<tbody>' + rankRowsTotal(total) + '</tbody>'
        + '</table>';
    const buildLevelTable = (lvl) => {
        return (
            '<table class="leaderboard-table">'
            + '<thead>'
            + '<tr>'
            + '<th>#</th><th>Name</th><th>Zeit</th><th>Punkte</th>'
            + '<th>Boss</th><th>Chicken</th><th>Chicken Small</th><th>Bottles</th><th>Coins</th>'
            + '</tr>'
            + '</thead>'
            + '<tbody>' + rankRowsLevel(levels[lvl]) + '</tbody>'
            + '</table>'
        );
    };
    const pages = [];
    pages.push('<h3>Gesamt</h3>' + tableTotal);
    pages.push('<h3>Level 1</h3>' + buildLevelTable(1));
    pages.push('<h3>Level 2</h3>' + buildLevelTable(2));
    pages.push('<h3>Level 3</h3>' + buildLevelTable(3));
    pages.push('<h3>Level 4</h3>' + buildLevelTable(4));
    pages.push('<h3>Level 5</h3>' + buildLevelTable(5));
    return pages;
}

function attachLeaderboardPages(app) {
    app.buildLeaderboardPages = function () { return buildLeaderboardPagesImpl(); };
}
