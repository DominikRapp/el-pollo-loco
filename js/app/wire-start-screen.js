function wireStartScreenControls(app) {
    const btnStart = document.getElementById('btn-start');
    const nameInput = document.getElementById('player-name');
    const nameErr = document.getElementById('name-error');

    app.showNameErrors = false;
    app.userName = '';
    app.nameValid = false;

    const updateEnablement = () => {
        if (btnStart) btnStart.disabled = !(nameInput && nameInput.value.trim().length > 0);
    };

    const isNameTakenLocal = (name) => {
        const raw = localStorage.getItem('usedNames') || '[]';
        try {
            const list = JSON.parse(raw);
            return list.includes(name.toLowerCase());
        } catch {
            return false;
        }
    };

    const setError = (msg, visible) => {
        if (!nameErr) return;
        nameErr.textContent = msg || ' ';
        if (visible) {
            nameErr.classList.remove('soft-hidden');
        } else {
            nameErr.classList.add('soft-hidden');
        }
    };

    const validate = () => {
        const value = (nameInput?.value || '').trim();
        app.userName = value;
        const basicOk = value.length >= 3 && value.length <= 16 && /^[a-z0-9_]+$/i.test(value);
        const taken = value ? isNameTakenLocal(value) : false;

        let msg = '';
        if (!basicOk) msg = '3–16 characters, letters/numbers/_ only.';
        else if (taken && value.toLowerCase() !== (localStorage.getItem('playerName') || '').toLowerCase()) msg = 'Name ist bereits vergeben.';

        app.nameValid = msg === '';
        if (app.showNameErrors) {
            setError(app.nameValid ? ' ' : msg, !app.nameValid);
        } else {
            setError(' ', false);
        }
        updateEnablement();
        return app.nameValid;
    };

    if (nameInput) {
        nameInput.addEventListener('input', () => {
            validate();
        });
        nameInput.addEventListener('blur', () => {
            validate();
        });
    }

    const saved = localStorage.getItem('playerName');
    if (saved && nameInput) {
        nameInput.value = saved;
        app.userName = saved;
        app.nameValid = true;
    }

    if (nameErr) {
        nameErr.classList.add('soft-hidden');
        nameErr.classList.remove('hidden');
        if (!nameErr.textContent) nameErr.textContent = ' ';
    }

    updateEnablement();
    validate();

    if (btnStart) {
        btnStart.addEventListener('click', () => {
            app.showNameErrors = true;
            if (!validate()) return;
            app.persistName(app.userName);
            app.startLevel(0);
        });
    }
}
