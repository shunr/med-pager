var app = angular.module('pager.menu', [])
var fireRef = new Firebase("https://medpager.firebaseio.com");
var usersRef = fireRef.child('users');
var staticRef = fireRef.child('static');

app.controller('menuControl', function (
    $scope,
    $firebaseObject,
    $ionicHistory,
    $ionicPopup,
    $state,
    $cordovaLocalNotification,
    $localStorage,
    $cordovaStatusbar,
    $ionicPlatform,
    $ionicModal,
    questionService) {

    $scope.title = "MOC Pager";
    $scope.storage = $localStorage;

    /*$scope.$on('$ionicView.enter', function () {
        if ($ionicHistory.currentStateName() == "menu") {
            if ($cordovaStatusbar) {
                $cordovaStatusbar.style(1);
            }
        }
    });*/

    $scope.$watch('storage.user', function (val) {
        if (val) {
            var currentUser = $firebaseObject(usersRef.child(val.sid));
            currentUser.$bindTo($scope, "user");
            currentUser.$loaded(function () {
                if ($scope.storage.dailyTime != moment().startOf('day').format()) {
                    $scope.user.dailyQuestions = 8;
                    $scope.storage.dailyTime = moment().startOf('day').format();
                    $ionicPopup.alert({
                        title: 'New daily questions',
                        template: 'You have received 8 new questions for today.'
                    });
                }
            })
        }
    });

    //Log the currect user out and unauthenticate from firebase
    $scope.logout = function () {
        fireRef.unauth();
    }

    //Set the title of the page to match selected tab
    $scope.titleChange = function (newTitle) {
        $scope.title = newTitle;
    }

    $scope.range = function (count) {
        return new Array(count);
    }

    $scope.toQuestion = function (daily) {
        if (daily) {
            if ($scope.user.dailyQuestions > 0) {
                $scope.user.dailyQuestions -= 1;
            }
        }
        $state.go('question', { isDaily: daily });
    }

    $scope.$storage = $localStorage.$default({
        user: {},
        static: {}
    });

    // MENU VISUAL THINGS
    $scope.views = [
        { name: "info", ref: "info" + $scope.$storage.user.uid, icon: "ion-android-home" },
        { name: "patients", ref: "patients", icon: "ion-android-people" },
        { name: "daily", ref: "daily", icon: "ion-android-calendar" },
    ];

    // Highlight current view in menu
    $scope.isViewSelected = function (name) {
        if ($ionicHistory.currentStateName() == 'menu.' + name) {
            return true
        } else {
            return false
        }
    };

    // Big patients list generated using CSV to JSON
    $scope.patients = {
        "Neuro": [
            {
                "room": "5143-3",
                "name": "Desforest, Claudette",
                "ageGender": "72F",
                "admittedWith": "Cerebral aneurysm, scheduled for surgery tomorrow morning",
                "PMHx": "A fib, on warfarin, renal insufficiency, Cushing’s Syndrome",
                "issues": ""
            },
            {
                "room": "5151-2",
                "name": "Specter, James",
                "ageGender": "55M",
                "admittedWith": "Frontal bone fracture, surgery scheduled for today",
                "PMHx": "Alcoholic, HTN\nHypothyroid, chronic anemia",
                "issues": ""
            },
            {
                "room": "5187-2",
                "name": "Ihejirika, Dalitso",
                "ageGender": "46M",
                "admittedWith": "Vestibular schwannoma, scheduled for surgery in 3 days",
                "PMHx": "A fib, on warfarin \nMRSA +ve",
                "issues": ""
            }],
        "Plastics": [
            {
                "room": "5341-4",
                "name": "Darzi, Salma",
                "ageGender": "53F",
                "admittedWith": "Breast reconstruction surgery POD#0",
                "PMHx": "BRCA1 mutation, double mastectomy.",
                "issues": ""
            },
            {
                "room": "5377-1",
                "name": "Hunter, Geoffrey",
                "ageGender": "26M",
                "admittedWith": "Third degree burn of right hand",
                "PMHx": "IV drug user, HIV +ve",
                "issues": "Dehydrated"
            },
            {
                "room": "5381-4",
                "name": "Poulin, Jasmine",
                "ageGender": "38F",
                "admittedWith": "Maxillary sinus fracture, scheduled for surgery today",
                "PMHx": "A fib, on warfarin \nEpilepsy",
                "issues": ""
            }],
        "Gen Surg": [
            {
                "room": "5423-3",
                "name": "Moreau, Charlotte",
                "ageGender": "77F",
                "admittedWith": "Stage II NSCLC in left upper lobe, lobectomy. POD#0",
                "PMHx": "Alzheimer’s, penicillin allergy, HTN, hypothyroid",
                "issues": "Receiving hydralazine PO"
            },
            {
                "room": "5468-2",
                "name": "Rey, Laia",
                "ageGender": "23F",
                "admittedWith": "Rectal prolapse, scheduled for surgery this afternoon",
                "PMHx": "Cystic fibrosis",
                "issues": ""
            },
            {
                "room": "5486-3",
                "name": "Levine, Eli",
                "ageGender": "65M",
                "admittedWith": "Cholecystitis, scheduled for this afternoon",
                "PMHx": "T2DM, HTN, \nAlcoholic, PUD, long QT, chronic back pain",
                "issues": "Developed productive cough yesterday, yellow sputum"
            },
            {
                "room": "5502-1",
                "name": "Kader, Amira",
                "ageGender": "20F",
                "admittedWith": "Acute appendicitis, 65kg, POD#0",
                "PMHx": "Peptic ulcer last year\nDepression",
                "issues": "Post-op fever"
            },
            {
                "room": "5508-4",
                "name": "Öman, Robert",
                "ageGender": "78M",
                "admittedWith": "Colorectal cancer, surgery scheduled for tomorrow",
                "PMHx": "Severe HTN, previous MI, obese, T2DM \nMRSA +ve",
                "issues": "Jehovah’s Witness"
            }],
        "Vascular": [
            {
                "room": "5514-2",
                "name": "Zhu, Jiang",
                "ageGender": "60F",
                "admittedWith": "Infected aortic graft, axillofemoral bypass POD#2",
                "PMHx": "CAD, PVD",
                "issues": "Surgical wound infection, fever"
            },
            {
                "room": "5520-3",
                "name": "Lavigne, Yvonne",
                "ageGender": "44F",
                "admittedWith": "Type A aortic dissection, POD#0",
                "PMHx": "Marfan’s",
                "issues": ""
            },
            {
                "room": "5522-2",
                "name": "Patrickson, Jacob",
                "ageGender": "62M",
                "admittedWith": "Below knee amputation, left leg, POD#1",
                "PMHx": "PVD, CAD",
                "issues": ""
            },
            {
                "room": "5531-2",
                "name": "Lehrer, Bruno",
                "ageGender": "82M",
                "admittedWith": "6.0 cm AAA, scheduled for surgery in two days",
                "PMHx": "Dabigatran for previous DVT",
                "issues": "Lives alone at home"
            }],
        "ENT": [
            {
                "room": "5532-3",
                "name": "Mohammed, Halim",
                "ageGender": "71M",
                "admittedWith": "Supraglottic laryngeal SCC, surgery scheduled for tomorrow",
                "PMHx": "COPD, chronic kidney disease, hemodialysis, Bioprosthetic aortic valve",
                "issues": ""
            },
            {
                "room": "5550-4",
                "name": "Afolayan, Gbemisola",
                "ageGender": "64F",
                "admittedWith": "Cholesteotoma in left ear, surgery scheduled for in 2 days",
                "PMHx": "T2DM, obese, OSA, COPD",
                "issues": ""
            }],
        "Urology": [
            {
                "room": "5569-1",
                "name": "Maguire, Ryan",
                "ageGender": "33M",
                "admittedWith": "Kidney stones, lithotripsy scheduled for today",
                "PMHx": "Crohn’s disease",
                "issues": ""
            },
            {
                "room": "5573-1",
                "name": "Ljungborg, Hjalmar",
                "ageGender": "66M",
                "admittedWith": "Trauma, nephrectomy POD#1",
                "PMHx": "DVT in 2011, PE in 2012 after knee replacement, on warfarin",
                "issues": "Post-op note indicates concern for continued bleeding"
            },
            {
                "room": "5588-1",
                "name": "Doyle, Patrick",
                "ageGender": "78M",
                "admittedWith": "Prostatectomy scheduled for morning",
                "PMHx": "Prostate cancer, had chemotherapy.\nA fib, on warfarin.  \nT2DM, HTN.",
                "issues": ""
            },
            {
                "room": "5598-2",
                "name": "Lim, Yin",
                "ageGender": "55F",
                "admittedWith": "Bladder reconstruction surgery, POD#0",
                "PMHx": "Bladder cancer, alcoholism, GERD",
                "issues": ""
            }],
        "Cardiac": [
            {
                "room": "5600-1",
                "name": "El-Hashem, Najwa",
                "ageGender": "49F",
                "admittedWith": "Cardiac transplant, POD#0",
                "PMHx": "Severe CAD, hyperparathyroidism, recurrent UTIs",
                "issues": ""
            },
            {
                "room": "5608-2",
                "name": "Matsushita, Michi",
                "ageGender": "76M",
                "admittedWith": "CABG, POD#2",
                "PMHx": "CAD, PCI in 2014",
                "issues": "SOB"
            },
            {
                "room": "5615-4",
                "name": "Salomon, Ira",
                "ageGender": "50M",
                "admittedWith": "Decompensated CHF, mitral valve replacement scheduled for tomorrow",
                "PMHx": "Penicillin allergy (anaphylaxis)\nFibromyalgia, chronic pain",
                "issues": ""
            }],
        "Obs/Gyn": [
            {
                "room": "5617-4",
                "name": "Paquet, Pascale",
                "ageGender": "32F",
                "admittedWith": "Caesarian section for triplets, scheduled for tomorrow",
                "PMHx": "Penicillin allergy",
                "issues": "Evidence of chorioamnionitis"
            },
            {

                "room": "5632-2",
                "name": "Deniaud, Murielle",
                "ageGender": "59F",
                "admittedWith": "Hysterectomy and oopherectomy, POD#2",
                "PMHx": "Uterine cancer\nCKD (CrCl 35mL/min)",
                "issues": ""
            }],
        "Ortho": [
            {
                "room": "5695-3",
                "name": "Scheinberg, Joshua",
                "ageGender": "64M",
                "admittedWith": "RL ACL reconstruction scheduled in 2 days",
                "PMHx": "Type I diabetes, bioprosthetic valve, on warfarin",
                "issues": ""
            },
            {
                "room": "5289-3",
                "name": "Labelle, Élise",
                "ageGender": "42F",
                "admittedWith": "Lumbar laminectomy, POD#5",
                "PMHx": "T2DM, obese",
                "issues": "Lost 1.5L blood during surgery"
            },
            {
                "room": "5296-1",
                "name": "Ralph, Robert",
                "ageGender": "46M",
                "admittedWith": "Hip replacement, POD#1",
                "PMHx": "Multiple sclerosis, A fib, on warfarin and metoprolol",
                "issues": "DVT in RL, warfarin held for surgery"
            },
            {
                "room": "5300-2",
                "name": "Kwok, Ling",
                "ageGender": "88F",
                "admittedWith": "Spiral fracture of right tibia, scheduled for surgery today",
                "PMHx": "Dementia, depression, hypotension\nA fib, on warfarin",
                "issues": "Need to discuss category status\nSLP consult pending"
            }
        ]
    }

    var instructions = $firebaseObject(staticRef.child("instructions"));
    instructions.$loaded(function (data) {
        $scope.$storage.static.instructions = data.$value;
    });

    // Settings modal open
    $ionicModal.fromTemplateUrl('settingsModal.html',
        function (modal) {
            $scope.settingsModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up',
            focusFirstInput: true
        });

});

// Settings modal
app.controller('settingsModalCtrl', function ($scope) {
    $scope.hideModal = function () {
        $scope.settingsModal.hide();
    };
});