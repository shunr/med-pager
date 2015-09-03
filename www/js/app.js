// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('pager', ['ionic','ngStorage', 'firebase', 'timer', 'pager.question', 'pager.login', 'pager.menu', 'ui.router'])

app.run(function ($ionicPlatform, $authService, $localStorage, $ionicPopup) {
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

        //check if user is authenticated
        function authDataCallback(authData) {
            if (authData) {
                $authService.saveLocalUser(authData)
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