﻿var ctrl = angular.module('pager.question', ['firebase', 'ui.router', 'timer', 'ngStorage'])
var fireRef = new Firebase("https://medpager.firebaseio.com");
var usersRef = fireRef.child('users');

ctrl.factory('questionService', ['$firebaseObject', '$localStorage', function ($firebaseObject, $localStorage, $scope) {
    //$scope.user = $localStorage.getObject('user');
    return {
        //grab a question from ones not answered
        getQuestion: function () {
            var randIndex = Math.floor(Math.random() * $localStorage.availableQuestions.length);
            return fireRef.child('pagerQuestions').child($localStorage.availableQuestions[randIndex])
        },
        //push question answer to appropriate location on firebase user
        setAnswer: function (qref, ans, isDaily) {
            var useransRef = usersRef.child($localStorage.user.sid).child('responses');
            useransRef.child(qref).set(true);

            var answersRef = fireRef.child('answers').child(qref);
            answersRef.child($localStorage.user.sid).child('answer').set(ans);
            answersRef.child($localStorage.user.sid).child('isDaily').set(isDaily);
            answersRef.child($localStorage.user.sid).child('isCorrect').set(false);
            answersRef.child($localStorage.user.sid).child('time').set(Firebase.ServerValue.TIMESTAMP);
        },
        //push post-question multiple choice to appropriate location on firebase user
        setChoice: function (qref, ans) {
            var choiceRef = fireRef.child('answers').child(qref);
            choiceRef.child($localStorage.user.sid).child('choice').set(ans);
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

    };
}]);


ctrl.controller('questionControl', function ($scope, $ionicPopup, $state, $ionicViewSwitcher, $localStorage, $ionicHistory, $stateParams, $firebaseArray, $firebaseObject, questionService) {

    $scope.question = {};
    $scope.questionRef = {};
    $scope.countdown = 60;
    $scope.selected = {};

    //trigger event when time runs out to auto send and go to next page
    $scope.timeUp = function () {
        if ($scope.questionRef.$id !== undefined) {
            questionService.setAnswer($scope.questionRef.$id, "", $stateParams.isDaily);
            questionService.saveAvailableQuestions();
            $scope.$broadcast('timer-stop');
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('choice', { questionRef: $scope.questionRef.$id });
            $ionicHistory.clearHistory();
            console.log('TIMEOUT - Forcibly submitted answer to ' + $scope.questionRef.$id + ": " + $scope.question.selected);
        } else {
            $scope.$broadcast('timer-stop');
        }
    }

    $scope.submitQuestion = function () {
        if ($scope.question.choices.selected != undefined) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Submit Answer ' + $scope.questionRef.$id,
                template: 'Are you sure you want to submit your answer?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    //push answer to firebase
                    questionService.setAnswer($scope.questionRef.$id, $scope.question.choices.selected, $stateParams.isDaily);
                    questionService.saveAvailableQuestions();
                    $scope.$broadcast('timer-stop');
                    $ionicViewSwitcher.nextDirection('forward');
                    $state.go('choice', { questionRef: $scope.questionRef.$id });
                    $ionicHistory.clearHistory();
                    console.log('Submitted answer to ' + $scope.questionRef.$id + ": " + $scope.question.selected);
                } else {
                    //cancel
                }
            });
        } else {
            $ionicPopup.alert({
                title: 'Submission error',
                template: 'Please select an answer.'
            });
        }
    };

    //!TEMP! generate new question for testing
    $scope.newQuestion = function () {
        $scope.questionRef = $firebaseObject(questionService.getQuestion());
        $scope.question.choices = $firebaseArray(questionService.getQuestion().child('choices'));
        $scope.questionRef.$loaded(function (data) {
            //$scope.question.text = questionService.parseText(data.question.$value);
            //$scope.question.image = questionService.parseImage(data.question.$value);
            $scope.$broadcast('timer-set-countdown-seconds', $scope.countdown);
            $scope.$broadcast('timer-start');
        });
    };

    //parse question text for link to image and use it
    $scope.parseText = function (data) {
        if (data !== undefined) {
            return data.split("[IMG]")[0]
        }
    },
    $scope.parseImage = function (data) {
        if (data !== undefined) {
            return data.split("[IMG]")[1]
        }
    },


    //Trigger event to start up the question page
    $scope.$on('$ionicView.enter', function () {
        //generate newquestion if on question page
        if ($ionicHistory.currentStateName() == "question") {
            $scope.newQuestion($stateParams.isDaily);
        }
    });

    ionic.Platform.ready(function () {
        // hide the status bar using the StatusBar plugin
        if (ionic.Platform.isWebView()) {
            if ($ionicHistory.currentStateName() == "question") {
                ionic.Platform.showStatusBar(false);
            } else {
                ionic.Platform.showStatusBar(true);
            }
        }
    });

    //Post-questionnaire choices
    $scope.question.choices = [
    { text: "This is choice A", value: "A" },
    { text: "This is choice B", value: "B" },
    { text: "This is choice C", value: "C" },
    { text: "This is choice D", value: "D" }
    ];

    //Set selected choice to user selection
    $scope.question.choices.selected = {};

    $scope.submitChoice = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Submit Answer ' + $stateParams.questionRef,
            template: 'Are you sure you want to submit your answer?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                //push choice to firebase
                questionService.setChoice($stateParams.questionRef, $scope.question.choices.selected);
                $ionicViewSwitcher.nextDirection('forward');
                $ionicHistory.clearHistory();
                console.log('Submitted choice to ' + $stateParams.questionRef + ": " + $scope.question.choices.selected);
                $state.go('menu');


            } else {
                //cancel
                console.log('You are not sure');
            }
        });
    };

});
