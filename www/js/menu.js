var ctrl = angular.module('pager.menu', ['firebase', 'ui.router', 'ngStorage'])
var fireRef = new Firebase("https://medpager.firebaseio.com");

ctrl.factory('getCurrentUser', ['$firebaseObject', function ($firebaseObject) {
    return function () {
    };
}]);

ctrl.controller('menuControl', function ($scope, $firebaseObject, $ionicPopup, $state, $ionicViewSwitcher, $localStorage) {
    $scope.logout = function() {
        fireRef.unauth();
    }

    $scope.test = function () {
        $scope.swag = $localStorage.user;
    }


});