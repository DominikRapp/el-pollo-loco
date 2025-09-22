/**
 * Safely creates a text node from any value.
 * @param {*} value - Value to convert to text
 * @returns {Text} A DOM Text node
 */
function createTextNodeSafe(value) {
    return document.createTextNode(String(value));
}

/**
 * Removes all child nodes from a DOM element.
 * @param {HTMLElement} element - Element to clear
 * @returns {void}
 */
function clearElementChildren(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
}

/**
 * Builds a leaderboard row DOM element.
 * @param {{name:string, level:string|number, points:number|string, time:string}} data - Display data for the row
 * @returns {HTMLDivElement} The constructed row element
 */
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

/**
 * Builds a local (client-side) leaderboard row for a single level entry.
 * @param {{name:string, level:number|string, points:number, timeMs:number}} entry - Level entry data
 * @returns {HTMLDivElement} The constructed row element
 */
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

/**
 * Shows an intermediate level result: renders a single row, submits to Top 10,
 * and returns the saved status plus the entry.
 * @param {{containerId:string, name:string, level:number|string, timeMs:number, counts:Object}} args - Rendering and entry inputs
 * @returns {Promise<{saved:boolean, entry:Object|null}>} Result with saved flag and the entry payload
 */
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

/**
 * Submits the final total result to the total leaderboard and returns the saved status.
 * @param {{name:string, highestLevel:number|string, totalTimeMs?:number, counts?:Object}} args - Total entry inputs
 * @returns {Promise<{saved:boolean, entry:Object}>} Result with saved flag and the total entry payload
 */
async function showTotalFinal(args) {
    const entry = LeaderboardAPI.makeTotalEntry({ name: args.name, highestLevel: args.highestLevel, totalTimeMs: args.totalTimeMs, counts: args.counts });
    const result = await LeaderboardAPI.submitIfTop10('total', entry);
    return { saved: result.saved, entry };
}

/**
 * Renders a preview of the total result (without submitting) and returns the entry payload.
 * @param {{containerId:string, name:string, highestLevel:number|string, totalTimeMs?:number, counts?:Object}} args - Preview inputs
 * @returns {Object|undefined} The total entry payload, or undefined if container not found
 */
function previewTotalOnly(args) {
    const container = document.getElementById(args.containerId);
    if (!container) return;
    const entry = LeaderboardAPI.makeTotalEntry({ name: args.name, highestLevel: args.highestLevel, totalTimeMs: args.totalTimeMs, counts: args.counts });
    clearElementChildren(container);
    container.appendChild(createLeaderboardRow({ name: entry.name, level: 'L' + args.highestLevel, points: entry.points, time: LeaderboardAPI.formatTime(entry.totalTimeMs) }));
    return entry;
}

/**
 * Facade for leaderboard UI flow helpers.
 * @type {{showLevelIntermediate: Function, showTotalFinal: Function, previewTotalOnly: Function}}
 */
const LeaderboardFlow = { showLevelIntermediate, showTotalFinal, previewTotalOnly };