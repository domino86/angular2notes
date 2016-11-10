(function (app) {
    app.KeysPipe = ng.core
        .Pipe({
            name: 'values',
            pure: true
        })
        .Class({
            constructor: function () {},
            transform(value, args){
                var keyArr = Object.keys(value), dataArr_1 = [], keyName_1 = args[0];
                keyArr.forEach(function (key) {
                    value[key][keyName_1] = key;
                    dataArr_1.push(value[key]);
                });
                if (args[1]) {
                    dataArr_1.sort(function (a, b) {
                        return a[keyName_1] > b[keyName_1] ? 1 : -1;
                    });
                }
                return dataArr_1;
            }

        });
})(window.app || (window.app = {}));
