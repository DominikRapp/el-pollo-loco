/**
 * Returns the instruction pages as an array of HTML strings.
 * Each array entry represents one "page" of instructions to render.
 * @returns {string[]} Array of HTML strings for the instruction pages
 */
function instructionsPagesTemplate() {
    return [
        '<h2>How to Play</h2><p>EL POLLO LOCO is a fast-paced 5-level jump-and-run with a speedrun twist. Finish levels as quickly as possible while scoring points to climb into the Top-10 leaderboards. A 3-2-1 countdown starts each run. Enter a player name to enable the Start button—your name appears on the scoreboards.</p>',
        '<h2>Keyboard Controls</h2><ul><li><kbd>A</kbd> / <kbd>&larr;</kbd> — Move left</li><li><kbd>D</kbd> / <kbd>&rarr;</kbd> — Move right</li><li><kbd>Space</kbd> — Jump</li><li><kbd>W</kbd> — Throw (bottle)</li><li><kbd>M</kbd> — Mute / Unmute</li><li><kbd>R</kbd> — Quick Restart (resets to Level 1 and restarts the run)</li><li><kbd>B</kbd> — Open Leaderboard</li><li><kbd>I</kbd> — Open Instructions</li><li><kbd>O</kbd> — Open Audio Settings</li><li><kbd>H</kbd> — Go to Home</li><li><kbd>F</kbd> — Toggle Fullscreen</li></ul>',
        '<h2>Mobile Controls</h2><div class="icon-row"><span><img class="ins-ico" src="img/11_mobile_buttons/left.png" alt="Left">Left</span><span><img class="ins-ico" src="img/11_mobile_buttons/right.png" alt="Right">Right</span><span><img class="ins-ico" src="img/11_mobile_buttons/jump.png" alt="Jump">Jump</span><span><img class="ins-ico" src="img/11_mobile_buttons/throw-button.png" alt="Throw">Throw</span><span><img class="ins-ico" src="img/11_mobile_buttons/restart.png" alt="Restart">Restart</span></div><ul><li><strong>Left/Right</strong> — Hold to move Pepe left/right.</li><li><strong>Jump</strong> — Tap to jump.</li><li><strong>Throw</strong> — Tap to throw a bottle; Throwing bottles has a 2-second cooldown.</li><li><strong>Restart</strong> — Tap to restart the run at <strong>Level 1</strong>.</li></ul>',
        '<h2>Run & Countdown</h2><ul><li>Starting a level triggers a <strong>3-2-1 → GO</strong> countdown.</li><li><strong>Reset</strong> sends you back to Level 1 and restarts the run.</li><li>Your health carries over between levels, manage healing with coins.</li></ul>',
        '<h2>Goals & Levels</h2><ul><li>There are <strong>5 levels</strong>, difficulty increases each level.</li><li>Clear levels as fast as you can while maximizing points.</li><li>Health does not automatically refill between levels.</li></ul>',
        '<h2>Scoring Overview</h2><ul><li><strong>Boss defeated:</strong> +5 points (1 boss per level)</li><li><strong>Chicken defeated:</strong> +4 points (max 5 per level → 20 pts)</li><li><strong>Chick defeated:</strong> +3 points (max 5 per level → 15 pts)</li><li><strong>Bottle collected:</strong> +2 points (max 5 per level → 10 pts)</li><li><strong>Coin collected:</strong> +1 point (max 5 per level → 5 pts)</li></ul><p><em>Leaderboards:</em> one <strong>Total</strong> board (sum of all levels) and one board per <strong>Level</strong>. Only Top-10 are shown.</p>',
        '<h2>Ranking Rules</h2><ul><li>Higher <strong>points</strong> rank above lower points.</li><li>Ties are broken by <strong>faster time</strong>.</li><li>If still tied, <strong>earlier achievement</strong> (first reached, by <code>createdAt</code>) ranks higher.</li></ul>',
        '<h2>Your Character: Pepe</h2><p><img class="ins-ico" src="img/2_character_pepe/5_dead/D-53.png" alt="Pepe"><img class="ins-ico" src="img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png" alt="Health"></p><ul><li><strong>Health:</strong> 100 HP. Each enemy hit deals 20 damage.</li><li><strong>Invulnerability:</strong> 1 second after taking damage, slight knockback.</li><li><strong>Actions:</strong> run left/right, jump, throw bottles, collect bottles and coins.</li><li><strong>Stomp:</strong> jump on chickens and chicks to defeat them.</li><li><strong>Healing:</strong> each coin restores 20 HP (up to 100).</li><li><strong>Idle:</strong> after 15 seconds without input, Pepe gets sleepy.</li><li><strong>Bottles:</strong> carry up to 5 per level. Throwing bottles has a 2-second cooldown.</li></ul>',
        '<h2>Endboss</h2><p><img class="ins-ico" src="img/4_enemie_boss_chicken/2_alert/G11.png" alt="Boss"><img class="ins-ico" src="img/7_statusbars/2_statusbar_endboss/green/green60.png" alt="Boss HP"></p><ul><li><strong>Boss HP:</strong> 100 HP, bottles deal 20 damage each → needs 5 hits.</li><li><strong>Damage to Pepe:</strong> 20 per hit.</li><li><strong>Behavior:</strong> turns alert when close, boss music starts, chases and melee attacks.</li><li><strong>Scaling:</strong> gets faster each level.</li><li><strong>Points:</strong> defeating the boss gives +5 points.</li><li><strong>Important:</strong> only 5 bottles per level. If you miss one boss hit, you cannot finish that level.</li></ul>',
        '<h2>Chicken</h2><p><img class="ins-ico" src="img/3_enemies_chicken/chicken_normal/1_walk/2_w.png" alt="Chicken"></p><ul><li>Defeat by <strong>stomping</strong> on its head.</li><li><strong>Points:</strong> +4 each (max 5 per level → 20 pts).</li></ul>',
        '<h2>Chick</h2><p><img class="ins-ico" src="img/3_enemies_chicken/chicken_small/1_walk/2_w.png" alt="Chick"></p><ul><li>Defeat by <strong>stomping</strong> on its head.</li><li><strong>Points:</strong> +3 each (max 5 per level → 15 pts).</li></ul>',
        '<h2>Bottle</h2><p><img class="ins-ico" src="img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png" alt="Bottle"><img class="ins-ico" src="img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png" alt="Bottle bar"></p><ul><li><strong>Spawns:</strong> 5 per level.</li><li><strong>Use:</strong> required to defeat the boss, collect all if you want a chance to win.</li><li><strong>Damage:</strong> 20 per boss hit.</li><li><strong>Points:</strong> +2 per collected bottle (up to 10 per level).</li></ul>',
        '<h2>Coin</h2><p><img class="ins-ico" src="img/8_coin/coin_2.png" alt="Coin"><img class="ins-ico" src="img/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png" alt="Coin bar"></p><ul><li><strong>Healing:</strong> +20 HP each.</li><li><strong>Spawns:</strong> 5 per level.</li><li><strong>Points:</strong> +1 each (up to 5 per level).</li></ul>',
        '<h2>World Objects</h2><h3>Barrel</h3><p><img class="ins-ico" src="img/10_fix_objects/barrel.png" alt="Barrel"></p><ul><li>Static, indestructible. Use as cover or to reach higher spots.</li></ul><h3>Platforms</h3><p><span class="icon-row"><img class="ins-ico" src="img/10_fix_objects/platform_set/platform1.png" alt="P1"><img class="ins-ico" src="img/10_fix_objects/platform_set/platform2.png" alt="P2"><img class="ins-ico" src="img/10_fix_objects/platform_set/platform3.png" alt="P3"><img class="ins-ico" src="img/10_fix_objects/platform_set/platform4.png" alt="P4"><img class="ins-ico" src="img/10_fix_objects/platform_set/platform5.png" alt="P5"></span></p><ul><li>Static, built from 5 segments.</li><li>You can jump up through a platform from below.</li><li>Typically reached via a <strong>barrel-assisted jump</strong>, not directly from ground height.</li></ul>'
    ];
}

/**
 * Renders the audio settings UI as an HTML string based on current state.
 * @param {object} st - Audio settings state (0..1 values)
 * @param {boolean} st.muted - Whether audio is muted
 * @param {number} st.master - Master volume (0..1)
 * @param {number} st.music - Music volume (0..1)
 * @param {number} st.system - System SFX volume (0..1)
 * @param {number} st.characters - Character SFX volume (0..1)
 * @param {number} st.objects - Object SFX volume (0..1)
 * @returns {string} HTML for the settings panel
 */
function settingsTemplate(st) {
    return `
        <h2>Audio</h2>
        <div class="settings-group">
            <button id="btn-mute-toggle" class="btn">${st.muted ? 'Mute: ON' : 'Mute: OFF'}</button>
        </div>
        <div class="settings-group">
            <label for="slider-master">Master: <span id="val-master">${percentFrom01(st.master)}%</span></label>
            <input id="slider-master" type="range" min="0" max="100" step="1" value="${percentFrom01(st.master)}" />
        </div>
        <div class="settings-group">
            <label for="slider-music">Music: <span id="val-music">${percentFrom01(st.music)}%</span></label>
            <input id="slider-music" type="range" min="0" max="100" step="1" value="${percentFrom01(st.music)}" />
        </div>
        <div class="settings-group">
            <label for="slider-system">System: <span id="val-system">${percentFrom01(st.system)}%</span></label>
            <input id="slider-system" type="range" min="0" max="100" step="1" value="${percentFrom01(st.system)}" />
        </div>
        <div class="settings-group">
            <label for="slider-characters">Characters: <span id="val-characters">${percentFrom01(st.characters)}%</span></label>
            <input id="slider-characters" type="range" min="0" max="100" step="1" value="${percentFrom01(st.characters)}" />
        </div>
        <div class="settings-group">
            <label for="slider-objects">Objects: <span id="val-objects">${percentFrom01(st.objects)}%</span></label>
            <input id="slider-objects" type="range" min="0" max="100" step="1" value="${percentFrom01(st.objects)}" />
        </div>
    `;
}

/**
 * Builds the full Total leaderboard table (detailed columns).
 * @param {string} rowsHtml - HTML string with all <tr> rows
 * @returns {string} Complete HTML table
 */
function totalLeaderboardTableTemplate(rowsHtml) {
    return '<table class="leaderboard-table"><thead><tr>'
        + '<th>#</th><th>Name</th><th>Höchstes Level</th><th>Gesamtzeit</th><th>Punkte</th>'
        + '<th>Boss</th><th>Chicken</th><th>Chicken Small</th><th>Bottles</th><th>Coins</th>'
        + '</tr></thead><tbody>' + rowsHtml + '</tbody></table>';
}

/**
 * Builds one detailed Total leaderboard row.
 * @param {object} d - Row data
 * @param {number} d.index - Zero-based rank index
 * @param {string} d.name - Player name
 * @param {string|number} d.highestLevel - Highest level reached
 * @param {string} d.timeText - Human-readable total time
 * @param {number} d.points - Total points
 * @param {number} d.boss - Boss defeats
 * @param {number} d.chicken - Chickens defeated
 * @param {number} d.chickenSmall - Chicks defeated
 * @param {number} d.bottle - Bottles collected
 * @param {number} d.coin - Coins collected
 * @returns {string} HTML string for a single table row
 */
function totalLeaderboardRowTemplate(d) {
    return '<tr>'
        + '<td>' + (d.index + 1) + '.</td>'
        + '<td>' + d.name + '</td>'
        + '<td>' + d.highestLevel + '</td>'
        + '<td>' + d.timeText + '</td>'
        + '<td>' + d.points + '</td>'
        + '<td>' + d.boss + '</td>'
        + '<td>' + d.chicken + '</td>'
        + '<td>' + d.chickenSmall + '</td>'
        + '<td>' + d.bottle + '</td>'
        + '<td>' + d.coin + '</td>'
        + '</tr>';
}

/**
 * Builds the compact Total leaderboard table (basic columns).
 * @param {string} rowsHtml - HTML string with all <tr> rows
 * @returns {string} Complete HTML table
 */
function totalLeaderboardSimpleTableTemplate(rowsHtml) {
    return '<table class="leaderboard-table"><thead><tr>'
        + '<th>#</th><th>Name</th><th>Highest Level</th><th>Points</th><th>Time</th>'
        + '</tr></thead><tbody>' + rowsHtml + '</tbody></table>';
}

/**
 * Builds one compact Total leaderboard row.
 * @param {object} d - Row data
 * @param {number} d.index - Zero-based rank index
 * @param {string} d.name - Player name
 * @param {string|number} d.level - Highest level reached
 * @param {number} d.points - Points
 * @param {string} d.time - Human-readable time
 * @returns {string} HTML string for a single table row
 */
function totalLeaderboardSimpleRowTemplate(d) {
    return '<tr>'
        + '<td>' + (d.index + 1) + '.</td>'
        + '<td>' + d.name + '</td>'
        + '<td>' + d.level + '</td>'
        + '<td>' + d.points + '</td>'
        + '<td>' + d.time + '</td>'
        + '</tr>';
}

/**
 * Builds the full Level leaderboard table (detailed columns).
 * @param {string} rowsHtml - HTML string with all <tr> rows
 * @returns {string} Complete HTML table
 */
function levelLeaderboardTableTemplate(rowsHtml) {
    return '<table class="leaderboard-table"><thead><tr>'
        + '<th>#</th><th>Name</th><th>Zeit</th><th>Punkte</th>'
        + '<th>Boss</th><th>Chicken</th><th>Chicken Small</th><th>Bottles</th><th>Coins</th>'
        + '</tr></thead><tbody>' + rowsHtml + '</tbody></table>';
}

/**
 * Builds one detailed Level leaderboard row.
 * @param {object} d - Row data
 * @param {number} d.index - Zero-based rank index
 * @param {string} d.name - Player name
 * @param {string} d.timeText - Human-readable level time
 * @param {number} d.points - Points on this level
 * @param {number} d.boss - Boss defeats
 * @param {number} d.chicken - Chickens defeated
 * @param {number} d.chickenSmall - Chicks defeated
 * @param {number} d.bottle - Bottles collected
 * @param {number} d.coin - Coins collected
 * @returns {string} HTML string for a single table row
 */
function levelLeaderboardRowTemplate(d) {
    return '<tr>'
        + '<td>' + (d.index + 1) + '.</td>'
        + '<td>' + d.name + '</td>'
        + '<td>' + d.timeText + '</td>'
        + '<td>' + d.points + '</td>'
        + '<td>' + d.boss + '</td>'
        + '<td>' + d.chicken + '</td>'
        + '<td>' + d.chickenSmall + '</td>'
        + '<td>' + d.bottle + '</td>'
        + '<td>' + d.coin + '</td>'
        + '</tr>';
}

/**
 * Builds the compact Level leaderboard table (basic columns).
 * @param {string} rowsHtml - HTML string with all <tr> rows
 * @returns {string} Complete HTML table
 */
function levelLeaderboardSimpleTableTemplate(rowsHtml) {
    return '<table class="leaderboard-table"><thead><tr>'
        + '<th>#</th><th>Name</th><th>Level</th><th>Points</th><th>Time</th>'
        + '</tr></thead><tbody>' + rowsHtml + '</tbody></table>';
}

/**
 * Builds one compact Level leaderboard row.
 * @param {object} d - Row data
 * @param {number} d.index - Zero-based rank index
 * @param {string} d.name - Player name
 * @param {string|number} d.level - Level identifier
 * @param {number} d.points - Points on this level
 * @param {string} d.time - Human-readable time
 * @returns {string} HTML string for a single table row
 */
function levelLeaderboardSimpleRowTemplate(d) {
    return '<tr>'
        + '<td>' + (d.index + 1) + '.</td>'
        + '<td>' + d.name + '</td>'
        + '<td>' + d.level + '</td>'
        + '<td>' + d.points + '</td>'
        + '<td>' + d.time + '</td>'
        + '</tr>';
}