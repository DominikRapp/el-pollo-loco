const LeaderboardView = (() => {
    const mmss = (ms) => {
        if (typeof ms !== 'number' || ms < 0) return '–';
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const r = s % 60;
        return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
    };

    const buildTotalTable = (rows) => {
        const head = '<table class="leaderboard-table"><thead><tr><th>#</th><th>Name</th><th>Highest Level</th><th>Points</th><th>Time</th></tr></thead><tbody>';
        let body = '';
        for (let i = 0; i < rows.length; i++) {
            const e = rows[i] || {};
            const name = e.name || 'Player';
            const lvl = typeof e.highestLevel === 'number' ? e.highestLevel : 0;
            const pts = typeof e.points === 'number' ? e.points : 0;
            const time = mmss(typeof e.totalTimeMs === 'number' ? e.totalTimeMs : null);
            body += '<tr><td>' + (i + 1) + '.</td><td>' + name + '</td><td>' + lvl + '</td><td>' + pts + '</td><td>' + time + '</td></tr>';
        }
        return head + body + '</tbody></table>';
    };

    const buildLevelTable = (level, rows) => {
        const head = '<table class="leaderboard-table"><thead><tr><th>#</th><th>Name</th><th>Level</th><th>Points</th><th>Time</th></tr></thead><tbody>';
        let body = '';
        for (let i = 0; i < rows.length; i++) {
            const e = rows[i] || {};
            const name = e.name || 'Player';
            const lvl = 'L' + String(level);
            const pts = typeof e.points === 'number' ? e.points : 0;
            const time = mmss(typeof e.timeMs === 'number' ? e.timeMs : null);
            body += '<tr><td>' + (i + 1) + '.</td><td>' + name + '</td><td>' + lvl + '</td><td>' + pts + '</td><td>' + time + '</td></tr>';
        }
        return head + body + '</tbody></table>';
    };

    const buildPages = async () => {
        const pages = [];
        const total = await LeaderboardAPI.fetchTop10('total');
        pages.push('<h3>Total</h3>' + buildTotalTable(total));
        for (let lvl = 1; lvl <= 5; lvl++) {
            const rows = await LeaderboardAPI.fetchTop10('level', lvl);
            pages.push('<h3>Level ' + lvl + '</h3>' + buildLevelTable(lvl, rows));
        }
        return pages;
    };

    return { buildPages };
})();
