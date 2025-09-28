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
 * Zeigt Zwischenstand für Level: Rendern, submit falls Top10, erneut rendern.
 * @param {{containerId:string, name:string, level:number|string, timeMs:number, counts:Object}} args
 * @returns {Promise<{saved:boolean, entry:Object|null}>}
 */
async function showLevelIntermediate(args) {
    const entry = buildLevelEntryFromArgs(args);
    if (!renderLevelRow(args.containerId, entry)) return { saved: false, entry: null };
    const result = await LeaderboardAPI.submitIfTop10('level', entry, args.level);
    renderLevelRow(args.containerId, entry);
    return { saved: result.saved, entry };
}

/**
 * Erstellt einen Level-Entry aus Args.
 * @param {{name:string, level:number|string, timeMs:number, counts:Object}} args
 * @returns {Object}
 */
function buildLevelEntryFromArgs(args) {
    return LeaderboardAPI.makeLevelEntry({
        name: args.name, level: args.level, timeMs: args.timeMs, counts: args.counts
    });
}

/**
 * Rendert eine Level-Zeile in einen Container.
 * @param {string} containerId
 * @param {Object} entry
 * @returns {boolean} true wenn gerendert, sonst false
 */
function renderLevelRow(containerId, entry) {
    const container = document.getElementById(containerId);
    if (!container) return false;
    clearElementChildren(container);
    container.appendChild(createLevelRowLocal(entry));
    return true;
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