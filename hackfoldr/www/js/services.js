angular.module('starter.services', [])
.factory('snsConfig',['appConfig',function(appConfig) {
  return appConfig.sns;
}])
.service('foldrService',function($http){

  //Now we just support hackfoldr with Gspreadsheet. Better get a meta API
  //od6 for default sheet
  var _service = {};

  _service.current = {
    id:'',
    fileIndex:-1
  };

  _service.files = [];

  function getSpreadsheetUrl(id){
    return ['https://spreadsheets.google.com/feeds/list/',id,'/od6/public/values?alt=json'].join('');;

  }

  _service.getFile = function(){
    return _service.files[_service.current.fileIndex];
  }


  function _parseFeed(feed){
    var files= [];
    console.log('asdas');

    var entries = Lazy(feed.entry);
    entries.each(function(entry,i){
        var url =   entry.title.$t;
        console.log(entry);
        var file = {};
        var type = "normal";
        var content =null;
        var columnIndex = 0;
        var columns = [];
//quick & dirty code
        Lazy(entry).each(function(v,k){
          var isColumn = !!(k.match(/.*gsx\$/));
          if(isColumn){
            //take the last one is safe
            // if(v.$t !==url){
              columns[columnIndex] = v.$t;
              columnIndex++;
            // }
          }
        });

        var content = columns[1];
        var livestreamQuery = columns[2];
        if(livestreamQuery){
            if(livestreamQuery.match(/^live:/)){
              type = 'livestream';
            }
        }

        file= {
            id:i,
            url:url,
            title:content,
            livestreamQuery:livestreamQuery,
            type:type
        };
        files.push(file)
      })
      console.log(files);
      _service.files = files;
      return files;
  }

  _service.openFoldr= function(id){
    var url = getSpreadsheetUrl(id);
    return Q($http.jsonp(url+"&callback=JSON_CALLBACK"))
    .then(function(res) {
      console.log(res);
      return _parseFeed(res.data.feed);
    })

  }
  return _service;

})
.service('DbService',function() {
  var _service = {};
  var db = null;
  console.log('Db init');

// https://spreadsheets.google.com/feeds/list/1QAy9rgAy1Szhm5FwTCLHd6H3ZVR4QoGcQ8KiTpx_7dk/od6/public/values?alt=json


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
.service('snsService',['$http','q','snsConfig','Lazy',function($http,q,snsConfig,Lazy) {
  var _services = {};

  function facebookAPIFactory() {

        var service = {};

        //For single point now, as we likely need individual endpoint for each node (but in bulk HTTP requests)
        service.searchEndpointBuilder = function() {
            var builder = {};
            var _keywords = [];
            var _groupId = null;
            var _page = null;
            builder.keywords = function(keywords) {
                _keywords = keywords;
                return this;
            };
            builder.group = function(group) {
                _groupId = group;
                return this;
            };
            builder.page = function(page) {
                _page = page;
                return this;
            };

            builder.build = function(token) {
                var url ='';
                if(_page||_groupId){
                  var entity = _page || _groupId;
                  url = Lazy(["https://graph.facebook.com/",entity,"/feed?access_token=",token]).join('');
                }else{
                  url =    Lazy(["https://graph.facebook.com/search?access_token=",token,"&q=",_keywords,"&limit=20"]).join('');

                }

                return encodeURI(url);
            };
            return builder;
        };
        return service;

    };



    var facebookAPI = facebookAPIFactory(snsConfig["facebook"].token);
    // "keywords":["新界東北","政總","立法會"],
    var _fbService = {};
    // https://dev.twitter.com/docs/api/1.1/get/search/tweets
    _fbService.getTokenCallback = function(body) {
        return body.split('=')[1];
    };

    _fbService.getTokenUrl = function(configByFbgroup) {
        // return util.format('https://graph.facebook.com/oauth/access_token?client_id=%s&client_secret=%s&grant_type=client_credentials', configByFbgroup.app_id, configByFbgroup.app_secret);
        return "https://graph.facebook.com/oauth/access_token?client_id="+configByFbgroup.app_id+"&client_secret="+configByFbgroup.app_secret+'&grant_type=client_credentials';
    }

    //TODO cache
    _fbService.getToken = function(){
      var getTokenPromise = Q($http.get(_fbService.getTokenUrl(snsConfig["facebook"])));
      return getTokenPromise.then(function(res) {
        var token = _fbService.getTokenCallback(res.data);
        return token;
      })
    }

    //TODO
    var _escape = function(keywords){
      return keywords;
    }
    _fbService.search = function(keywords) {
        keywords = _escape(keywords);
        var builder = facebookAPI.searchEndpointBuilder();
        if (!keywords) {
            throw new Error("Hackfoldr_Mobile: No Keywords");
        }
        // keywords = qs.escape(keywords.join(","));
        // builder = builder.keywords(keywords);
        builder = builder.group('614373621963841');
        return _fbService.getToken()
        .then(function(token){
            var endpoint = builder.build(token);
            // return request.bind(this, endpoint);
            return Q($http.jsonp(endpoint+"&callback=JSON_CALLBACK")).then(function(res) {
              return res.data;
            })
        })
        .fail(function(err) {
          console.log(arguments);
          // printStacktrace(err);
          throw err;
        })
    };

    _services["facebook"]= _fbService;

  return _services;
}])
