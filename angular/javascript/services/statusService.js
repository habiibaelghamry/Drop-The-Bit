angular.module('fasa7ny')
.factory('status', function($http, IP) {
  return {
    local: function() {
    return $http({
       url: 'http://'+ IP.address + ':3000/loggedin',
       method: "GET",
       withCredentials: true,
       headers: {
                   'Content-Type': 'application/json'
       }
     });
   },
   foreign: function() {
     return $http.get('http://'+ IP.address + ':3000/loggedin');
   }

  }



})
