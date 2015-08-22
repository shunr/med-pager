var ctrl = angular.module('pager.login', ['firebase', 'ui.router', 'ngStorage', 'pager.question'])
var fireRef = new Firebase("https://medpager.firebaseio.com");

ctrl.factory('$authService', ['$firebaseObject', '$localStorage', 'questionService', function ($firebaseObject, $localStorage, questionService) {
    return {
        saveLocalUser: function (authData) {
            var email = authData.password.email;
            var userObj = $firebaseObject(fireRef.child('users').orderByChild('email').equalTo(email));
            userObj.$loaded(
                function (data) {
                    data.forEach(function (child) {
                        $localStorage.user = child;
                        questionService.saveAvailableQuestions();
                        console.log('Authenticated as ' + $localStorage.user.email)
                    });

                }
            );
        },
        clearLocalUser: function () {
            $localStorage.user = null;
        }
    }
}]);

//Controller for signup page & user registration
ctrl.controller('loginControl', function ($scope, $firebaseObject, $ionicPopup, $state, $ionicViewSwitcher) {

    $scope.user = {};

    //display message on error
    function loginError(error) {
        $ionicPopup.alert({
            title: 'Login failed',
            template: error
        });
    }

    //Login button press handler
    $scope.loginClick = function () {

        //Validate input
        if (!$scope.user.email) {
            return loginError('Please enter a valid email address.');
        } else if (!$scope.user.pass) {
            return loginError('Please enter a password.');
        }

        //Authenticate user
        fireRef.authWithPassword({
            email: $scope.user.email,
            password: $scope.user.pass,
        }, function (error, authData) {
            if (error) {
                //login failed
                loginError(error);
            } else {
                //login success
            }
        });
    };
});


//Controller for signup page & user registration
ctrl.controller('signupControl', function ($scope, $firebaseObject, $ionicPopup, $ionicViewSwitcher, $state) {

    var sidBank = fireRef.child('studentID');
    var usersRef = fireRef.child('users')

    $scope.data = {};

    //Display template message when there is an issue with registration
    function registrationError(error) {
        $ionicPopup.alert({
            title: 'Registration error',
            template: error
        });
    }

    //Attempt to register user with firebase auth and in the main database
    function registerUser(name, email, pass, sid) {
        //Firebase authentication
        fireRef.createUser({
            email: email,
            password: pass
        }, function (error, userData) {
            if (error) {
                registrationError(error);
            } else {
                //Authenticate user to get write perms
                fireRef.authWithPassword({
                    email: email,
                    password: pass,
                }, function (error, authData) {
                    if (error) {
                        registrationError(error);
                    } else {
                        //if firebase registration success, write new user to database with permissions from previous authentication
                        usersRef.child(sid).set({ name: name, email: email, sid: sid });
                        //hooray message
                        $ionicPopup.alert({
                            title: 'Success',
                            template: 'Your account has been created! You are now logged in.'
                        });
                        //Go to menu
                        $ionicViewSwitcher.nextDirection('forward');
                        $state.go('menu');
                    }
                });
            }
        });
    }

    //Sign up button press handler
    $scope.signupClick = function () {

        //Validate user registration input
        if (!$scope.data.name) {
            return registrationError('Please enter your name.');
        } else if (!$scope.data.email) {
            return registrationError('Please enter a valid email address.');
        } else if (!$scope.data.sid) {
            return registrationError('A valid student ID is required for registration.');
        } else if (!$scope.data.pass) {
            return registrationError('Please enter a password');
        } else if ($scope.data.pass.length < 5) {
            return registrationError('Your password must 5 characters or longer.');
        }

        var sid = $scope.data.sid;

        $firebaseObject(usersRef.child(sid)).$loaded(function (data) {
            if (data.name == undefined) {
                //Validate the entered student ID by attempting to fetch id from firebase
                $firebaseObject(sidBank.child(sid)).$loaded(function (data) {
                    if (data.$value == true) {
                        //Attempt to create firebase user
                        registerUser($scope.data.name, $scope.data.email, $scope.data.pass, $scope.data.sid);
                    } else {
                        registrationError('The student ID you entered does not exist.');
                    }
                });
            } else {
                //User in firebase/users/ found
                registrationError('The student ID you entered is already registered to an account.');
            }

        });

    };
});