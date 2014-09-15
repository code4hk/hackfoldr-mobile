angular.module('starter.services')
.service('snsService', ['$http', 'q', 'snsConfig', 'Lazy',
    function($http, q, snsConfig, Lazy) {
      var _services = {};

      function facebookAPIFactory() {

        var service = {};

        //For single point now, as we likely need individual endpoint for each node (but in bulk HTTP requests)
        service.searchEndpointBuilder = function() {
          var builder = {};
          var _keywords = [];
          var _groupId = null;
          var _page = null;

          var _query = null;

          builder.keywords = function(keywords) {
            keywords = _escape(keywords);
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

          builder.getQuery = function(){
            return _query;
          }

          builder.query = function(query) {
            var trimQuery = query.match(/live:(.*)/);
            if (trimQuery.length > 1) {
              trimQuery = trimQuery[1];
            } else {
              throw new Error('cannot parse query');
            }
            _query = trimQuery;
            return this;
          }

          builder.build = function(token) {
            var url = '';

            if (_query) {
              //or &&?
              //TODO this part should be out of fb api!
              var criteria = _query.split("&&");
              var criteriaPairs = Lazy(criteria).map(function(v) {
                var criteriaPair = v.split("=");
                var pair = {};
                pair[criteriaPair[0]] = criteriaPair[1];
                return pair;
              }).toArray();

              console.log(criteriaPairs);
              Lazy(criteriaPairs).each(function(pair) {
                if (pair["fbpage"]) {
                  _page = pair["fbpage"];
                }
              })


            }

            if (_page || _groupId) {
              var entity = _page || _groupId;
              url = Lazy(["https://graph.facebook.com/", entity, "/feed?access_token=", token]).join('');
            } else {
              url = Lazy(["https://graph.facebook.com/search?access_token=", token, "&q=", _keywords, "&limit=20"]).join('');

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
        return "https://graph.facebook.com/oauth/access_token?client_id=" + configByFbgroup.app_id + "&client_secret=" + configByFbgroup.app_secret + '&grant_type=client_credentials';
      }

      //TODO cache
      _fbService.getToken = function() {
        var getTokenPromise = Q($http.get(_fbService.getTokenUrl(snsConfig["facebook"])));
        return getTokenPromise.then(function(res) {
          var token = _fbService.getTokenCallback(res.data);
          return token;
        })
      }

      //TODO
      var _escape = function(keywords) {
        return keywords;
      }

      // .group('614373621963841');


      _fbService.searchContext = function() {
        return facebookAPI.searchEndpointBuilder();
      }

      _fbService.search = function(context) {

        // if (!keywords) {
        //     throw new Error("Hackfoldr_Mobile: No Keywords");
        // }
        // keywords = qs.escape(keywords.join(","));
        // builder = builder.keywords(keywords);

        return _fbService.getToken()
          .then(function(token) {
            var endpoint = context.build(token);
            // return request.bind(this, endpoint);

            return Q($http.jsonp(endpoint + "&callback=JSON_CALLBACK")).then(function(res) {
              return res.data;
            })
          })
          .fail(function(err) {
            console.log(arguments);
            // printStacktrace(err);
            throw err;
          })
      };

      _services["facebook"] = _fbService;

      return _services;
    }
  ])
