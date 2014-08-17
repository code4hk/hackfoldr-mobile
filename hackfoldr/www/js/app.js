// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

console.log(window);
// cordovaHttp.get("https://google.com/", {
//     id: 12,
//     message: "test"
// }, { Authorization: "OAuth2: token" }, function(response) {
//     console.log(response.status);
// }, function(response) {
//     console.error(response.error);
// });

angular.module('starter', ['ionic', 'starter.controllers'])
.factory('q', function () {
    return Q;
})
.factory('Lazy', function () {
    return Lazy;
})
.factory('appConfig',function(){
  return appConfig;
})
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
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
    .state('app.browse', {
      url: "/browse",
      views: {
        'mainContent' :{
          templateUrl: "templates/browse.html"
        }
      }
    })
    .state('app.files', {
      url: "/files",
      views: {
        'menuContent' :{
          templateUrl: "templates/files.html",
          controller: 'FileListsCtrl'
        },
        'mainContent' :{
          templateUrl: "templates/files.html",
          controller: 'FileListsCtrl'
        }
      }
    })
  .state('app.livestream', {
    url: "/file/:fileId/livestream/:livestreamQuery",
    views: {
      'menuContent' :{
        templateUrl: "templates/files.html",
        controller: 'FileListsCtrl'
      },
      'mainContent' :{
        templateUrl: "templates/livestream.html",
        controller: 'FileCtrl'
      }
    }
  })

    .state('app.image', {
      url: "/file/:fileId/image/",
      views: {
        'menuContent' :{
          templateUrl: "templates/files.html",
          controller: 'FileListsCtrl'
        },
        'mainContent' :{
          templateUrl: "templates/image.html",
          controller: 'FileCtrl'
        }
      }
    })
    .state('app.single', {
      url: "/file/:fileId",
      views: {
        'menuContent' :{
          templateUrl: "templates/files.html",
          controller: 'FileListsCtrl'
        },
        'mainContent' :{
          templateUrl: "templates/file.html",
          controller: 'FileCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/files');
})
// .run(["$templateCache",
//     function ($templateCache) {
//         $templateCache.put("template/iframe.html",
//             "<div>iframe testing</div>");
//     }
// ]);;
