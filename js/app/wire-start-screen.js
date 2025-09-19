function wireStartScreenControls(app) {
    const btnStart = document.getElementById('btn-start');
    const nameInput = document.getElementById('player-name');
    const nameError = document.getElementById('name-error');
    initializeNameState(app);
    initializeErrorLabel(nameError);
    restoreSavedName(app, nameInput);
    updateStartButtonEnablement(btnStart, nameInput);
    validateName(app, nameInput, nameError, btnStart);
    attachNameInputHandlers(app, nameInput, nameError, btnStart);
    attachStartClick(app, btnStart, nameInput, nameError);
}

function initializeNameState(app) {
    app.showNameErrors = false;
    app.userName = '';
    app.nameValid = false;
}

function initializeErrorLabel(nameError) {
    if (!nameError) return;
    nameError.classList.add('soft-hidden');
    nameError.classList.remove('hidden');
    if (!nameError.textContent) nameError.textContent = ' ';
}

function restoreSavedName(app, nameInput) {
    const saved = localStorage.getItem('playerName');
    if (saved && nameInput) {
        nameInput.value = saved;
        app.userName = saved;
        app.nameValid = true;
    }
}

function updateStartButtonEnablement(btnStart, nameInput) {
    if (!btnStart) return;
    const hasName = !!(nameInput && nameInput.value.trim().length > 0);
    btnStart.disabled = !hasName;
}

function isNameTakenLocal(name) {
    const raw = localStorage.getItem('usedNames') || '[]';
    try {
        const list = JSON.parse(raw);
        return list.includes(name.toLowerCase());
    } catch {
        return false;
    }
}

function setNameError(nameError, message, visible) {
    if (!nameError) return;
    nameError.textContent = message || ' ';
    if (visible) nameError.classList.remove('soft-hidden');
    else nameError.classList.add('soft-hidden');
}

function validateName(app, nameInput, nameError, btnStart) {
    const value = (nameInput && nameInput.value ? nameInput.value : '').trim();
    app.userName = value;
    const basicOk = value.length >= 3 && value.length <= 16 && /^[a-z0-9_]+$/i.test(value);
    const taken = value ? isNameTakenLocal(value) : false;
    const current = (localStorage.getItem('playerName') || '').toLowerCase();
    let message = '';
    if (!basicOk) message = '3–16 characters, letters/numbers/_ only.';
    else if (taken && value.toLowerCase() !== current) message = 'Name ist bereits vergeben.';
    app.nameValid = message === '';
    if (app.showNameErrors) setNameError(nameError, app.nameValid ? ' ' : message, !app.nameValid);
    else setNameError(nameError, ' ', false);
    updateStartButtonEnablement(btnStart, nameInput);
    return app.nameValid;
}

function attachNameInputHandlers(app, nameInput, nameError, btnStart) {
    if (!nameInput) return;
    nameInput.addEventListener('input', function () {
        validateName(app, nameInput, nameError, btnStart);
    });
    nameInput.addEventListener('blur', function () {
        validateName(app, nameInput, nameError, btnStart);
    });
}

function attachStartClick(app, btnStart, nameInput, nameError) {
    if (!btnStart) return;
    btnStart.addEventListener('click', function () {
        app.showNameErrors = true;
        if (!validateName(app, nameInput, nameError, btnStart)) return;
        app.persistName(app.userName);
        app.startLevel(0);
    });
}
