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
        const n = Number(ms);
        if (!Number.isFinite(n)) return '–';
        if (n >= 9999999999) return '00:00';
        const totalSeconds = Math.max(0, Math.floor(n / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    };


    const calculatePoints = (c = {}) => {
        const {
            levelComplete = 0,
            boss = 0,
            chicken = 0,
            chickenSmall = 0,
            bottle = 0,
            coin = 0
        } = c || {};
        const p = levelComplete * 10 + boss * 5 + chicken * 4 + chickenSmall * 3 + bottle * 2 + coin * 1;
        return p;
    };


    const buildSortKey = (points, timeMs, createdAtMs) => {
        const pad = (n, w) => String(Math.max(0, Math.floor(n || 0))).padStart(w, '0');
        const p = pad(points, 6);
        const tMax = 9999999999;
        const t = pad(tMax - Math.min(tMax, Math.max(0, Math.floor(timeMs || 0))), 10);
        const cMax = 9999999999999;
        const c = pad(cMax - Math.min(cMax, Math.max(0, Math.floor(createdAtMs || 0))), 13);
        return `${p}:${t}:${c}`;
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
            const ta = a[timeField], tb = b[timeField];
            if (ta !== tb) return ta - tb;
            const ca = typeof a.createdAt === 'number' ? a.createdAt : Number.MAX_SAFE_INTEGER;
            const cb = typeof b.createdAt === 'number' ? b.createdAt : Number.MAX_SAFE_INTEGER;
            return ca - cb;
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
        const createdAt = Date.now();
        const timeField = kind === 'total' ? 'totalTimeMs' : 'timeMs';
        let timeVal;

        if (kind === 'total') {
            timeVal =
                (typeof candidate.totalTimeMs === 'number' ? candidate.totalTimeMs : undefined) ??
                (typeof candidate.timeMs === 'number' ? candidate.timeMs : undefined) ??
                (typeof candidate.totalMs === 'number' ? candidate.totalMs : undefined) ??
                (typeof candidate.durationMs === 'number' ? candidate.durationMs : undefined) ??
                (typeof candidate.elapsedMs === 'number' ? candidate.elapsedMs : undefined) ?? 0;
        } else {
            timeVal =
                (typeof candidate.timeMs === 'number' ? candidate.timeMs : undefined) ??
                (typeof candidate.totalTimeMs === 'number' ? candidate.totalTimeMs : undefined) ?? 0;
        }

        const points = typeof candidate.points === 'number' ? candidate.points : calculatePoints(candidate.counts || {});
        const sortKey = buildSortKey(points, timeVal, createdAt);
        const payload = { ...candidate, points, [timeField]: timeVal, createdAt, sortKey };
        await getRef(kind, level).push(payload);
        const top = await fetchTop10(kind, level);
        return { saved: true, rec: true, top };
    };


    const makeLevelEntry = ({ name, level, timeMs, counts }) => {
        const points = calculatePoints(counts);
        const createdAt = Date.now();
        const sortKey = buildSortKey(points, timeMs, createdAt);
        return { name, level, timeMs, counts, points, sortKey, createdAt };
    };

    const makeTotalEntry = ({ name, highestLevel, totalTimeMs, counts, timeMs, totalMs, durationMs, elapsedMs }) => {
        const t =
            (typeof totalTimeMs === 'number' ? totalTimeMs : undefined) ??
            (typeof timeMs === 'number' ? timeMs : undefined) ??
            (typeof totalMs === 'number' ? totalMs : undefined) ??
            (typeof durationMs === 'number' ? durationMs : undefined) ??
            (typeof elapsedMs === 'number' ? elapsedMs : undefined) ?? 0;

        const safeCounts = counts || {};
        const points = calculatePoints(safeCounts);
        const createdAt = Date.now();
        const sortKey = buildSortKey(points, t, createdAt);
        return { name, highestLevel, totalTimeMs: t, counts: safeCounts, points, sortKey, createdAt };
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
