var app = angular.module('pager.menu', [])
var fireRef = new Firebase("https://medpager.firebaseio.com");
var usersRef = fireRef.child('users');
var staticRef = fireRef.child('static');

app.controller('menuControl', function (
    $scope,
    $firebaseObject,
    $firebaseUtils,
    $ionicHistory,
    $ionicPopup,
    $state,
    $localStorage,
    $cordovaStatusbar,
    $ionicModal,
    questionService) {

    $scope.title = "MOC Pager";
    $scope.storage = $localStorage;

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
                if ($scope.storage.dailyTime != moment().startOf('day').format()) {
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
    }

    //Set the title of the page to match selected tab
    $scope.titleChange = function (newTitle) {
        $scope.title = newTitle;
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

    $scope.$storage = $localStorage.$default({
        user: {},
        static: {}
    });

    // MENU VISUAL THINGS
    $scope.views = [
        { name: "info", ref: "info" + $scope.$storage.user.uid, icon: "ion-android-home" },
        { name: "patients", ref: "patients", icon: "ion-android-people" },
        { name: "daily", ref: "daily", icon: "ion-android-calendar" },
    ];

    // Highlight current view in menu
    $scope.isViewSelected = function (name) {
        if ($ionicHistory.currentStateName() == 'menu.' + name) {
            return true
        } else {
            return false
        }
    };

    var instructions = $firebaseObject(staticRef.child("instructions"));
    instructions.$loaded(function (data) {
        $scope.$storage.static.instructions = data.$value;
    });

    var patients = $firebaseObject(staticRef.child("patients"));
    patients.$loaded(function (data) {
        $scope.$storage.static.patients = $firebaseUtils.toJSON(data);
    });

    // Settings modal open
    $ionicModal.fromTemplateUrl('settingsModal.html',
        function (modal) {
            $scope.settingsModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up',
            focusFirstInput: true
        });

});

// Settings modal
app.controller('settingsModalCtrl', function ($scope) {
    $scope.hideModal = function () {
        $scope.settingsModal.hide();
    };
});