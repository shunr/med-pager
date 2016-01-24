var ctrl = angular.module('pager.menu', ['firebase', 'ui.router', 'ngStorage', 'pager.question'])
var fireRef = new Firebase("https://medpager.firebaseio.com");
var usersRef = fireRef.child('users');

ctrl.controller('menuControl', function ($scope, $firebaseObject, $ionicHistory, $ionicPopup, $state, $cordovaLocalNotification, $localStorage, $cordovaStatusbar, $ionicPlatform, questionService) {

    $scope.title = "MOC Pager";
    $scope.storage = $localStorage

    /*$scope.$on('$ionicView.enter', function () {
        if ($ionicHistory.currentStateName() == "menu") {
            if ($cordovaStatusbar) {
                $cordovaStatusbar.style(1);
            }
        }
    });*/

    $scope.$watch('storage.user', function (val) {
        if (val) {
            var currentUser = $firebaseObject(usersRef.child(val.sid));
            currentUser.$bindTo($scope, "user");
            currentUser.$loaded(function () {
                if ($scope.storage.dailyTime == moment().startOf('day').format()) {
                    console.log("Too soon")
                } else {
                    $scope.user.dailyQuestions = 8;
                    $scope.storage.dailyTime = moment().startOf('day').format();
                    $ionicPopup.alert({
                        title: 'New daily questions',
                        template: 'You have received 8 new questions for today.'
                    });
                }
            })
        }
    });

    //Log the currect user out and unauthenticate from firebase
    $scope.logout = function () {
        fireRef.unauth();
        $localStorage.$reset();
        $cordovaLocalNotification.clearAll()
        $cordovaLocalNotification.cancelAll()
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