
var app = angular.module('pager', [
    'ionic',
    'ngStorage',
    'firebase',
    'timer',
    'pager.question',
    'pager.login',
    'pager.menu',
    'pager.utils',
    'ui.router'])

app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
    });
})

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('signup', {
            url: '/signup',
            templateUrl: 'views/signup.html'
        })

        .state('menu', {
            url: '/menu',
            abstract: true,
            templateUrl: 'views/menu2.html',
            controller: 'menuControl'
        })

        .state('menu.info', {
            url: '/info',
            views: {
                'menuContent': {
                    templateUrl: 'views/menu_info.html',
                    controller: 'menuControl'
                }
            }
        })

        .state('menu.patients', {
            url: '/patients',
            views: {
                'menuContent': {
                    templateUrl: 'views/menu_patients.html',
                    controller: 'menuControl'
                }
            }
        })

        .state('menu.daily', {
            url: '/daily',
            views: {
                'menuContent': {
                    templateUrl: 'views/menu_daily.html',
                    controller: 'menuControl'
                }
            }
        })

        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html'
        })

        .state('question', {
            url: '/question',
            templateUrl: 'views/question.html',
            params: {
                isDaily: false,
            }
        })

        .state('choice', {
            url: '/choice',
            templateUrl: 'views/choice.html',
            params: {
                questionRef: "",
            }
        });
    $urlRouterProvider.otherwise('menu/info');

});

app.controller('mainCtrl', function ($scope, $rootScope, $ionicPlatform, $localStorage, $authService, $state, $firebaseArray, $ionicPopup) {

    $ionicPlatform.ready(function () {
        // Check if user is authenticated
        var authDataCallback = function (authData) {
            if (authData) {
                $authService.saveLocalUser(authData);
                registerNotifications();
            } else {
                $authService.clearLocalUser();
            }
        }
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification.local) {
            cordova.plugins.notification.local.on("click", function (notification) {
                $ionicPopup.alert({
                    title: 'New page received',
                    template: 'Please answer the following question within the allotted time.'
                }).then(function () {
                    $state.go('question', { isDaily: false });
                });
                cordova.plugins.notification.local.clearAll();
            });
        }

        fireRef.onAuth(authDataCallback);
    });

    function registerNotifications() {
        var fireRef = new Firebase("https://medpager.firebaseio.com");
        var schedule = $firebaseArray(fireRef.child('schedule'));
        if (!$localStorage.lastNotification) {
            $localStorage.lastNotification = 0;
        }
        cordova.plugins.notification.local.on("schedule", function(notification) {
            $localStorage.lastNotification = moment(notification["at"]).toDate();
        });
        schedule.$loaded(function (data) {
            var now = new Date().getTime();
            data.forEach(function (item) {
                var stime = moment(item.$value).toDate();
                if ($localStorage.lastNotification < stime.getTime()) {
                    var event = {
                        id: item.$id,
                        at: stime,
                        title: "New MOC page!",
                        message: "You have received a new page to answer.",
                        sound: "file://sounds/page.aif",
                    };
                    cordova.plugins.notification.local.schedule(event);
                }
            })
        });
    }
});

