function domShow(app, element) {
    if (element) element.classList.remove('hidden');
}

function domHide(app, element) {
    if (element) element.classList.add('hidden');
}

function attachDomUtils(app) {
    app.show = function (element) { return domShow(app, element); };
    app.hide = function (element) { return domHide(app, element); };
}