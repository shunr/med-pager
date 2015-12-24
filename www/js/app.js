// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('pager', ['ionic', 'ionic.service.core', 'ionic.service.push', 'ngStorage', 'firebase', 'timer', 'pager.question', 'pager.login', 'pager.menu', 'ui.router', 'ngCordova'])

app.run(function ($ionicPlatform, $authService, $localStorage, $ionicPopup, $state) {
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
        Ionic.io();
        var push = new Ionic.Push({
            "debug": false,
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
        });

        //check if user is authenticated
        function authDataCallback(authData) {
            if (authData) {
                $authService.saveLocalUser(authData);
                push.register(function (token) {
                    // Log out your device token (Save this!)
                    console.log("Got Token:", token.token);
                });

            } else {
                $authService.clearLocalUser();
            }
        }

        authDataCallback(fireRef.getAuth());

        fireRef.onAuth(authDataCallback);

    });
})

app.config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

    /*$ionicAppProvider.identify({
        app_id: '71485aec',
        api_key: 'f4341a2d1799b2eb80189a67fb92477ed6f9348cb7d719ec',
        dev_push: true
    });*/

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