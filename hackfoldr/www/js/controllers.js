angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', ['$scope', '$ionicModal', '$timeout','$http','foldrService',function($scope, $ionicModal, $timeout,$http,foldrService) {
  console.log('cordovaHTTP');
  // Form data for the login modal
  $scope.folderData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/open-folder.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });


  // Triggered in the login modal to close it
  $scope.closeOpenModal = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.open = function() {
    $scope.modal.show();
  };


  // Perform the login action when the user submits the login form
  $scope.doOpen = function() {
    console.log('Doing login', $scope.folderData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system

    var id = '1QAy9rgAy1Szhm5FwTCLHd6H3ZVR4QoGcQ8KiTpx_7dk';

    foldrService.current.id = id;
    console.log(foldrService.current);
    $timeout(function() {
      $scope.closeOpenModal();
    }, 1000);

  };
  //test
  $scope.doOpen();
}])

.controller('SNSCtrl', ['$scope','DbService','snsService',function($scope,DbService,snsService) {

$scope.feeds =[];

snsService["facebook"].search(["政總"])
.then(function(data){

  if(data.error){
    throw new Error(data.error.message);
  }
  console.log(data.data);
  $scope.feeds = data.data;
  console.log($scope.feeds);
  $scope.$digest();

})
.fail(function(err){
  console.log('error');
  console.log(err);
});


  }])

.controller('FileListsCtrl', ['$scope','DbService','snsService','foldrService',function($scope,DbService,snsService,foldrService) {
    // document.addEventListener("deviceready", testing, false);
  if(!$scope.currentFoldr){
    $scope.currentFoldr = foldrService.current;
    $scope.$watch('currentFoldr.id',function(newVal,oldVal){
      console.log('open new foldr');
      if(newVal!==''){
        foldrService.openFoldr(newVal)
        .then(function(files){
          $scope.files = files;
          console.log('updated files');
        });
      }
    })
  }


  DbService.init();
    // PhoneGap is ready
  $scope.files = [];

}])
.controller('FileCtrl', function($scope, $stateParams,$state,foldrService) {
  $scope.fileTitle = 'PageName';
  console.log($stateParams);
  console.log('Redirect');
  console.log(foldrService.current.fileIndex);
  if(foldrService.files.length>0){
    var type = foldrService.files[parseInt($stateParams.fileId)].type;
    $scope.fileTitle = foldrService.files[parseInt($stateParams.fileId)].title;
    if(type==='livestream'){
      console.log('update')
        $state.go("app.livestream", {fileId:$stateParams.fileId, livestreamQuery:'abcde'}, {inherit:false,location:false});
    }
  }

  // /livestream/:livestreamQuery



})
