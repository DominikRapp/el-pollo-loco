function persistNameImpl(app, name) {
    localStorage.setItem('playerName', name);
    const raw = localStorage.getItem('usedNames') || '[]';
    let arr = [];
    try { arr = JSON.parse(raw); } catch { arr = []; }
    const key = name.toLowerCase();
    if (!arr.includes(key)) {
        arr.push(key);
        localStorage.setItem('usedNames', JSON.stringify(arr));
    }
}

function attachPlayerName(app) {
    app.persistName = function (name) { return persistNameImpl(app, name); };
}
