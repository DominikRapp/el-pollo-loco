function domShow(app, el) {
    if (el) el.classList.remove('hidden');
}

function domHide(app, el) {
    if (el) el.classList.add('hidden');
}

function attachDomUtils(app) {
    app.show = function (el) { return domShow(app, el); };
    app.hide = function (el) { return domHide(app, el); };
}
