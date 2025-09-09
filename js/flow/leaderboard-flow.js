const LeaderboardFlow = (() => {
    const text = (s) => document.createTextNode(String(s));
    const clearEl = (el) => { while (el.firstChild) el.removeChild(el.firstChild); };
    const badgeREC = () => {
        const b = document.createElement('span');
        b.textContent = 'REC';
        b.className = 'lb-rec';
        return b;
    };
    const rowLine = ({ name, level, points, time }) => {
        const line = document.createElement('div');
        line.className = 'lb-line';
        const a = document.createElement('span');
        a.className = 'lb-name';
        a.appendChild(text(name));
        const b = document.createElement('span');
        b.className = 'lb-level';
        b.appendChild(text(level));
        const c = document.createElement('span');
        c.className = 'lb-points';
        c.appendChild(text(points));
        const d = document.createElement('span');
        d.className = 'lb-time';
        d.appendChild(text(time));
        line.appendChild(a);
        line.appendChild(b);
        line.appendChild(c);
        line.appendChild(d);
        return line;
    };

    const showLevelIntermediate = async ({ containerId, name, level, timeMs, counts }) => {
        const container = document.getElementById(containerId);
        if (!container) return { saved: false, rec: false, entry: null };
        const entry = LeaderboardAPI.makeLevelEntry({ name, level, timeMs, counts });
        const clearEl = (el) => { while (el.firstChild) el.removeChild(el.firstChild); };
        const rowLine = ({ name, level, points, time }) => {
            const line = document.createElement('div');
            line.className = 'lb-line';
            const a = document.createElement('span'); a.className = 'lb-name'; a.textContent = name;
            const b = document.createElement('span'); b.className = 'lb-level'; b.textContent = 'L' + level;
            const c = document.createElement('span'); c.className = 'lb-points'; c.textContent = String(points);
            const d = document.createElement('span'); d.className = 'lb-time'; d.textContent = LeaderboardAPI.formatTime(time);
            line.appendChild(a); line.appendChild(b); line.appendChild(c); line.appendChild(d);
            return line;
        };
        clearEl(container);
        const line = rowLine({ name: entry.name, level: entry.level, points: entry.points, time: entry.timeMs });
        container.appendChild(line);
        const res = await LeaderboardAPI.submitIfTop10('level', entry, level);
        clearEl(container);
        const line2 = rowLine({ name: entry.name, level: entry.level, points: entry.points, time: entry.timeMs });
        container.appendChild(line2);
        return { saved: res.saved, rec: res.rec, entry };
    };



    const showTotalFinal = async ({ containerId, name, highestLevel, totalTimeMs, counts }) => {
        const container = document.getElementById(containerId);
        if (!container) return { saved: false, rec: false, entry: null };
        const entry = LeaderboardAPI.makeTotalEntry({ name, highestLevel, totalTimeMs, counts });
        const clearEl = (el) => { while (el.firstChild) el.removeChild(el.firstChild); };
        const rowLine = ({ name, level, points, time }) => {
            const line = document.createElement('div');
            line.className = 'lb-line';
            const a = document.createElement('span'); a.className = 'lb-name'; a.textContent = name;
            const b = document.createElement('span'); b.className = 'lb-level'; b.textContent = 'L' + level;
            const c = document.createElement('span'); c.className = 'lb-points'; c.textContent = String(points);
            const d = document.createElement('span'); d.className = 'lb-time'; d.textContent = LeaderboardAPI.formatTime(time);
            line.appendChild(a); line.appendChild(b); line.appendChild(c); line.appendChild(d);
            return line;
        };
        clearEl(container);
        const line = rowLine({ name: entry.name, level: entry.highestLevel, points: entry.points, time: entry.totalTimeMs });
        container.appendChild(line);
        const res = await LeaderboardAPI.submitIfTop10('total', entry);
        clearEl(container);
        const line2 = rowLine({ name: entry.name, level: entry.highestLevel, points: entry.points, time: entry.totalTimeMs });
        container.appendChild(line2);
        return { saved: res.saved, rec: res.rec, entry };
    };


    const previewTotalOnly = ({ containerId, name, highestLevel, totalTimeMs, counts }) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const entry = LeaderboardAPI.makeTotalEntry({ name, highestLevel, totalTimeMs, counts });
        clearEl(container);
        const line = rowLine({ name: entry.name, level: `L${highestLevel}`, points: entry.points, time: LeaderboardAPI.formatTime(entry.totalTimeMs) });
        container.appendChild(line);
        return entry;
    };

    return { showLevelIntermediate, showTotalFinal, previewTotalOnly };
})();
