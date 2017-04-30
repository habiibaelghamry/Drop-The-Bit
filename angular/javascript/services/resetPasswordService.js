angular.module('fasa7ny')
.factory('resetPassword', function($http, IP) {
  return {
    reset: function(token, formData) {
      return $http.post('http://'+ IP.address + ':3000/auth/reset/' + token, formData);
    }
  }



})
