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
}])

.controller('SNSCtrl', ['$scope','DbService','snsService',function($scope,DbService,snsService) {

  $scope.feeds =[];
  console.log("SNS init");
  console.log($scope.livestreamQuery);

  $scope.enlargedIndex = -1;

  $scope.$on('enlargedIndexUpdated',function($event, index){
    $scope.enlargedIndex = index;
  })
  $scope.enlargeItem = function($index){
    // $scope.enlargedIndex=$index;
    if(  $scope.enlargedIndex!==$index){
        $scope.$emit('enlargedIndexUpdated',$index);
    }else{
      $scope.$emit('enlargedIndexUpdated',-1);
    }


  }

  var context = snsService["facebook"].searchContext().query($scope.livestreamQuery);

  snsService["facebook"].search(context)
.then(function(data){

  if(data.error){
    throw new Error(data.error.message);
  }

  $scope.feeds = data.data;
  $scope.$digest();

})
.fail(function(err){
  console.error('error');
  console.log(err);
});


  }])

.controller('FileListsCtrl', ['$scope','DbService','snsService','foldrService',function($scope,DbService,snsService,foldrService) {
    // document.addEventListener("deviceready", testing, false);

    function _loadFiles(id){
      foldrService.openFoldr(id)
      .then(function(files){
        $scope.files = files;
        console.log('updated files');
        console.log(files);
        $scope.$apply();
      });
    }

    //ideally should cache but now reload every time
  if(!$scope.currentFoldr){
    $scope.currentFoldr = foldrService.current;

      DbService.init();
        // PhoneGap is
      $scope.files = [];

        _loadFiles($scope.currentFoldr.id);

    $scope.currentFileTitle = '';
    $scope.$watch('currentFoldr.id',function(newVal,oldVal){
      console.log('open new foldr',newVal);
      console.log('oldVal',oldVal);
      if(newVal!=='' && newVal !==oldVal){
        _loadFiles(newVal);
      }
    });

    $scope.$watch('currentFoldr.fileIndex',function(newVal,oldVal){
      console.log('updatedIndex',newVal);
      if(newVal===-1){
        return;
      }
      $scope.currentFileTitle = foldrService.files[foldrService.current.fileIndex].title;
      console.log($scope.currentFileTitle);
    })
  }



}])
.controller('FileCtrl', function($scope, $stateParams,$state,foldrService, $sce) {
  $scope.fileTitle = 'PageName';
$scope.livestreamQuery = $stateParams.livestreamQuery;
console.log($scope.livestreamQuery);
  console.log($stateParams);
  console.log('Redirect');
  console.log(foldrService.current.fileIndex);
  if(foldrService.files.length>0){
    var type = foldrService.files[parseInt($stateParams.fileId)].type;
    $scope.fileTitle = foldrService.files[parseInt($stateParams.fileId)].title;
    foldrService.current.fileIndex = parseInt($stateParams.fileId);
    console.log('updated');
    console.log(foldrService.current.fileIndex);
    if(type==='livestream'){

      console.log('update')
        $state.go("app.livestream", {fileId:$stateParams.fileId, livestreamQuery:foldrService.getFile().livestreamQuery}, {inherit:false,location:false});
    }else{
      $scope.inputUrl = foldrService.getFile().url;
      $scope.url = $sce.trustAsResourceUrl($scope.inputUrl);
    }
  }

  // /livestream/:livestreamQuery



})
