var app = angular.module('pager.utils', []);

app.filter('patientsFilter', function () {
    return function (items, search) {
        var result = [];
        console.log(search);

        if (search) {
            
            return result;
        } else {
            return items;
        }
    }
});