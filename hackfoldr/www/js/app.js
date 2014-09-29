// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

// cordovaHttp.get("https://google.com/", {
//     id: 12,
//     message: "test"
// }, { Authorization: "OAuth2: token" }, function(response) {
//     console.log(response.status);
// }, function(response) {
//     console.error(response.error);
// });

angular.module('starter', ['ionic', 'starter.controllers','cgBusy'])
  .factory('q', function() {
    return Q;
  })
  .factory('Lazy', function() {
    return Lazy;
  })
  .factory('appConfig', function() {
    return appConfig;
  })
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })
      .state('app.open', {
        url: "/open",
        templateUrl: "templates/landing.html",
        controller: function($scope,$timeout) {
          console.log('landing');
          //only when the modal is ready
          $timeout(function() {
            //TODO change to ready
            $scope.open();
          },1000)

        }
        // views: {
        //   'appContent': {
        //     templateUrl: "templates/landing.html",
        //     controller: function($scope) {
        //       console.log('landing');
        //       //only when the modal is ready
        //       // $scope.open();

        //     }
        //   }
        // }
      })
      .state('app.foldr.files', {
        url: "/files",
        views: {
          'mainContent': {
            templateUrl: "templates/files.html",
            controller: 'FileListsCtrl'
          },
          'menuContent': {
            templateUrl: "templates/files.html",
            controller: 'FileListsCtrl'
          }
        }
      })
      //TODO become abstract
      .state('app.foldr.single', {
        url: "/file/:fileId",
        views: {
          'menuContent': {
            templateUrl: "templates/files.html",
            controller: 'FileListsCtrl'
          },
          'mainContent': {
            templateUrl: "templates/file.html",
            controller: 'FileCtrl'
          }
        }
      })
      .state('app.foldr.livestream', {
        url: "/file/:fileId/livestream/:livestreamQuery",
        views: {
          'menuContent': {
            templateUrl: "templates/files.html",
            controller: 'FileListsCtrl'
          },
          'mainContent': {
            templateUrl: "templates/livestream.html",
            controller: 'SNSCtrl'
          }
        }
      })

    .state('app.foldr.image', {
      url: "/file/:fileId/image/",
      views: {
        'menuContent': {
          templateUrl: "templates/files.html",
          controller: 'FileListsCtrl'
        },
        'mainContent': {
          templateUrl: "templates/image.html",
          controller: 'ImageCtrl'
        }
      }
    })
      .state('app.foldr', {
        url: "/foldr/:foldrId?isEtherCalc&isRefresh",
        abstract: true,
        templateUrl: "templates/foldr.html",
        resolve: {
          files: ['foldrService', '$stateParams',
            function(foldrService, $stateParams) {
              console.log('foldr states');
              //failed to get $stateParams 2nd time here
              console.log($stateParams.foldrId);
              console.log(foldrService);
              //Pbm here: keep re-open everyt
              var isEtherCalc = $stateParams.isEtherCalc ==="true";
              return foldrService.openFoldr($stateParams.foldrId,isEtherCalc);
            }
          ]
        }



      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/open');
  })
// .run(["$templateCache",
//     function ($templateCache) {
//         $templateCache.put("template/iframe.html",
//             "<div>iframe testing</div>");
//     }
// ]);;
