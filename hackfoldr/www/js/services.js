angular.module('starter.services', [])
  .factory('snsConfig', ['appConfig',
    function(appConfig) {
      return appConfig.sns;
    }
  ])
  .service('FileUtil',function(){

    var _util = {};

    _util.initDisplayedFiles =function(files){
      var displayedFiles = [];
      //quite stupid to make it nested then flatten it back

      Lazy(files).each(function(file){
        displayedFiles.push(file);
        if(file.type==="folder"){
          file.files = Lazy(file.files).map(function(subFile){
              subFile.parent = file.id;
              return subFile;
          }).value();
          displayedFiles.push(file.files);
        }
      });
      return Lazy(displayedFiles).flatten().value();
    }

    return _util;
  })
  .service('foldrService', function($http, CacheService,md5Util) {

    //Now we just support hackfoldr with Gspreadsheet. Better get a meta API
    //od6 for default sheet
    var _service = {};

    _service.current = {
      id: '',
      fileIndex: -1
    };

    _service.files = [];

    function getSpreadsheetUrl(id) {
      return ['https://spreadsheets.google.com/feeds/list/', id, '/od6/public/values?alt=json'].join('');;
    }

    function getEtherCalcUrl(id){
      // return ['https://ethercalc.org/_/', id, '/cells/'].join('');
      //Use csv, json api is slow
      return ['https://ethercalc.org/_/', id, '/csv/'].join('');
    }

    _service.getFile = function() {
      return _service.files[_service.current.fileIndex];
    }

    function _getFolder(id,title){
      return {
        id:id,
        title: title,
        type:"folder",
        files:[]
      };
    }

    function _parseEtherCalcFeed(data){
      var files = [];
      var json = csv2JSON(data,["url","key","folder","tag","livestream"]);
      console.log(json);

      //stack
      var inFolder = false;
      // var folderFiles = [];
      var folder = null;
      Lazy(json).each(function(v, i) {
        var file = {};
        var isFolder = v.folder==="expand";
        if(isFolder){
          inFolder = true;
          folder = _getFolder(i,v.key);
        }else{
          file = _parseFile(i,v.url,v.key,v.livestream);
        }
        if(inFolder && !isFolder){
          folder.files.push(file);
        }else{
          files.push(folder);
          // if(isFolder){
          //   folder = null;
          // }
        }
      });

      return files;
    }


      function csv2JSON(csv,headers){
        var lines=csv.split("\n");
        var result = [];
        headers= headers? headers : lines[0].split(",");
        for(var i=1;i<lines.length;i++){
          var obj = {};
          var currentline=lines[i].split(",");
          for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
          }
          result.push(obj);
        }

        return result; //JavaScript object
        // return JSON.stringify(result); //JSON
      }



    function _parseFile(id,url,content,livestreamQuery,isFolder){
      var type = "normal";
      if (livestreamQuery) {
        if (livestreamQuery.match(/^live:/)) {
          type = 'livestream';
        }
      }

      if (url.match(/(.*)(.png|jpg|jpeg|gif$)/)) {
        type = "image";
      }

      var file = {
        id: id,
        url: url,
        title: content,
        livestreamQuery: livestreamQuery,
        type: type
      };
      return file;
    }

    function _parseRowAsFile(id,columns){
      var url = columns[0];
      var content = columns[1];
      var livestreamQuery = columns[5];
      var isFolder = columns[3] === "expand";
      if(isFolder){
        return _getFolder(id,content);
      }

      return  _parseFile(id,url,content,livestreamQuery);
    }

    function _parseFeed(feed) {
      var files = [];
      var entries = Lazy(feed.entry);
      entries.each(function(entry, i) {
        var url = entry.title.$t;
        var file = {};
        var content = null;
        var columnIndex = 0;
        var columns = [];
        //quick & dirty code
        Lazy(entry).each(function(v, k) {
          var isColumn = !!(k.match(/.*gsx\$/));
          if (isColumn) {
            //take the last one is safe
            // if(v.$t !==url){
            columns[columnIndex] = v.$t;
            columnIndex++;
            // }
          }
        });

        var file = _parseRowAsFile(i,columns);
        files.push(file)
      })
      console.log(files);
      _service.files = files;
      return files;
    }
    //TODO cache the opened foldr (files) here in service
    _service.openFoldr = function(id,isEtherCalc) {

      if(!isEtherCalc){
        var url = getSpreadsheetUrl(id);
        return Q($http.jsonp(url + "&callback=JSON_CALLBACK"))
          .then(function(res) {
            return _parseFeed(res.data.feed);
          });
      }else{
        var url = getEtherCalcUrl(id);
        return Q($http.get(url))
          .then(function(res) {
            return _parseEtherCalcFeed(res.data);
          });

      }



    }
    return _service;

  })
  .service('CacheService', ['DbService', '$http','q',
    function(DbService, $http,Q) {

  //work in emulator but not in browser
  // http://stackoverflow.com/questions/934012/get-image-data-in-javascript
  function getBase64FromImageUrl(URL) {
    var deferred = Q.defer();
      var img = new Image();
      img.src = URL;
      img.crossOrigin = "Anonymous";

      img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width =this.width;
        canvas.height =this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var data = canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");
        deferred.resolve(data);
      }

      return deferred.promise;
  }


      var _service = {};
      _service.cacheImage = function(key, url) {
        getBase64FromImageUrl(url).then(function(data) {
          DbService.insertCache(key, data);
        })
      }

      _service.getCacheImage = function(id) {
        return DbService.getCache(id);
      };

      return _service;

    }
  ])
  .service('DbService', ['q',function(Q) {
    var _service = {};
    var db = null;
    console.log('Db init');

    // https://spreadsheets.google.com/feeds/list/1QAy9rgAy1Szhm5FwTCLHd6H3ZVR4QoGcQ8KiTpx_7dk/od6/public/values?alt=json


    _service.init = function() {

      db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
      db.transaction(initDB, errorCB, successCB);


    }

    _service.insertCache = function(key, data) {

      //TODO base 64
      function txInsertCahe(tx) {
        var base64Img = btoa(encodeURIComponent(escape(data)));
        tx.executeSql('INSERT INTO CACHE (key, data) VALUES (?, ?)',[key,base64Img]);
      }
      db.transaction(txInsertCahe, errorCB, successCB);

      //return promise

    }

    _service.getCache = function(key) {
      var results = [];
      var deferred = Q.defer();
      function querySuccess(tx, results) {
        var len = results.rows.length;
        console.log("IMAGE table: " + len + " rows found.");
        for (var i = 0; i < len; i++) {
          console.log("Row = " + i + " ID = " + results.rows.item(i).id);
          console.log(results.rows.item(i));
        }
        results = results.rows;
        console.log('results');
        console.log(results);
      }

      function queryDB(tx) {
        // tx.executeSql('SELECT * FROM CACHE where key = ?', [key]);
        tx.executeSql('SELECT * FROM CACHE where key = ?', [key], querySuccess);
      }
      db.transaction(queryDB, function() {
        console.log('err');
      }, function() {
        console.log('query success');
        deferred.resolve(results);
      });

      return deferred.promise;
    };

    function initDB(tx) {
      tx.executeSql('DROP TABLE IF EXISTS CACHE');
      tx.executeSql('CREATE TABLE IF NOT EXISTS CACHE (id INTEGER PRIMARY KEY, key, data)');
    }

    function populateDB(tx) {
      tx.executeSql('INSERT INTO DEMO (id, data) VALUES (1, "First row")');
      tx.executeSql('INSERT INTO DEMO (id, data) VALUES (2, "Second row")');
    }

    function errorCB(err) {
      console.log("Error processing SQL: " + err.code);
    }



    function querySuccess(tx, results) {
      // this will be empty since no rows were inserted.
      var len = results.rows.length;
      console.log("IMAGE table: " + len + " rows found.");
      for (var i = 0; i < len; i++) {
        console.log("Row = " + i + " ID = " + results.rows.item(i).id);
        console.log(results.rows.item(i));
      }
    }


    function successCB() {
      console.log("success!");
      console.log(db);
    }


    function errorCB(err) {
      console.log(err);
    }

    _service.init();
    return _service;

  }])
