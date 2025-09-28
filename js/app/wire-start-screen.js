/**
 * Wires the start screen controls: initializes name state, error label,
 * restores saved name, sets button enablement, and attaches listeners.
 * @param {object} app - The game/app instance (expects persistName(name) and startLevel(i))
 */
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

/**
 * Resets the in-memory user name state for the start screen.
 * @param {object} app - The game/app instance with mutable fields
 */
function initializeNameState(app) {
    app.showNameErrors = false;
    app.userName = '';
    app.nameValid = false;
}

/**
 * Prepares the error label to be visible space-wise but visually soft-hidden.
 * @param {HTMLElement|null} nameError - The error label element
 */
function initializeErrorLabel(nameError) {
    if (!nameError) return;
    nameError.classList.add('soft-hidden');
    nameError.classList.remove('hidden');
    if (!nameError.textContent) nameError.textContent = ' ';
}

/**
 * Restores a previously saved player name from localStorage and marks it valid.
 * @param {object} app - The game/app instance
 * @param {HTMLInputElement|null} nameInput - The name input field
 */
function restoreSavedName(app, nameInput) {
    const saved = localStorage.getItem('playerName');
    if (saved && nameInput) {
        nameInput.value = saved;
        app.userName = saved;
        app.nameValid = true;
    }
}

/**
 * Enables or disables the Start button depending on whether a non-empty name exists.
 * @param {HTMLButtonElement|null} btnStart - The Start button
 * @param {HTMLInputElement|null} nameInput - The name input field
 */
function updateStartButtonEnablement(btnStart, nameInput) {
    if (!btnStart) return;
    const hasName = !!(nameInput && nameInput.value.trim().length > 0);
    btnStart.disabled = !hasName;
}

/**
 * Checks whether a name has been used before on this device (localStorage).
 * @param {string} name - Candidate name
 * @returns {boolean} True if the lowercase name is found in the local list
 */
function isNameTakenLocal(name) {
    const raw = localStorage.getItem('usedNames') || '[]';
    try {
        const list = JSON.parse(raw);
        return list.includes(name.toLowerCase());
    } catch {
        return false;
    }
}

/**
 * Updates the error label text and visibility.
 * @param {HTMLElement|null} nameError - The error label element
 * @param {string} message - Error message (use single space to preserve layout)
 * @param {boolean} visible - Whether the error should be visibly shown
 */
function setNameError(nameError, message, visible) {
    if (!nameError) return;
    nameError.textContent = message || ' ';
    if (visible) nameError.classList.remove('soft-hidden');
    else nameError.classList.add('soft-hidden');
}

/**
 * Validates the name and applies state/UI updates.
 * @param {object} app
 * @param {HTMLInputElement|null} nameInput
 * @param {HTMLElement|null} nameError
 * @param {HTMLButtonElement|null} btnStart
 * @returns {boolean}
 */
function validateName(app, nameInput, nameError, btnStart) {
    const raw = nameInput && nameInput.value ? nameInput.value : '';
    const res = computeNameValidation(raw);
    app.userName = res.value;
    app.nameValid = res.valid;
    const show = app.showNameErrors ? !res.valid : false;
    setNameError(nameError, app.showNameErrors ? (res.valid ? ' ' : res.message) : ' ', show);
    updateStartButtonEnablement(btnStart, nameInput);
    return res.valid;
}

/**
 * Computes validity and message for a candidate name.
 * @param {string} name
 * @returns {{value:string, valid:boolean, message:string}}
 */
function computeNameValidation(name) {
    const value = (name || '').trim();
    const ok = value.length >= 3 && value.length <= 16 && /^[a-z0-9_]+$/i.test(value);
    const taken = value ? isNameTakenLocal(value) : false;
    const current = (localStorage.getItem('playerName') || '').toLowerCase();
    let message = '';
    if (!ok) message = '3–16 letters/numbers/_ only.';
    else if (taken && value.toLowerCase() !== current) message = 'Name ist bereits vergeben.';
    return { value, valid: message === '', message };
}

/**
 * Attaches input/blur handlers to validate and keep the start button state in sync.
 * @param {object} app - The game/app instance
 * @param {HTMLInputElement|null} nameInput - Name input field
 * @param {HTMLElement|null} nameError - Error label element
 * @param {HTMLButtonElement|null} btnStart - Start button element
 */
function attachNameInputHandlers(app, nameInput, nameError, btnStart) {
    if (!nameInput) return;
    nameInput.addEventListener('input', function () {
        validateName(app, nameInput, nameError, btnStart);
    });
    nameInput.addEventListener('blur', function () {
        validateName(app, nameInput, nameError, btnStart);
    });
}

/**
 * Attaches the Start button click: shows errors if invalid, otherwise saves and starts.
 * @param {object} app - The game/app instance (expects persistName and startLevel)
 * @param {HTMLButtonElement|null} btnStart - Start button element
 * @param {HTMLInputElement|null} nameInput - Name input field
 * @param {HTMLElement|null} nameError - Error label element
 */
function attachStartClick(app, btnStart, nameInput, nameError) {
    if (!btnStart) return;
    btnStart.addEventListener('click', function () {
        app.showNameErrors = true;
        if (!validateName(app, nameInput, nameError, btnStart)) return;
        app.persistName(app.userName);
        app.startLevel(0);
    });
}