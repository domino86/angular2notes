(function (app) {
    document.addEventListener('DOMContentLoaded', function () {
        ng.platform.browser.bootstrap(app.NotesComponent, [ng.http.HTTP_PROVIDERS]);
    });
})(window.app || (window.app = {}));