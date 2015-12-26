// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('pager', ['ionic', 'ngCordova', 'ionic.service.core', 'ionic.service.push', 'ngStorage', 'firebase', 'timer', 'pager.question', 'pager.login', 'pager.menu', 'ui.router'])

app.config(['$ionicAppProvider', function ($ionicAppProvider) {
    // Identify app
    $ionicAppProvider.identify({
        app_id: '71485aec',
        api_key: 'f4341a2d1799b2eb80189a67fb92477ed6f9348cb7d719ec',
        //dev_push: true
    });
}])

app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.style(0);
        }
        //Set up push
        /*Ionic.io();
        var push = new Ionic.Push({
            "debug": true,
            "onNotification": function (notification) {
                var payload = notification.payload;
                console.log(notification, payload);
                $state.go('question', { isDaily: false });
            },
            "onRegister": function (data) {
                console.log(data.token);
            },
            "pluginConfig": {
                "ios": {
                    "alert": true,
                    "badge": true,
                    "sound": true,
                    "payload": { "$state": "question", "$stateParams": "{ isDaily: false }" }
                }
            }
        });*/
    });
})

app.config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

    $stateProvider

      .state('signup', {
          url: '/signup',
          templateUrl: 'signup.html'
      })

      .state('menu', {
          url: '/menu',
          templateUrl: 'menu.html'
      })

      .state('login', {
          url: '/login',
          templateUrl: 'login.html'
      })

      .state('question', {
          url: '/question',
          templateUrl: 'question.html',
          params: {
              isDaily: false,
          }
      })

      .state('choice', {
          url: '/choice',
          templateUrl: 'choice.html',
          params: {
              questionRef: "",
          }
      })
    ;

    // if none of the above states are matched, use this as the fallback

    $urlRouterProvider.otherwise('/menu');

});

app.controller('mainCtrl', function ($scope, $rootScope, $ionicPlatform, $ionicUser, $ionicPush, $authService, $state) {

    $ionicPlatform.ready(function () {
        //check if user is authenticated
        var authDataCallback = function (authData) {
            if (authData) {
                $authService.saveLocalUser(authData);

                if (!$scope.identified) {
                    var user = $ionicUser.get();
                    if (!user.user_id) {
                        // Set your user_id here, or generate a random one.
                        user.user_id = $ionicUser.generateGUID();
                    };
                    angular.extend(user, {
                        name: 'Pager User',
                    });
                    // Identify your user with the Ionic User Service

                    $ionicUser.identify(user).then(function () {
                        $scope.identified = true;
                        console.log('Identified user ' + user.name + '\n ID ' + user.user_id);
                        $ionicPush.register({
                            canShowAlert: true, //Can pushes show an alert on your screen?
                            canSetBadge: true, //Can pushes update app icon badges?
                            canPlaySound: true, //Can notifications play a sound?
                            canRunActionsOnWake: true, //Can run actions outside the app,
                            onNotification: function (notification) {
                                var payload = notification.payload;
                                console.log(notification, payload);
                                $state.go('question', { isDaily: false });
                                return true;
                            }
                        });
                    });
                }
            } else {
                $authService.clearLocalUser();
            }
        }

        // If something breaks uncomment this
        //authDataCallback(fireRef.getAuth());

        fireRef.onAuth(authDataCallback);
    });

    //Catch push registration event
    $rootScope.$on('$cordovaPush:tokenReceived', function (event, data) {
        alert("Successfully registered token " + data.token);
        console.log('Ionic Push: Got token ', data.token, data.platform);
        $scope.token = data.token;
    });

});
