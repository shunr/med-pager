
var app = angular.module('pager', ['ionic', 'ngCordova', 'ionic.service.core', 'ngStorage', 'firebase', 'timer', 'pager.question', 'pager.login', 'pager.menu', 'ui.router'])

app.run(function ($ionicPlatform, $cordovaStatusbar) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if ($cordovaStatusbar) {
           $cordovaStatusbar.overlaysWebView(true);
        }
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

app.controller('mainCtrl', function ($scope, $rootScope, $ionicPlatform, $ionicUser, $authService, $state) {

    $ionicPlatform.ready(function () {

        //check if user is authenticated
        var authDataCallback = function (authData) {
            if (authData) {
                $authService.saveLocalUser(authData);

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
                            "badge": true,
                            "sound": true
                        },
                        "android": {
                            "iconColor": "#343434"
                        }
                    }
                });

                var user = Ionic.User.current();

                var callback = function (pushToken) {
                    console.log('Registered token:', pushToken.token);
                    if (!user.id) {
                        user.id = Ionic.User.anonymousId();
                        // user.id = 'your-custom-user-id';
                    }
                    user.addPushToken(pushToken);
                    user.save(); // you NEED to call a save after you add the token
                }

                push.register(callback);

            } else {
                $authService.clearLocalUser();
            }
        }

        // If something breaks uncomment this
        //authDataCallback(fireRef.getAuth());

        fireRef.onAuth(authDataCallback);
    });

});