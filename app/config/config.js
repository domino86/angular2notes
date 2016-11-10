//config for fireBase example
var config = {
    apiKey: "AIzaSyBbhTyWinfW4jAUZ4GFwKoIzJ02rjnT9j0",
    authDomain: "angular2notes.firebaseapp.com",
    databaseURL: "https://angular2notes.firebaseio.com",
    storageBucket: "angular2notes.appspot.com",
    messagingSenderId: "186590760267"
};
firebase.initializeApp(config);
//firebase.database.enableLogging(true);


//define api endpoint for store data other than localStorage
var storageMethod = {
    default: "localStorage | fireBase",
    endpoint_url: config.databaseURL + "/"
}

//define method of store data
storageMethod.default = "localStorage";