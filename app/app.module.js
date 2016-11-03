(function(app) {
    app.AppModule =
        ng.core.NgModule({
            imports: [ ng.platformBrowser.BrowserModule, ng.forms.FormsModule ],
            declarations: [ app.NotesComponent ],
            bootstrap: [ app.NotesComponent ]
        }).Class({
            constructor: function() {}
        });
})(window.app || (window.app = {}));