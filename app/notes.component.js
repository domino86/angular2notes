'use strict';

(function(app) {

    app.NotesComponent = ng.core.Component({
        selector: 'notes',
        templateUrl: 'app/template.html',
        styleUrls: ['style.css'],
        inputs: ['loader', 'alert'],
        viewProviders: [app.DataService],
        pipes: [app.KeysPipe]
    }).Class({

        constructor: [app.DataService, function(service) {
            this._service = service;
            console.log(this._service);
            this.notes = [];
            this.loader = '';
            this.alert = '';
            this.hideme = {};

            if (storageMethod.default == "localStorage") {
                this.stored = localStorage.getItem('notes');
                this.methodRef = this.notes;
            } else {
                this.stored = null;
                this.methodRef = firebase.database();
            }
        }],

        ngOnInit: function ngOnInit() {

            if (storageMethod.default == "localStorage") {
                this.localStorageOnInit();
            } else {
                var _this = this;
                _this.loader = "Loading notes...";
               this.getNotes();
            }
        },

        getNotes: function() {
            var _this = this;
            this._service.getNotes().subscribe(
                // the first argument is a function which runs on success
                function (data) {
                    data !== null ? _this.notes = data : _this.notes = [];
                    _this.loader = "";
                },
                // the second argument is a function which runs on error
                function (err) { return console.error(err); },
                // the third argument is a function which runs on completion
                function () { return console.log('done loading notes'); });
        },

        localStorageOnInit: function() {
            //Initial data on first use
            this.methodRef = localStorage.getItem('notes') !== null ? JSON.parse(this.stored) : [{
                newNote: 'Example',
                newNoteContent: 'Lorem ipsum dolor sit amet,  http://carswithmuscles.com/wp-content/uploads/2015/08/69CamaroZ28_5-1024x576.jpg',
                selected: false,
                previewImages: ['http://carswithmuscles.com/wp-content/uploads/2015/08/69CamaroZ28_5-1024x576.jpg']
            }];

            this.setLocalStorage(this.methodRef);
        },

        addNote: function(event) {
            var _this = this;
            _this.noteObj = {
                newNote: this.newNote,
                newNoteContent: this.newNoteContent,
                selected: false,
                previewImages: ['']
            };

            if (storageMethod.default == "localStorage") {
                this.methodRef.unshift(this.noteObj);
                this.updateStoredNotes(this.methodRef);
            } else {
                this._service.addNote(_this.noteObj).subscribe(function (data) {
                    _this.getNotes();
                    return true;
                }, function (error) {
                    console.error("Error saving note!");
                });
            }
            this.noteObj = '';
        },


        showImage: function showImage(key, note) {

            var exp = /https?:\/\/.*\.(?:png|jpg|gif)/ig;
            var text =  note.newNoteContent;
            console.log(note.previewImages);
            var matches;

            if (storageMethod.default == "localStorage") {

                this.notes.previewImages.length = 0;
                while (matches = exp.exec(text)) {

                    if (this.methodRef[i].previewImages.indexOf(matches[0]) == -1) {
                        this.methodRef[i].previewImages.unshift(matches[0]);
                    } else {
                        this.methodRef[i].previewImages.splice(matches[0], -1);
                    }
                }

                if (text == '') {
                    this.methodRef[i].previewImages.length = 0;
                }
            } else {


                var list = [];
                this._service.compareImage(key).subscribe(function (data) {
                    list.push(data);
                    console.log('done updating images');
                    console.log(list);
                    return true;
                }, function (error) {
                    console.error("Error updating note!");
                });

                while (matches = exp.exec(text)) {

                    if (note.previewImages.indexOf(matches[0]) == -1 && list.indexOf(matches[0]) == -1) {
                        note.previewImages.unshift(matches[0]);
                    } else {
                        note.previewImages.splice(matches[0], -1);
                        this._service.deleteImage(key).subscribe(
                            data => {
                                this.getNotes();
                                return true;
                            },
                            error => {
                                console.error("Error deleting note!");
                            }
                        );
                    }
                }
                if (text == '') {
                    note.previewImages.length = 0;
                }
            }
            this.updateNote(key, note);
        },

        updateNote: function (key, note) {
            var _this = this;
            console.log(note);
            if (storageMethod.default == "localStorage") {
                var storedNotes = JSON.parse(localStorage.notes);
                storedNotes[index].newNote = note.newNote;
                storedNotes[index].newNoteContent = note.newNoteContent;
                storedNotes[index].previewImages = note.previewImages;
                this.updateStoredNotes(storedNotes);
            } else {
                //note.previewImages = note.previewImages.length > 0 ? note.previewImages : [""];
                _this.noteObj = {
                    newNote: note.newNote,
                    newNoteContent: note.newNoteContent,
                    selected: false,
                    previewImages: note.previewImages
                };
                this._service.updateNote(key, _this.noteObj).subscribe(function (data) {
                    _this.getNotes();
                    console.log('done updating notes');
                    return true;
                }, function (error) {
                    console.error("Error updating note!");
                });
                this.getNotes();
            }
        },

        deleteNote: function (key, note) {
            if (storageMethod.default == "localStorage") {
                this.notes.splice(key, 1);
                this.updateStoredNotes(this.methodRef);
            } else {
                if (confirm("Are you sure you want to delete " + note.newNote + "?")) {
                    this._service.deleteNote(key, note).subscribe(
                        data => {
                            this.getNotes();
                            return true;
                        },
                        error => {
                            console.error("Error deleting note!");
                        }
                    );
                }
            }
        },

        deleteSelectedNotes: function () {
            var i = this.notes.length - 1;
            if (storageMethod.default == "localStorage") {
                for (i; i > -1; i--) {
                    if (this.methodRef[i].selected) {
                        this.methodRef.splice(i, 1);
                    }
                }
                this.updateStoredNotes(this.methodRef);
            } else {
                for (i; i > -1; i--) {
                    if (this.notes[i].selected) {
                        this._service.deleteNote(key, note).subscribe(
                            data => {
                                this.getNotes();
                                return true;
                            },
                            error => {
                                console.error("Error deleting note!");
                            }
                        );
                        this.hideDeleted(i);
                    }
                }
                this.getNotes();
            }
        },

        updateStoredNotes: function (notes) {
            if (storageMethod.default == "localStorage") {
                localStorage.setItem('notes', JSON.stringify(notes));
            }
        },

        setLocalStorage: function setLocalStorage(notes) {
            localStorage.setItem('notes', JSON.stringify(notes));
        },

        hideDeleted: function (index) {
            var _this = this;

            Object.keys(this.hideme).forEach(function(h) {
                _this.hideme[h] = false;
            });
            this.hideme[index] = true;
        }

    });
})(window.app || (window.app = {}));