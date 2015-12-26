var ctrl = angular.module('pager.menu', ['firebase', 'ui.router', 'ngStorage', 'pager.question'])
var fireRef = new Firebase("https://medpager.firebaseio.com");
var usersRef = fireRef.child('users');

ctrl.controller('menuControl', function ($scope, $firebaseObject, $ionicPopup, $state, $ionicViewSwitcher, $localStorage, $cordovaStatusbar, $ionicPlatform, questionService) {

    $scope.title = "MOC Pager";
    $scope.storage = $localStorage
    if (window.StatusBar) {
        $ionicPlatform.ready(function () {
            $cordovaStatusbar.overlaysWebView(true);
            $cordovaStatusbar.styleColor('white');
        });
    }

    $scope.$watch('storage.user', function (val) {
        if (val) {
            var currentUser = $firebaseObject(usersRef.child(val.sid));
            currentUser.$bindTo($scope, "user");
        }
    });

    //Log the currect user out and unauthenticate from firebase
    $scope.logout = function () {
        fireRef.unauth();
    }

    //Set the title of the page to match selected tab
    $scope.titleChange = function (newTitle) {
        $scope.title = newTitle;
    }

    /*$scope.test = function () {
        var alarmTime = new Date();
        alarmTime.setSeconds(alarmTime.getSeconds() + 10);
        $cordovaLocalNotification.add({
            id: "1234",
            date: alarmTime,
            message: "This is a message",
            title: "This is a title",
            autoCancel: true,
            sound: null
        }).then(function () {
            console.log("The notification has been set");
        });
    }*/

    $scope.getDaily = function () {
        $scope.user.dailyQuestions = 5;
        console.log($scope.range($scope.user.dailyQuestions))
    }

    $scope.range = function (count) {
        return new Array(count);
    }

    $scope.toQuestion = function (daily) {
        if (daily) {
            if ($scope.user.dailyQuestions > 0) {
                $scope.user.dailyQuestions -= 1;
            }
        }
        $state.go('question', { isDaily: daily });
    }

});