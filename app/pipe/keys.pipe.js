(function (app) {
    app.KeysPipe = ng.core
        .Pipe({
            name: 'values',
            pure: storageMethod.default != "localStorage"
        })
        .Class({
            constructor: function () {},
            transform(value, args){
                var keyArr = Object.keys(value), dataArr = [], keyName = args[0];
                keyArr.forEach(function (key) {
                    value[key][keyName] = key;
                    dataArr.push(value[key]);
                });
                if (args[1]) {
                    dataArr.sort(function (a, b) {
                        return a[keyName] < b[keyName] ? 1 : -1;
                    });
                }
                return dataArr;
            }
        });
})(window.app || (window.app = {}));
