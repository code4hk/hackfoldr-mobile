angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', ['$scope', '$ionicModal', '$timeout', '$http', 'foldrService', '$state',
  function($scope, $ionicModal, $timeout, $http, foldrService, $state) {
    console.log('AppCtrl init');
    // Form data for the login modal
    $scope.folderData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/open-folder.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      //     // open by default
      // $scope.open();
    });

    $scope.message = 'fromAppCtrl';


    // Triggered in the login modal to close it
    $scope.closeOpenModal = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.open = function() {
      $scope.modal.show();
    };



    // //wild guess as workaround
    function checkISEtherCalc(id){
      return id.length<30;
    }

    var isEtherCalc = false;


    // Perform the login action when the user submits the login form
    $scope.doOpen = function() {
      console.log('Doing login', $scope.folderData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      // $scope.folderData.id = '1QAy9rgAy1Szhm5FwTCLHd6H3ZVR4QoGcQ8KiTpx_7dk';
      var id=$scope.folderData.id;
      if(!id && $scope.folderData.url){
//Trace redirect
        var url = $scope.folderData.url;
        //TODO support true go to the site instead of url, to support self-hosted hackfoldr
        id = url.match("hack.etblue.tw/([^/]*)")[1];
      }
      isEtherCalc = checkISEtherCalc(id);
      foldrService.current.id = id;
      console.log(foldrService.current);
      $state.go("app.foldr.files", {
        foldrId: foldrService.current.id,
        isEtherCalc:isEtherCalc
      });
      $timeout(function() {
        $scope.closeOpenModal();
      }, 1000);

    };
    //test


    console.log('init');
  }
])

.controller('SNSCtrl', ['$scope', 'DbService', 'snsService',
  function($scope, DbService, snsService) {

    $scope.feeds = [];
    console.log("SNS init");
    console.log($scope.livestreamQuery);

    $scope.enlargedIndex = -1;

    $scope.$on('enlargedIndexUpdated', function($event, index) {
      $scope.enlargedIndex = index;
    })
    $scope.enlargeItem = function($index) {
      // $scope.enlargedIndex=$index;
      if ($scope.enlargedIndex !== $index) {
        $scope.$emit('enlargedIndexUpdated', $index);
      } else {
        $scope.$emit('enlargedIndexUpdated', -1);
      }


    }

    var context = snsService["facebook"].searchContext().query($scope.livestreamQuery);

    snsService["facebook"].search(context)
      .then(function(data) {

        if (data.error) {
          throw new Error(data.error.message);
        }

        $scope.feeds = data.data;
        $scope.$digest();

      })
      .fail(function(err) {
        console.error('error');
        console.log(err);
      });


  }
])
.controller('FileListsCtrl',['$scope','$stateParams','files',function($scope, $stateParams, files) {
  console.log('init foldr');
  $scope.currentFoldrId = $stateParams.foldrId;
  $scope.files = files;

  var displayedFiles = [];
  //quite stupid to make it nested then flatten it back

  Lazy($scope.files).each(function(file){


    displayedFiles.push(file);
    if(file.type==="folder"){
      file.files = Lazy(file.files).map(function(subFile){
          subFile.parent = file.id;
          return subFile;
      }).value();
      displayedFiles.push(file.files);
    }
  });

  $scope.displayedFiles = Lazy(displayedFiles).flatten().value();

}])
// .controller('FileListsCtrl2', ['$scope', 'DbService', 'snsService', 'foldrService', 'files',
//   function($scope, DbService, snsService, foldrService, files) {
//     // document.addEventListener("deviceready", testing, false);
//     console.log('file list ctrl init');
//
//     // .then(function(feed) {
//     //           //cache feed
//     //           //TODO bulk sql
//     //           var CACHE_EVERYTHING_WHEN_INIT=true;
//
//     //           if(!CACHE_EVERYTHING_WHEN_INIT){
//     //             return;
//     //           }
//     //           //If enabled cache when start
//     //           // Lazy(feed).each(function(item) {
//     //           //   if (item.type === 'image') {
//     //           //     if(!item.url){
//     //           //       return;
//     //           //     }
//     //           //     var key=md5Util.md5(item.url);
//     //           //     CacheService.getCacheImage(key)
//     //           //     .then(function(results) {
//     //           //       console.log(arguments);
//     //           //       if(results.length>0){
//     //           //         console.log('cache hit');
//     //           //       }else{
//     //           //         //cache miss;
//     //           //         console.log('cache miss');
//     //           //         CacheService.cacheImage(key,item.url);
//     //           //       }
//     //           //     });
//
//     //           //   }
//     //           // });
//     //           return feed;
//     //         })
//
//
//     function _loadFiles(id) {
//       $scope.files = files;
//       console.log('updated files');
//       console.log(files);
//       // $scope.$apply();
//     }
//
//     //ideally should cache but now reload every time
//     if (!$scope.currentFoldr) {
//       $scope.currentFoldr = foldrService.current;
//
//       DbService.init();
//       // PhoneGap is
//       $scope.files = [];
//
//       _loadFiles($scope.currentFoldr.id);
//
//       $scope.currentFileTitle = '';
//       $scope.$watch('currentFoldr.id', function(newVal, oldVal) {
//         console.log('open new foldr', newVal);
//         console.log('oldVal', oldVal);
//         if (newVal !== '' && newVal !== oldVal) {
//           _loadFiles(newVal);
//         }
//       });
//
//       $scope.$watch('currentFoldr.fileIndex', function(newVal, oldVal) {
//         console.log('updatedIndex', newVal);
//         if (newVal === -1) {
//           return;
//         }
//         $scope.currentFileTitle = foldrService.files[foldrService.current.fileIndex].title;
//         console.log($scope.currentFileTitle);
//       })
//     }
//
//
//
//   }
// ])
  .controller('FileCtrl', function($scope, $stateParams, $state, foldrService, $sce) {
    $scope.fileTitle = 'PageName';
    $scope.livestreamQuery = $stateParams.livestreamQuery;
    console.log($scope.livestreamQuery);
    console.log($stateParams);
    console.log('Redirect');
    console.log(foldrService.current.fileIndex);
    if (foldrService.files.length > 0) {
      var type = foldrService.files[parseInt($stateParams.fileId)].type;
      $scope.fileTitle = foldrService.files[parseInt($stateParams.fileId)].title;
      foldrService.current.fileIndex = parseInt($stateParams.fileId);
      console.log('updated');
      console.log(foldrService.current.fileIndex);
      if (type === 'livestream') {

        console.log('update')
        $state.go("app.foldr.livestream", {
          fileId: $stateParams.fileId,
          foldrId : $stateParams.foldrId,
          livestreamQuery: foldrService.getFile().livestreamQuery
        }, {
          inherit: false,
          location: false
        });
      } else if (type === "image") {
        console.log('its images');
        //inject here
        $state.go("app.foldr.image", {
          fileId: $stateParams.fileId,
          foldrId : $stateParams.foldrId,
          imageName: null
        }, {
          inherit: false,
          location: false
        });
      } else {
        $scope.inputUrl = foldrService.getFile().url;
        $scope.url = $sce.trustAsResourceUrl($scope.inputUrl);
      }
    }

    // /livestream/:livestreamQuery



  })
