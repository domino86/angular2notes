(function(app) {

    app.NotesComponent =
        ng.core.Component({
            selector: 'notes',
            templateUrl: 'app/template.html',
            styleUrls: ['style.css'],
            inputs: ['loader', 'deleted', 'alert']
        }).Class({

            constructor:  function() {

                this.notes = [];
                this.tmpArr = [];
                this.loader = '';
                this.alert = '';
                this.deleted = false;
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

            ngOnInit : function() {

                if (storageMethod.default == "localStorage") {
                    this.localStorageOnInit();
                } else {
                    this.loader = "Loading notes...";
                    var self = this;
                    self.tmpArr = [];
                    this.targetFb.on('child_added', function (snap) {
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

            localStorageOnInit: function() {
                //Initial data on first use
                this.methodRef = (localStorage.getItem('notes')!== null) ? JSON.parse(this.stored) : [{
                    newNote: 'Example',
                    newNoteContent: 'Lorem ipsum dolor sit amet,  http://carswithmuscles.com/wp-content/uploads/2015/08/69CamaroZ28_5-1024x576.jpg',
                    selected: false,
                    previewImages: ['http://carswithmuscles.com/wp-content/uploads/2015/08/69CamaroZ28_5-1024x576.jpg']
                }]

                this.setLocalStorage(this.methodRef);
            },

            addNote: function(event) {
                this.noteObj = {
                    newNote: this.newNote,
                    newNoteContent: this.newNoteContent,
                    selected: false,
                    previewImages: []
                }

                if(storageMethod.default == "localStorage") {
                    this.methodRef.push(this.noteObj);
                    this.updateStoredNotes(this.methodRef);
                } else {
                    this.noteObj = {
                        newNote: '',
                        newNoteContent: '',
                        selected: false,
                        previewImages: ['']
                    }
                    this.methodRef.push(this.noteObj);
                    this.targetFb.set(this.methodRef);
                    this.ngOnInit()
                }
                this.noteObj = '';
                event.preventDefault();
            },

            showImage: function(i, note) {

                var exp = /https?:\/\/.*\.(?:png|jpg|gif)/ig;
                var text = this.methodRef[i].newNoteContent;
                this.methodRef[i].previewImages.length = 0;

                if(storageMethod.default == "localStorage") {

                    while (matches = exp.exec(text)) {

                        if (this.methodRef[i].previewImages.indexOf(matches[0]) == -1) {
                            this.methodRef[i].previewImages.push(matches[0]);
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
                            list.push(matches[0]);
                            this.methodRef[i].previewImages.push(matches[0]);
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

            updateNote: function(index, note) {
                if (storageMethod.default == "localStorage") {
                    var storedNotes = JSON.parse(localStorage.notes);
                    storedNotes[index].newNote = note.newNote;
                    storedNotes[index].newNoteContent = note.newNoteContent;
                    storedNotes[index].previewImages = note.previewImages;
                } else {
                    var storedNotes = {
                        newNote: note.newNote,
                        newNoteContent: note.newNoteContent,
                        selected: false,
                        previewImages: note.previewImages
                    }

                    firebase.database().ref(index).set({
                        newNote: note.newNote,
                        newNoteContent: note.newNoteContent,
                        selected: false,
                        previewImages: note.previewImages
                    });
                    firebase.database().ref(index + '/previewImages/').on('value', function(snap) {

                        if( snap.val() === null ) {

                            firebase.database().ref(index).set({
                                newNote: note.newNote,
                                newNoteContent: note.newNoteContent,
                                selected: false,
                                previewImages: [""]
                            });
                        }
                    });
                    this.ngOnInit();
                }
                storageMethod.default == "localStorage" ? this.updateStoredNotes(storedNotes) : null;
            },

            deleteNote: function(index) {
                this.methodRef.splice(index, 1);
                if(storageMethod.default == "localStorage") {
                    this.updateStoredNotes(this.methodRef);
                } else {
                    firebase.database().ref().set(this.methodRef);
                    this.hideDeleted(index);
                    this.ngOnInit();
                }
            },

            deleteSelectedNotes: function() {

                if(storageMethod.default == "localStorage") {
                    for (var i = (this.methodRef.length - 1); i > -1; i--) {
                        if (this.methodRef[i].selected) {
                            this.methodRef.splice(i, 1);
                        }
                    }
                } else {
                    for (var i = (this.methodRef.length - 1); i > -1; i--) {
                        if (this.methodRef[i].selected) {
                            this.methodRef.splice(i, 1);
                            firebase.database().ref().set(this.methodRef);
                            this.hideDeleted(i);
                        }
                    }
                    this.ngOnInit();
                }

                storageMethod.default == "localStorage" ? this.updateStoredNotes(this.methodRef) : null;
            },

            updateStoredNotes: function(notes) {
                if(storageMethod.default == "localStorage") {
                    localStorage.setItem('notes', JSON.stringify(notes));
                }
            },

            setLocalStorage: function(notes) {
                localStorage.setItem('notes', JSON.stringify(notes));
            },

            hideDeleted: function(index) {
                Object.keys(this.hideme).forEach(h => {
                    this.hideme[h] = false;
                });
                this.hideme[index] = true;
            }

        });

})(window.app || (window.app = {}));