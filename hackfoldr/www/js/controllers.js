angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', ['$scope', '$ionicModal', '$timeout', '$http', 'foldrService', '$state',
  function($scope, $ionicModal, $timeout, $http, foldrService, $state) {
    console.log('AppCtrl init');
    // Form data for the login modal
    $scope.folderData = {};

    $scope.folderData.url = 'hack.etblue.tw/';
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


    $scope.refresh = function(){
      //reload and set force refresh flag
      console.log('refresh');
      //TODO current state?
      // https://mwop.net/blog/2014-05-08-angular-ui-router-reload.html
      $state.go('.', {"isRefresh":true}, { reload: true });

    //   $state.transitionTo($state.current, $stateParams, {
    //   reload: true, inherit: false, notify: false
    // });
    }


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

    $scope.openToday = function() {
      var url = 'https://raw.githubusercontent.com/code4hk/hackfoldr-2.0/master/today.code4.hk';
      $http.get(url).then(function(data){
        var id = data.data;
        $scope.folderData.id = id;
        $scope.doOpen();


      })
    };

    console.log('init');
  }
])

.controller('SNSCtrl', ['$scope', 'CacheService', 'snsService','$stateParams',
  function($scope, CacheService, snsService,$stateParams) {

    $scope.feeds = [];
    var livestreamQuery = $stateParams.livestreamQuery;
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

    //use cache first, then try auto refresh, only replace when successful
    function _cacheFeedItems(key,feeds){
      //TODO return promise
      Lazy(feeds).each(function(item){
        //quite coupled to fb for nows
        CacheService.cacheSocialFeed(key,item.id, item,item.link);
      });

    }

    function _loadFeedFromCache(key){
      return CacheService.getCacheSocialFeed(key);
    }

    Pace.options = {
      restartOnRequestAfter: true
    }
    function _loadFeedFromSNS(context){
          Pace.start();

        return snsService["facebook"].search(context)
          .then(function(data) {
            if (data.error) {
              throw new Error(data.error.message);
            }
            if(data.data){
              $scope.feeds = data.data;
              Pace.stop();
              return _cacheFeedItems(context.getQuery(),$scope.feeds);
            }
          })
          .then(function(){
            var updatedTimestamp = Date.now();
            $scope.lastUpdated = updatedTimestamp;
          })
          .finally(function(){
            Pace.stop();
          })
    }

    function _parseItems(results){
      return Lazy(results).map(function(item){
        return JSON.parse(item.data);
      }).value();

    }

    function _init(){
      var context = snsService["facebook"].searchContext().query(livestreamQuery);
      _loadFeedFromCache(context.getQuery())
      .then(function(results){
        if(results.length>0){

          $scope.feeds = _parseItems(results);

          _loadFeedFromSNS(context);

        }else{
          return _loadFeedFromSNS(context);

        }

      })
      .finally(function(){
        $scope.$digest();
      })

    }

      _init();


}])
.controller('ImageCtrl', ['$scope', 'CacheService','$stateParams','FileUtil','files','md5Util',
  function($scope, CacheService,$stateParams,fileUtil,files,md5Util) {

console.log('$stateParams');
// imageToDisplay

$scope.imageToDisplay;

var displayedFiles = fileUtil.initDisplayedFiles(files);
$scope.file = displayedFiles[parseInt($stateParams.fileId)];

var key=md5Util.md5($scope.file.url);


//TODO don't even run this SQL when isRefresh. setup promise.
  CacheService.getCacheImage(key)
  .then(function(results) {
    var isRefresh = !!$stateParams.isRefresh;
    if(results.length>0 && !isRefresh){
      console.log('cache hit');


    }else{
      console.log('cache miss');
      $scope.imageToDisplay = $scope.file.url;
      $scope.$apply();
      CacheService.cacheImage(key,$scope.file.url);

    }
  });

  }])
.controller('FileListsCtrl',['$scope','$stateParams','files','$state','FileUtil',
function($scope, $stateParams, files,$state,fileUtil) {
  console.log('init foldr');
  $scope.currentFoldrId = $stateParams.foldrId;
  $scope.files = files;

  $scope.opened = {};

      // file.isShowFile;
      //TODO perf optimization to avoid inline fx()
  $scope.isShowFile = function(file){
    return file.type==="folder" || $scope.opened[file.parent];
  }


  var displayedFiles = fileUtil.initDisplayedFiles(files);
  //quite stupid to make it nested then flatten it back
  //
  // Lazy($scope.files).each(function(file){
  //
  //   displayedFiles.push(file);
  //   if(file.type==="folder"){
  //     $scope.opened[file.id] = false;
  //     file.files = Lazy(file.files).map(function(subFile){
  //         subFile.parent = file.id;
  //         return subFile;
  //     }).value();
  //     displayedFiles.push(file.files);
  //   }
  // });




  $scope.open= function(file){
    // console.log('hi');
    if(file.type==="folder"){
      $scope.openFolder(file.id);
    }else{
    $state.go("app.foldr.single", {
        fileId: file.id,
        isEtherCalc:true,
        foldrId : $stateParams.foldrId,
        imageName: null
      }, {
        inherit: true,
        location: false
      });

    }
    console.log('open');

    // displayedFiles

// #/app/foldr/{{currentFoldrId}}/file/{{file.id}}?isEtherCalc=true
  }

  $scope.displayedFiles = Lazy(displayedFiles).flatten().value();

  $scope.openFolder = function(id,isOpen){
    var toBeIsOpen = !$scope.opened[id];
    if(typeof isOpen ==="boolean"){
        toBeIsOpen = isOpen
    }
    $scope.opened[id] = toBeIsOpen;
  }

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
  .controller('FileCtrl', ['$scope', '$stateParams', '$state', 'foldrService', '$sce','files', 'FileUtil',function($scope, $stateParams, $state, foldrService, $sce,files, fileUtil) {
    $scope.fileTitle = 'PageName';
    foldrService.files = files;
    //TODO refactor this back into the services
    var displayedFiles = fileUtil.initDisplayedFiles(files);

    $scope.livestreamQuery = $stateParams.livestreamQuery;
    console.log('Redirect');
    console.log(foldrService.current.fileIndex);

    $scope.file = null;
    if(displayedFiles.length > 0){
      $scope.file = displayedFiles[parseInt($stateParams.fileId)];
      var type = $scope.file.type;
      $scope.fileTitle = $scope.file.title;
      foldrService.current.fileIndex = parseInt($stateParams.fileId);
      if (type === 'livestream') {
        console.log('update')
        $state.go("app.foldr.livestream", {
          fileId: $stateParams.fileId,
          foldrId : $stateParams.foldrId,
          livestreamQuery: $scope.file.livestreamQuery,
          isEtherCalc:true
        }, {
          inherit: false,
          location: false
        });
      } else if (type === "image") {
        //inject here
        $state.go("app.foldr.image", {
          fileId: $stateParams.fileId,
          foldrId : $stateParams.foldrId,
          imageName: null,
          isEtherCalc:true,
          isRefresh:false
        }, {
          inherit: false,
          location: false
        });
      } else {
        $scope.inputUrl = $scope.file.url;
        $scope.url = $sce.trustAsResourceUrl($scope.inputUrl);
      }
    }

    // /livestream/:livestreamQuery



  }])
