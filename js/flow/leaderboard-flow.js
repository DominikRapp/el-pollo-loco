const LeaderboardFlow = (() => {
    const text = (s) => document.createTextNode(String(s));
    const clearEl = (el) => { while (el.firstChild) el.removeChild(el.firstChild); };
    const rowLine = ({ name, level, points, time }) => {
        const line = document.createElement('div');
        line.className = 'lb-line';
        const a = document.createElement('span'); a.className = 'lb-name'; a.appendChild(text(name));
        const b = document.createElement('span'); b.className = 'lb-level'; b.appendChild(text(level));
        const c = document.createElement('span'); c.className = 'lb-points'; c.appendChild(text(points));
        const d = document.createElement('span'); d.className = 'lb-time'; d.appendChild(text(time));
        line.appendChild(a); line.appendChild(b); line.appendChild(c); line.appendChild(d);
        return line;
    };

    const showLevelIntermediate = async ({ containerId, name, level, timeMs, counts }) => {
        const container = document.getElementById(containerId);
        if (!container) return { saved: false, entry: null };
        const entry = LeaderboardAPI.makeLevelEntry({ name, level, timeMs, counts });

        const localLine = ({ name, level, points, time }) => {
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
        container.appendChild(localLine({ name: entry.name, level: entry.level, points: entry.points, time: entry.timeMs }));
        const res = await LeaderboardAPI.submitIfTop10('level', entry, level);
        clearEl(container);
        container.appendChild(localLine({ name: entry.name, level: entry.level, points: entry.points, time: entry.timeMs }));
        return { saved: res.saved, entry };
    };

    const showTotalFinal = async ({ name, highestLevel, totalTimeMs, counts }) => {
        const entry = LeaderboardAPI.makeTotalEntry({ name, highestLevel, totalTimeMs, counts });
        console.log('LB total submit →', entry);
        const res = await LeaderboardAPI.submitIfTop10('total', entry);
        console.log('LB total saved →', res && res.saved);
        return { saved: res.saved, entry };
    };


    const previewTotalOnly = ({ containerId, name, highestLevel, totalTimeMs, counts }) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const entry = LeaderboardAPI.makeTotalEntry({ name, highestLevel, totalTimeMs, counts });
        console.log('LB total preview →', entry);
        clearEl(container);
        container.appendChild(rowLine({ name: entry.name, level: `L${highestLevel}`, points: entry.points, time: LeaderboardAPI.formatTime(entry.totalTimeMs) }));
        return entry;
    };

    return { showLevelIntermediate, showTotalFinal, previewTotalOnly };
})();
