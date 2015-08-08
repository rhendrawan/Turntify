/** this module will: 
* 1) create a module ("services") for services shared between apps 
* 2) handle RESTful interaction between the client and the server. Other services that store 
* information or functions required across the app can be added to the turntify.services namespace in another file.
* any logic/data filters longer than a couple lines should be required in another factory file
*/
angular.module('turntify.services', [])
.factory('RequestService', function($http, $state, $rootScope, $q, UserService /*logic files injected here*/) {
  //posts, gets, puts, etc.

  var getListOfPlaylists = function(){
    return $q(function(resolve, reject){
      var userCookies = UserService.getUserCookies();
      console.log('before getlistofplaylists, user cookies:', userCookies);
      $http({
        method: 'GET',
        url: 'user/playlists',
      }).then(function(res){
        console.log(res);
        resolve( res.data);
      },function(error) {
        // throw Error(error);
        console.log(error);
        reject(error);
      });

    });
  };

  var getQueue = function(playlistId, turntness){
    return $q(function(resolve, reject){
      var userCookies = UserService.getUserCookies();
      $http({
        method: 'GET',
        url: 'user/playlist/' + playlistId + '/' + turntness,
      }).then(function(res){
        console.log(res);
        resolve(res.data);
      },function(error) {
        console.log(error);
        reject(error);
      });
    });
  };



  return {
    //return get/post functions. shouldn't contain persistent data: that should be sent elsewhere
    getListOfPlaylists: getListOfPlaylists,
    getQueue: getQueue
  };
});
