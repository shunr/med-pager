var ctrl = angular.module('pager.menu', ['firebase', 'ui.router'])
var fireRef = new Firebase("https://medpager.firebaseio.com");

ctrl.factory('getCurrentUser', ['$firebaseObject', function ($firebaseObject) {
    return function () {
    };
}]);

ctrl.controller('menuControl', function ($scope, $firebaseObject, $ionicPopup, $state, $ionicViewSwitcher) {
    $scope.logout = function() {
        fireRef.unauth();
    }

});