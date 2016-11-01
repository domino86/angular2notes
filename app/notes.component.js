'use strict';

(function(app) {

    app.NotesComponent = ng.core.Component({
        selector: 'notes',
        templateUrl: 'app/template.html',
        styleUrls: ['style.css'],
        inputs: ['loader', 'alert']
    }).Class({

        constructor: function constructor() {

            this.notes = [];
            this.tmpArr = [];
            this.loader = '';
            this.alert = '';
            this.hideme = {};

            if (storageMethod.default == "localStorage") {
                this.stored = localStorage.getItem('notes');
                this.methodRef = this.notes;
                this.targetFb = null;
            } else {
                this.stored = null;
                this.methodRef = firebase.database();
                this.targetFb = firebase.database().ref();
            }
        },

        ngOnInit: function ngOnInit() {

            if (storageMethod.default == "localStorage") {
                this.localStorageOnInit();
            } else {
                this.loader = "Loading notes...";
                var self = this;
                self.tmpArr = [];
                this.targetFb.on('child_added', function(snap) {
                    self.tmpArr.push(snap.val());
                    self.loader = '';
                });
                this.targetFb.once('value', function(data) {
                    if (!data.numChildren()) {
                        self.loader = '';
                        self.alert = 'Nothing found';
                    }
                });
                this.methodRef = self.tmpArr;
            }
        },

        localStorageOnInit: function localStorageOnInit() {
            //Initial data on first use
            this.methodRef = localStorage.getItem('notes') !== null ? JSON.parse(this.stored) : [{
                newNote: 'Example',
                newNoteContent: 'Lorem ipsum dolor sit amet,  http://carswithmuscles.com/wp-content/uploads/2015/08/69CamaroZ28_5-1024x576.jpg',
                selected: false,
                previewImages: ['http://carswithmuscles.com/wp-content/uploads/2015/08/69CamaroZ28_5-1024x576.jpg']
            }];

            this.setLocalStorage(this.methodRef);
        },

        addNote: function addNote(event) {
            this.noteObj = {
                newNote: this.newNote,
                newNoteContent: this.newNoteContent,
                selected: false,
                previewImages: []
            };

            if (storageMethod.default == "localStorage") {
                this.methodRef.unshift(this.noteObj);
                this.updateStoredNotes(this.methodRef);
            } else {
                this.noteObj = {
                    newNote: '',
                    newNoteContent: '',
                    selected: false,
                    previewImages: ['']
                };
                this.methodRef.push(this.noteObj);
                this.targetFb.set(this.methodRef);
                this.ngOnInit();
            }
            this.noteObj = '';
            event.preventDefault();
        },

        showImage: function showImage(i, note) {

            var exp = /https?:\/\/.*\.(?:png|jpg|gif)/ig;
            var text = this.methodRef[i].newNoteContent;
            this.methodRef[i].previewImages.length = 0;
            var matches;

            if (storageMethod.default == "localStorage") {

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

                while (matches = exp.exec(text)) {

                    var list = [];
                    firebase.database().ref(i + '/previewImages').on('value', function(snap) {
                        list = snap.val();
                    });

                    if (this.methodRef[i].previewImages.indexOf(list) == -1 && this.methodRef[i].previewImages.indexOf(matches[0]) == -1) {
                        list.unshift(matches[0]);
                        this.methodRef[i].previewImages.unshift(matches[0]);
                        firebase.database().ref(i + '/previewImages/').set(list);
                    } else {
                        list.splice(matches[0], -1);
                        this.methodRef[i].previewImages.splice(matches[0], -1);
                        firebase.database().ref(i + '/previewImages/').set(list);
                    }
                }
            }
            this.updateNote(i, note);
        },

        updateNote: function updateNote(index, note) {
            if (storageMethod.default == "localStorage") {
                var storedNotes = JSON.parse(localStorage.notes);
                storedNotes[index].newNote = note.newNote;
                storedNotes[index].newNoteContent = note.newNoteContent;
                storedNotes[index].previewImages = note.previewImages;
                this.updateStoredNotes(storedNotes);
            } else {
                note.previewImages = note.previewImages.length > 0 ? note.previewImages : [""];
                firebase.database().ref(index).set({
                    newNote: note.newNote,
                    newNoteContent: note.newNoteContent,
                    selected: false,
                    previewImages: note.previewImages
                });
                this.ngOnInit();
            }
        },

        deleteNote: function deleteNote(index) {
            this.methodRef.splice(index, 1);
            if (storageMethod.default == "localStorage") {
                this.updateStoredNotes(this.methodRef);
            } else {
                firebase.database().ref().set(this.methodRef);
                this.hideDeleted(index);
                this.ngOnInit();
            }
        },

        deleteSelectedNotes: function deleteSelectedNotes() {

            var i = this.methodRef.length - 1;
            if (storageMethod.default == "localStorage") {
                for (i; i > -1; i--) {
                    if (this.methodRef[i].selected) {
                        this.methodRef.splice(i, 1);
                    }
                }
                this.updateStoredNotes(this.methodRef);
            } else {
                for (i; i > -1; i--) {
                    if (this.methodRef[i].selected) {
                        this.methodRef.splice(i, 1);
                        this.hideDeleted(i);
                    }
                }
                firebase.database().ref().set(this.methodRef);
                this.ngOnInit();
            }
        },

        updateStoredNotes: function updateStoredNotes(notes) {
            if (storageMethod.default == "localStorage") {
                localStorage.setItem('notes', JSON.stringify(notes));
            }
        },

        setLocalStorage: function setLocalStorage(notes) {
            localStorage.setItem('notes', JSON.stringify(notes));
        },

        hideDeleted: function hideDeleted(index) {
            var _this = this;

            Object.keys(this.hideme).forEach(function(h) {
                _this.hideme[h] = false;
            });
            this.hideme[index] = true;
        }

    });
})(window.app || (window.app = {}));