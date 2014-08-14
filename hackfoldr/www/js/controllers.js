angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$http) {
  console.log('cordovaHTTP');
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('SNSCtrl', ['$scope','DbService','snsService',function($scope,DbService,snsService) {

$scope.feeds =[];

snsService["facebook"].search(["政總"])
.then(function(data){
  console.log(data.data);

  $scope.feeds = data.data;
  console.log($scope.feeds);
  $scope.$digest();

});


  }])

.controller('FileListsCtrl', ['$scope','DbService','snsService',function($scope,DbService,snsService) {
    // document.addEventListener("deviceready", testing, false);

DbService.init();
    // PhoneGap is ready
    //
  $scope.files = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 }
  ];
}])
.controller('FileCtrl', function($scope, $stateParams) {
});
