function createTextNodeSafe(value) {
    return document.createTextNode(String(value));
}

function clearElementChildren(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
}

function createLeaderboardRow(data) {
    const line = document.createElement('div');
    line.className = 'lb-line';
    const name = document.createElement('span'); name.className = 'lb-name'; name.appendChild(createTextNodeSafe(data.name));
    const level = document.createElement('span'); level.className = 'lb-level'; level.appendChild(createTextNodeSafe(data.level));
    const points = document.createElement('span'); points.className = 'lb-points'; points.appendChild(createTextNodeSafe(data.points));
    const time = document.createElement('span'); time.className = 'lb-time'; time.appendChild(createTextNodeSafe(data.time));
    line.appendChild(name); line.appendChild(level); line.appendChild(points); line.appendChild(time);
    return line;
}

function createLevelRowLocal(entry) {
    const line = document.createElement('div');
    line.className = 'lb-line';
    const name = document.createElement('span'); name.className = 'lb-name'; name.textContent = entry.name;
    const level = document.createElement('span'); level.className = 'lb-level'; level.textContent = 'L' + entry.level;
    const points = document.createElement('span'); points.className = 'lb-points'; points.textContent = String(entry.points);
    const time = document.createElement('span'); time.className = 'lb-time'; time.textContent = LeaderboardAPI.formatTime(entry.timeMs);
    line.appendChild(name); line.appendChild(level); line.appendChild(points); line.appendChild(time);
    return line;
}

async function showLevelIntermediate(args) {
    const container = document.getElementById(args.containerId);
    if (!container) return { saved: false, entry: null };
    const entry = LeaderboardAPI.makeLevelEntry({ name: args.name, level: args.level, timeMs: args.timeMs, counts: args.counts });
    clearElementChildren(container);
    container.appendChild(createLevelRowLocal(entry));
    const result = await LeaderboardAPI.submitIfTop10('level', entry, args.level);
    clearElementChildren(container);
    container.appendChild(createLevelRowLocal(entry));
    return { saved: result.saved, entry };
}

async function showTotalFinal(args) {
    const entry = LeaderboardAPI.makeTotalEntry({ name: args.name, highestLevel: args.highestLevel, totalTimeMs: args.totalTimeMs, counts: args.counts });
    const result = await LeaderboardAPI.submitIfTop10('total', entry);
    return { saved: result.saved, entry };
}

function previewTotalOnly(args) {
    const container = document.getElementById(args.containerId);
    if (!container) return;
    const entry = LeaderboardAPI.makeTotalEntry({ name: args.name, highestLevel: args.highestLevel, totalTimeMs: args.totalTimeMs, counts: args.counts });
    clearElementChildren(container);
    container.appendChild(createLeaderboardRow({ name: entry.name, level: 'L' + args.highestLevel, points: entry.points, time: LeaderboardAPI.formatTime(entry.totalTimeMs) }));
    return entry;
}

const LeaderboardFlow = { showLevelIntermediate, showTotalFinal, previewTotalOnly };
