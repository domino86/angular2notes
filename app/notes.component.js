'use strict';

(function (app) {

    app.NotesComponent = ng.core.Component({
        selector: 'notes',
        templateUrl: 'app/template.html',
        styleUrls: ['style.css'],
        inputs: ['loader', 'alert'],
        viewProviders: [app.DataService],
        pipes: [app.KeysPipe],
        changeDetection: storageMethod.default == "localStorage" ? ng.core.ChangeDetectionStrategy.OnPush : ng.core.ChangeDetectionStrategy.Default
    }).Class({

        constructor: [app.DataService, function (service) {
            this._service = service;
            this.notes = [];
            this.loader = '';
            this.alert = '';

            if (storageMethod.default == "localStorage") {
                this.stored = localStorage.getItem('notes');
            }
        }],

        ngOnInit: function ngOnInit() {

            if (storageMethod.default == "localStorage") {
                this.localStorageOnInit();
            } else {
                var _this = this;
                _this.loader == "Loading notes...";
                this.getNotes();
            }
        },

        getNotes: function getNotes() {
            var _this = this;
            this._service.getNotes().subscribe(function (data) {
                data !== null ? _this.notes = data : _this.notes = [];
                _this.loader == "";
                if (data == null) this.alert = "Nothing found";
            }, function (err) {
                return console.error(err);
            }, function () {
                return console.log('done loading notes');
            });
        },

        localStorageOnInit: function localStorageOnInit() {
            //Initial data on first use
            this.notes = localStorage.getItem('notes') !== null ? JSON.parse(this.stored) : [{
                newNote: 'Example',
                newNoteContent: 'Lorem ipsum dolor sit amet,  http://carswithmuscles.com/wp-content/uploads/2015/08/69CamaroZ28_5-1024x576.jpg',
                selected: false,
                previewImages: ['http://carswithmuscles.com/wp-content/uploads/2015/08/69CamaroZ28_5-1024x576.jpg']
            }];

            this.setLocalStorage(this.notes);
        },

        addNote: function addNote(event) {
            if (storageMethod.default == "localStorage") {
                this.noteObj = {
                    newNote: "",
                    newNoteContent: "",
                    selected: false,
                    previewImages: []
                };
                this.notes.push(this.noteObj);
                this.updateStoredNotes(this.notes);
            } else {
                var _this = this;
                this._service.addNote().subscribe(function (data) {
                    _this.getNotes();
                    _this.alert = "";
                    return true;
                }, function (error) {
                    console.error("Error saving note!");
                    return rx.Observable.throw(error);
                });
            }
            this.noteObj = '';
        },

        showImage: function showImage(key, note) {

            var exp = /https?:\/\/.*\.(?:png|jpg|gif)/ig;
            var text = note.newNoteContent;
            var matches;

            if (storageMethod.default == "localStorage") {

                this.notes[key].previewImages.length = 0;
                while (matches = exp.exec(text)) {

                    if (this.notes[key].previewImages.indexOf(matches[0]) == -1) {
                        this.notes[key].previewImages.unshift(matches[0]);
                    } else {
                        this.notes[key].previewImages.splice(matches[0], -1);
                    }
                }

                if (text == '') {
                    this.notes[key].previewImages.length = 0;
                }
            } else {

                var list = [];
                this._service.compareImage(key).subscribe(function(data) {
                    list.push(data);
                    return true;
                }, function (error) {
                    console.error("Error updating note! " + error);
                });

                while (matches = exp.exec(text)) {

                    if (note.previewImages.indexOf(list) == -1 && note.previewImages.indexOf(matches[0]) == -1) {
                        note.previewImages.push(matches[0]);
                    } else {
                        note.previewImages.splice(matches[0], -1);
                    }
                }
                if (text == '') {
                    note.previewImages.length = 0;
                }
            }
            this.updateNote(key, note);
        },

        updateNote: function updateNote(key, note) {
            var _this = this;
            if (storageMethod.default == "localStorage") {
                var storedNotes = JSON.parse(localStorage.notes);
                storedNotes[key].newNote = note.newNote;
                storedNotes[key].newNoteContent = note.newNoteContent;
                storedNotes[key].previewImages = note.previewImages;
                this.updateStoredNotes(storedNotes);
            } else {
                note.previewImages = note.previewImages.length > 0 ? note.previewImages : [""];
                _this.noteObj = {
                    newNote: note.newNote,
                    newNoteContent: note.newNoteContent,
                    selected: false,
                    previewImages: note.previewImages
                };
                this._service.updateNote(key, _this.noteObj).subscribe(function(data) {
                    _this.getNotes();
                    return true;
                }, function (error) {
                    console.error("Error updating note!");
                    return rx.Observable.throw(error);
                });
                this.getNotes();
            }
        },

        deleteNote: function deleteNote(key) {
            var _this2 = this;

            if (storageMethod.default == "localStorage") {
                this.notes.splice(key, 1);
                this.updateStoredNotes(this.notes);
            } else {
                if (confirm("Are you sure you want to delete this note?")) {
                    this._service.deleteNote(key).subscribe(function(data) {
                        _this2.getNotes();
                        return true;
                    }, function (error) {
                        console.error("Error deleting note!");
                        return rx.Observable.throw(error);
                    });
                }
            }
        },

        deleteSelectedNotes: function deleteSelectedNotes() {
            var _this3 = this;

            var i = this.notes.length - 1;
            if (storageMethod.default == "localStorage") {
                for (i; i > -1; i--) {
                    if (this.notes[i].selected) {
                        this.notes.splice(i, 1);
                    }
                }
                this.updateStoredNotes(this.notes);
            } else {

                for (var k in this.notes) {
                    if (this.notes.hasOwnProperty(k)) {
                        if (this.notes[k].selected == true) {
                            this._service.deleteNote(this.notes[k].key).subscribe(function(data) {
                                _this3.getNotes();
                                return true;
                            }, function (error) {
                                console.error("Error deleting note!");
                                return rx.Observable.throw(error);
                            });
                        }
                    }
                }
                this.getNotes();
            }
        },

        updateStoredNotes: function updateStoredNotes(notes) {
            if (storageMethod.default == "localStorage") {
                localStorage.setItem('notes', JSON.stringify(notes));
            }
        },

        setLocalStorage: function setLocalStorage(notes) {
            localStorage.setItem('notes', JSON.stringify(notes));
        }

    });
})(window.app || (window.app = {}));