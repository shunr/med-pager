var ctrl = angular.module('pager.question', ['firebase', 'ui.router', 'timer', 'ngStorage'])
var fireRef = new Firebase("https://medpager.firebaseio.com");
var usersRef = fireRef.child('users');

ctrl.factory('questionService', ['$firebaseObject', '$localStorage', function ($firebaseObject, $localStorage, $scope) {
    //$scope.user = $localStorage.getObject('user');
    return {
        //grab a question from ones not answered
        getQuestion: function () {
            var randIndex = Math.floor(Math.random() * $localStorage.availableQuestions.length);
            return $firebaseObject(fireRef.child('pagerQuestions').child($localStorage.availableQuestions[randIndex]))
        },
        //push question answer to appropriate location on firebase user
        setAnswer: function (qref, ans) {
            var answersRef = usersRef.child($localStorage.user.sid).child('responses');
            answersRef.child(qref).child('answer').set(ans);
            answersRef.child(qref).child('time').set(new Date().toDateString());
        },
        //push post-question multiple choice to appropriate location on firebase user
        setChoice: function (qref, ans) {
            var choiceRef = usersRef.child($localStorage.user.sid).child('responses');
            choiceRef.child(qref).child('choice').set(ans);

            //!TODO! make failsafe in case user becomes unauthed during submission
        },
        //save an array of the keys of all teh questions in the firebase that the user has not answered.
        saveAvailableQuestions: function () {
            var userAnswers = $firebaseObject(usersRef.child($localStorage.user.sid).child('responses'));
            var availableQuestions = [];
            var questionsFire = $firebaseObject(fireRef.child('pagerQuestions'));

            questionsFire.$loaded(function (data) {
                data.forEach(function (value, key) {
                    availableQuestions.push(key);
                });
            }).then(function () {
                userAnswers.$loaded(function (data) {
                    data.forEach(function (value, rkey) {
                        var i = availableQuestions.indexOf(rkey);
                        if (i != -1) {
                            availableQuestions.splice(i, 1);
                        }
                    });
                    $localStorage.availableQuestions = availableQuestions;
                })
            });
        },
        //parse question text for link to image and use it
        parseText: function(data) {
            return data.split("[IMG]")[0]
        },
        parseImage: function(data) {
            return data.split("[IMG]")[1]
        }
    };
}]);


ctrl.controller('questionControl', function ($scope, $ionicPopup, $state, $ionicViewSwitcher, $localStorage, questionService) {

    $scope.question = {}
    $scope.question.answer = ""
    $scope.questionRef = {}
    $scope.countdown = 30;

    //trigger event when time runs out to auto send and go to next page
    $scope.timeUp = function () {
        if ($scope.questionRef.$id !== undefined) {
            questionService.setAnswer($scope.questionRef.$id, $scope.question.answer);
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('choice');
            console.log('TIMEOUT - Forcibly submitted answer to ' + $scope.questionRef.$id + ": " + $scope.question.answer);
        } else {
            $scope.$broadcast('timer-stop');
        }
    }

    $scope.submitQuestion = function () {
        if ($scope.question.answer != undefined && $scope.question.answer != "") {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Submit Answer',
            template: 'Are you sure you want to submit your answer?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                //push answer to firebase
                questionService.setAnswer($scope.questionRef.$id, $scope.question.answer);
                questionService.saveAvailableQuestions();
                $scope.$broadcast('timer-stop');
                $ionicViewSwitcher.nextDirection('forward');
                $state.go('choice');
                console.log('Submitted answer to ' + $scope.questionRef.$id + ": " + $scope.question.answer);
            } else {
                //cancel
            }
        });
    } else {
        $ionicPopup.alert({
            title: 'Submission error',
            template: 'The answer field cannot be left blank.'
        });
    }
    };

    //!TEMP! generate new question for testing
    $scope.newQuestion = function () {
        $scope.questionRef = questionService.getQuestion();
        $scope.questionRef.$loaded(function (data) {
            $scope.question.text = questionService.parseText(data.$value);
            $scope.question.image = questionService.parseImage(data.$value);
            $localStorage.currentQuestion = $scope.questionRef.$id;
            $scope.$broadcast('timer-set-countdown-seconds', $scope.countdown);
            $scope.$broadcast('timer-start');
        });
        
    };

    $scope.$on('$ionicView.enter', function () {
        $scope.newQuestion()
    });

    ionic.Platform.ready(function () {
        // hide the status bar using the StatusBar plugin
        StatusBar.hide();
    });

    //Post-questionnaire choices
    $scope.question.choices = [
    { text: "This is choice A", value: "a" },
    { text: "This is choice B", value: "b" },
    { text: "This is choice C", value: "c" },
    { text: "This is choice D", value: "d" }
    ];

    //Set selected choice to user selection
    $scope.question.choices.selected = {};

    $scope.submitChoice = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Submit Answer',
            template: 'Are you sure you want to submit your answer?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                //push choice to firebase
                questionService.setChoice($localStorage.currentQuestion, $scope.question.choices.selected);
                $ionicViewSwitcher.nextDirection('forward');
                console.log('Submitted choice to ' + $localStorage.currentQuestion + ": " + $scope.question.choices.selected);
                $localStorage.currentQuestion = null;
                $state.go('menu');
                
                
            } else {
                //cancel
                console.log('You are not sure');
            }
        });
    };

});