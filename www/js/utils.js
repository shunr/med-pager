var utils = angular.module('utils', []);

//Easy method to store data locally w/ angular
utils.factory('$localstorage', ['$window', function () {
    return {
        set: function (key, value) {
            localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse(localStorage[key] || '{}');
        }
    }
}]);

