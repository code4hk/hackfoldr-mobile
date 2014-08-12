angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
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

.controller('PlaylistsCtrl', ['$scope','DbService',function($scope,DbService) {
    // document.addEventListener("deviceready", testing, false);

DbService.init();

    // PhoneGap is ready
    //
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
}])
.service('DbService',function() {
  var _service = {};
  var db = null;
  console.log('Db init');

  _service.init=function() {

      db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
      db.transaction(populateDB, errorCB, successCB);

  }
  function populateDB(tx) {
       tx.executeSql('DROP TABLE IF EXISTS DEMO');
       tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, data)');
       tx.executeSql('INSERT INTO DEMO (id, data) VALUES (1, "First row")');
       tx.executeSql('INSERT INTO DEMO (id, data) VALUES (2, "Second row")');
  }
  function errorCB(err) {
      console.log("Error processing SQL: "+err.code);
  }


  function queryDB(tx) {
      tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
  }

  function querySuccess(tx, results) {
      // this will be empty since no rows were inserted.
      var len = results.rows.length;
      console.log("DEMO table: " + len + " rows found.");
      for (var i=0; i<len; i++){
          console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
      }
  }


  function successCB() {
      console.log("success!");
      console.log(db);
      db.transaction(queryDB, errorCB);
  }


  function errorCB(err) {
      alert("Error processing SQL: "+err.code);
  }


return _service;

})
.controller('PlaylistCtrl', function($scope, $stateParams) {
});
