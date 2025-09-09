const LeaderboardAPI = (() => {
    let db = null;
    let rootUrl = '';

    const init = ({ appConfig, databaseURL }) => {
        if (!window.firebase) throw new Error('Firebase SDK not loaded');
        if (!firebase.apps.length) firebase.initializeApp(appConfig || {});
        db = firebase.database();
        rootUrl = databaseURL || '';
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        return `${m}:${s}`;
    };

    const calculatePoints = ({ levelComplete = 0, boss = 0, chicken = 0, chickenSmall = 0, bottle = 0, coin = 0 }) => {
        const p = levelComplete * 10 + boss * 5 + chicken * 4 + chickenSmall * 3 + bottle * 2 + coin * 1;
        return p;
    };

    const buildSortKey = (points, timeMs, name) => {
        const p = String(points).padStart(6, '0');
        const maxTime = 9999999999;
        const ti = Math.max(0, maxTime - Math.min(maxTime, timeMs));
        const t = String(ti).padStart(10, '0');
        const n = String(name || '').toLowerCase();
        return `${p}:${t}:${n}`;
    };

    const getRef = (kind, level) => {
        if (kind === 'total') return db.ref('leaderboards/total');
        if (kind === 'level') return db.ref(`leaderboards/levels/${level}`);
        throw new Error('invalid kind');
    };

    const fetchTop10 = async (kind, level) => {
        const ref = getRef(kind, level).orderByChild('sortKey').limitToLast(10);
        const snap = await ref.get();
        if (!snap.exists()) return [];
        let rows = Object.values(snap.val() || {});
        const timeField = kind === 'total' ? 'totalTimeMs' : 'timeMs';
        rows = rows.map(e => {
            const t = typeof e[timeField] === 'number' ? e[timeField] :
                (typeof e.timeMs === 'number' ? e.timeMs :
                    (typeof e.totalTimeMs === 'number' ? e.totalTimeMs : Number.MAX_SAFE_INTEGER));
            return {
                ...e,
                [timeField]: t,
                timeMs: typeof e.timeMs === 'number' ? e.timeMs : t,
                totalTimeMs: typeof e.totalTimeMs === 'number' ? e.totalTimeMs : t
            };
        });
        rows.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const ta = a[timeField];
            const tb = b[timeField];
            if (ta !== tb) return ta - tb;
            return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
        });
        return rows.slice(0, 10);
    };

    const qualifiesForTop10 = async (kind, candidate, level) => {
        const top = await fetchTop10(kind, level);
        if (top.length < 10) return true;
        const worst = top[top.length - 1];
        const timeField = kind === 'total' ? 'totalTimeMs' : 'timeMs';
        const cTime = typeof candidate[timeField] === 'number' ? candidate[timeField] :
            (typeof candidate.timeMs === 'number' ? candidate.timeMs :
                (typeof candidate.totalTimeMs === 'number' ? candidate.totalTimeMs : Number.MAX_SAFE_INTEGER));
        const wTime = typeof worst[timeField] === 'number' ? worst[timeField] :
            (typeof worst.timeMs === 'number' ? worst.timeMs :
                (typeof worst.totalTimeMs === 'number' ? worst.totalTimeMs : Number.MAX_SAFE_INTEGER));
        if (candidate.points > worst.points) return true;
        if (candidate.points === worst.points && cTime < wTime) return true;
        return false;
    };

    const submitIfTop10 = async (kind, candidate, level) => {
        const now = firebase.database.ServerValue.TIMESTAMP;
        const payload = { ...candidate, createdAt: now };
        await getRef(kind, level).push(payload);
        const top = await fetchTop10(kind, level);
        return { saved: true, rec: true, top };
    };

    const makeLevelEntry = ({ name, level, timeMs, counts }) => {
        const points = calculatePoints(counts);
        const sortKey = buildSortKey(points, timeMs, name);
        return { name, level, timeMs, counts, points, sortKey };
    };

    const makeTotalEntry = ({ name, highestLevel, totalTimeMs, counts }) => {
        const points = calculatePoints(counts);
        const sortKey = buildSortKey(points, totalTimeMs, name);
        return { name, highestLevel, totalTimeMs, counts, points, sortKey };
    };

    return {
        init,
        formatTime,
        calculatePoints,
        buildSortKey,
        fetchTop10,
        qualifiesForTop10,
        submitIfTop10,
        makeLevelEntry,
        makeTotalEntry
    };
})();
