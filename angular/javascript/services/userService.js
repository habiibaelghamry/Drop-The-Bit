app.factory('User', ['$http', 'IP', function($http, IP) {
    return {
	    getUserDetails : function(id) {
	        return $http.get('http://'+ IP.address + ':3000/user/u/' + id);
	    },

	    getBookingDetails: function(booking) {
	        return $http.get('http://'+ IP.address + ':3000/user/bookings/' + booking);
	    },

	    getSubscribedBusiness: function(business_id) {
	        return $http.get('http://'+ IP.address + ':3000/user/subs/' + business_id);
	    },

	    editUserInfo: function(userID, formData) {

	    	var fd = new FormData();
              for(var key in formData)
                fd.append(key, formData[key]);

	    	return $http.post('http://'+ IP.address + ':3000/user/editInfo/' + userID, fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
              });
	    },

	    changeImage: function(userID, formData) {
	    	var fd = new FormData();
              for(var key in formData)
                fd.append(key, formData[key]);

	    	return $http.post('http://'+ IP.address + ':3000/user/editInfo/' + userID, fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
              });
	    }
    }

}]);
