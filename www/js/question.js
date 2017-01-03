var ctrl = angular.module('pager.question', []);
var fireRef = new Firebase("https://medpager.firebaseio.com");
var usersRef = fireRef.child('users');
var staticRef = fireRef.child('static');

ctrl.factory('questionService', ['$firebaseObject', '$localStorage', function ($firebaseObject, $localStorage, $scope) {
    return {
        //grab a question from ones not answered
        getQuestion: function () {
            var randIndex = Math.floor(Math.random() * $localStorage.availableQuestions.length);
            return fireRef.child('pagerQuestions').child($localStorage.availableQuestions[randIndex])
        },
        //push question answer to appropriate location on firebase user
        setAnswer: function (qref, ans, isDaily, unsure) {
            var useransRef = usersRef.child($localStorage.user.sid).child('responses');
            var answersRef = fireRef.child('answers').child(qref);
            var starredRef = fireRef.child('starred').child(qref);
            var answerObj = $firebaseObject(fireRef.child('pagerQuestions').child(qref).child('answers').child('first'));
            useransRef.child(qref).set(true);
            if (unsure) {
                starredRef.transaction(function (starred) {
                    return starred + 1;
                });
            }
            answersRef.child($localStorage.user.sid).set({
                'answer': ans,
                'isDaily': isDaily,
                'unsure': unsure,
                'time': Firebase.ServerValue.TIMESTAMP
            })
            answerObj.$loaded(function (data) {
                answersRef.child($localStorage.user.sid).child('isCorrect').set(ans == data.$value);
            });
        },
        //push post-question multiple choice to appropriate location on firebase user
        setChoice: function (qref, ans) {
            var choiceRef = fireRef.child('answers').child(qref);
            var answerObj = $firebaseObject(fireRef.child('pagerQuestions').child(qref).child('answers').child('second'));
            choiceRef.child($localStorage.user.sid).child('choice').set(ans);
            answerObj.$loaded(function (data) {
                choiceRef.child($localStorage.user.sid).child('isChoiceCorrect').set(ans == data.$value);
            });

            //!TODO! make failsafe in case user becomes unauthed during submission
        },
        //save an array of the keys of all the questions in the firebase that the user has not answered.
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


ctrl.controller('questionControl', function (
    $scope,
    $ionicPopup,
    $state,
    $ionicPlatform,
    $ionicViewSwitcher,
    $localStorage,
    $ionicHistory,
    $ionicModal,
    $stateParams,
    $firebaseArray,
    $firebaseObject,
    $firebaseUtils,
    questionService) {

    $scope.question = {};
    $scope.questionRef = {};
    $scope.countdown = 60;
    $scope.selected = {};
    $scope.$storage = $localStorage

    //trigger event when time runs out to auto send and go to next page
    $scope.timeUp = function () {
        if ($scope.questionRef.$id !== undefined) {
            if ($scope.question.selectedChoice) {
                questionService.setAnswer(
                    $scope.questionRef.$id,
                    $scope.question.selectedChoice,
                    $stateParams.isDaily,
                    $scope.question.unsure);
            }
            questionService.saveAvailableQuestions();
            $scope.$broadcast('timer-stop');
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('choice', { questionRef: $scope.questionRef.$id });
            $ionicHistory.clearHistory();
            //console.log('TIMEOUT - Forcibly submitted answer to ' + $scope.questionRef.$id + ": " + $scope.question.selectedChoice);
        } else {
            $scope.$broadcast('timer-stop');
        }
    }

    $scope.submitQuestion = function () {
        if ($scope.question.selectedChoice) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Submit Answer ' + $scope.questionRef.$id,
                template: 'Are you sure you want to submit your answer?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    // Push answer to firebase
                    questionService.setAnswer(
                        $scope.questionRef.$id,
                        $scope.question.selectedChoice,
                        $stateParams.isDaily,
                        $scope.question.unsure);
                    questionService.saveAvailableQuestions();
                    $scope.$broadcast('timer-stop');
                    $ionicViewSwitcher.nextDirection('forward');
                    $state.go('choice', { questionRef: $scope.questionRef.$id });
                    $ionicHistory.clearHistory();
                    //console.log('Submitted answer to ' + $scope.questionRef.$id + ": " + $scope.question.selectedChoice);
                }
            });
        } else {
            $ionicPopup.alert({
                title: 'Submission error',
                template: 'Please select an answer.'
            });
        }
    };

    //parse question text for link to image and use it
    function parseText(data) {
        if (data !== undefined) {
            return data.split("[IMG]")[0]
        }
    }

    function parseImage(data) {
        if (data !== undefined) {
            return data.split("[IMG]")[1]
        }
    }

    $scope.toggleUnsure = function () {
        $scope.question.unsure = !$scope.question.unsure;
    }

    // Generate new question
    $scope.newQuestion = function () {
        var qq = questionService.getQuestion();
        $scope.questionRef = $firebaseObject(qq);
        $scope.questionRef.$loaded(function (data) {
            $scope.question.choices = $firebaseArray(qq.child('choices'));
            $scope.question.text = parseText(data.question);
            $scope.question.image = parseImage(data.question);
            $scope.question.unsure = false;
            $scope.$broadcast('timer-set-countdown-seconds', $scope.countdown);
            $scope.$broadcast('timer-start');
        });
    };

    //Trigger event to start up the question page
    $scope.$on('$ionicView.enter', function () {
        //generate newquestion if on question page
        if ($ionicHistory.currentStateName() == "question") {
            $scope.newQuestion($stateParams.isDaily);
            if (window.StatusBar) {
                StatusBar.hide();
            }
        }
    });

    //Post-questionnaire choices
    var choices = $firebaseArray(staticRef.child("followup"));
    choices.$loaded(function (data) {
        $scope.$storage.followup = $firebaseUtils.toJSON(data);
    });

    //Set selected choice to user selection
    $scope.question.selectedChoice = {};

    $scope.submitChoice = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Submit Answer ' + $stateParams.questionRef,
            template: 'Are you sure you want to submit your answer?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                //push choice to firebase
                questionService.setChoice($stateParams.questionRef, $scope.question.selectedChoice);
                $ionicViewSwitcher.nextDirection('forward');
                $ionicHistory.clearHistory();
                //console.log('Submitted choice to ' + $stateParams.questionRef + ": " + $scope.question.selectedChoice);
                $state.go('menu.info');
                if (window.StatusBar) {
                    StatusBar.show();
                }
            }
        });
    };

    // Patients modal open
    $ionicModal.fromTemplateUrl('views/modals/patients.html', function (modal) {
        $scope.patientsModal = modal;
    }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
});

// Patients modal
app.controller('patientsModalCtrl', function ($scope) {
    $scope.hideModal = function () {
        $scope.patientsModal.hide();
    };
});