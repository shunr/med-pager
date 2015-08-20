var ctrl = angular.module('pager.question', ['firebase', 'ui.router', 'utils', 'timer'])
var fireRef = new Firebase("https://medpager.firebaseio.com");
var usersRef = fireRef.child('users');

ctrl.factory('questionService', ['$firebaseObject', '$localstorage', function ($firebaseObject, $localstorage, $scope) {
    //$scope.user = $localstorage.getObject('user');
    return {
        getQuestion: function () {
            //return $localstorage.getObject('user').sid
            //for (i = 0; i < localStorage.length; i++) {
            //    console.log(localStorage.key(i) + "=[" + localStorage.getItem(localStorage.key(i)) + "]");
            //}

            var swag = $firebaseObject(fireRef.child('pagerQuestions').child('Q001'));
            return (swag); 
        },
        //push question answer to appropriate location on firebase user
        setAnswer: function (qref, ans) {
            var answersRef = usersRef.child($localstorage.getObject('user').sid).child('answers');
            answersRef.child(qref).set(ans);
        },
        //push post-question multiple choice to appropriate location on firebase user
        setChoice: function (qref, ans) {
            var choiceRef = usersRef.child($localstorage.getObject('user').sid).child('choices');
            choiceRef.child(qref).set(ans);

            //!TODO! make failsafe in case user becomes unauthed during submission
        },
    };
}]);


ctrl.controller('questionControl', function ($scope, $ionicPopup, $state, $ionicViewSwitcher, $localstorage, questionService) {

    $scope.question = {}
    $scope.question.answer = ""
    $scope.questionRef = {}
    $scope.countdown = 30;

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
            $scope.question.text = data.$value;
            $localstorage.set('currentQuestion', $scope.questionRef.$id);
            $scope.$broadcast('timer-set-countdown-seconds', $scope.countdown);
        });
        
    };

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
                questionService.setChoice($localstorage.get('currentQuestion'), $scope.question.choices.selected);
                $ionicViewSwitcher.nextDirection('forward');
                console.log('Submitted choice to ' + $localstorage.get('currentQuestion') + ": " + $scope.question.choices.selected);
                $localstorage.set('currentQuestion', null);
                $state.go('menu');
                
                
            } else {
                //cancel
                console.log('You are not sure');
            }
        });
    };


});