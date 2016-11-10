(function(app) {
    app.DataService = ng.core.
    Class({
        constructor: [ng.http.Http, function(http) {
            this.endpoint_url = "https://angular2notes.firebaseio.com/";
            this.http = http;
            this.headers = new Headers();
            this.headers.append('Content-Type', 'application/json');
            this.headers.append('Accept', 'application/json');
        }],
        getNotes : function(){
            return this.http.get(this.endpoint_url + '.json').map(
                function(res){
                    res = res.json();
                    return res;
                }
            );
        },

        addNote: function () {
            this.noteObj = {
                newNote: '',
                newNoteContent: '',
                selected: false,
                previewImages: ['']
            };

            var body = JSON.stringify(this.noteObj);
            return this.http.post(this.endpoint_url + '.json', body, this.headers).map(function (res) {
                return res.json()
            });

        },

        showImage: function (key, image) {
            var body = JSON.stringify(image);
            return this.http.put(this.endpoint_url + key + '/previewImages' + '/.json', body, this.headers).map(function (res) { return res.json() });
        },

        compareImage: function (key) {
            return this.http.get(this.endpoint_url + key + '/previewImages' + '/.json').map(function (res) { return res.json() });
        },

        deleteImage: function (key) {
            return this.http.delete(this.endpoint_url + key + '/previewImages' + '/.json');
        },

        updateNote: function (key, note) {
            var body = JSON.stringify(note);
            return this.http.put(this.endpoint_url + key + '/.json', body, this.headers).map(function (res) { return res.json() });
        },

        deleteNote : function(key, note){
            return this.http.delete(this.endpoint_url  + key + '/.json');
        }

    });
})(window.app || (window.app = {}));