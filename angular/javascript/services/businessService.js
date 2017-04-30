// angular.module('businessService', [])
var app = angular.module('fasa7ny');
app.factory('Business', ['$http', 'IP', function ($http, IP) {
  return {
    get: function (id) {
      return $http.get('http://' + IP.address + ':3000/business/b/' + id);
    },

    getById: function(id){
      return $http.get('http://'+IP.address + ':3000/business/getBusinessById/' + id);
    },

    edit: function (data) {

      var fd = new FormData();
      for (var key in data)
        fd.append(key, data[key]);
      return $http.post('http://' + IP.address + ':3000/business/editInformation', fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      });
    },
    editLocation: function (data) {
      return $http.post('http://' + IP.address + ':3000/business/editInformation', data);
    },

    subscribe: function (id) {
      return $http.get('http://' + IP.address + ':3000/user/subscribe/' + id);
    },

    unsubscribe: function (id) {
      return $http.get('http://' + IP.address + ':3000/user/unsubscribe/' + id);
    },

    rate: function (star, bid) {
      return $http.get('http://' + IP.address + ':3000/user/rate/' + star + "/" + bid);
    },

    public: function () {
      return $http.get('http://' + IP.address + ':3000/business/publicPage');
    },

    remove: function () {
      return $http.get('http://' + IP.address + ':3000/business/requestRemoval');
    },

    hasBookings: function () {
      return $http.get('http://' + IP.address + ':3000/business/hasBookings');
    },

    deleteImage: function (image) {
      return $http.get('http://' + IP.address + ':3000/business/deleteImage/' + image);
    },

    addImage: function (data) { //for slider
      var fd = new FormData();
      for (var key in data)
        fd.append(key, data[key]);
      return $http.post('http://' + IP.address + ':3000/business/changeImage', fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      });
    },

    deletePhone: function (phone) {
      return $http.get('http://' + IP.address + ':3000/business/deletePhone/' + phone);
    },

    deletePaymentMethod: function (method) {
      return $http.get('http://' + IP.address + ':3000/business/deletePaymentMethod/' + method);
    },

    changeImage: function (formData) {
      var fd = new FormData();
      for (var key in formData)
        fd.append(key, formData[key]);
      return $http.post('http://' + IP.address + ':3000/business/changeProfilePicture', fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      });
    },

    getFacilityOccs: function (facility_id) {
      return $http.get('http://' + IP.address + ':3000/business/getFacilityOccs/' + facility_id);
    },

    getEventOccs: function (event_id) {
      return $http.get('http://' + IP.address + ':3000/business/getEventOccs/' + event_id);
    },

    getBooking: function (booking_id) {
      return $http.get('http://' + IP.address + ':3000/business/getBooking/' + booking_id);
    },

    // start reviews services
    addReview: function (params) {
      return $http.post('http://' + IP.address + ':3000/reviews/writeReview', params);
    },
    deleteReview: function (params) {
      return $http.post('http://' + IP.address + ':3000/reviews/deleteReview', params);
    },
    addReply: function (params) {
      return $http.post('http://' + IP.address + ':3000/reviews/replyReview', params);
    },
    deleteReply: function (params) {
      return $http.post('http://' + IP.address + ':3000/reviews/deleteReply', params);
    },
    upvote: function (params) {
      return $http.post('http://' + IP.address + ':3000/reviews/upvoteReview', params);

    },
    downvote: function (params) {
      return $http.post('http://' + IP.address + ':3000/reviews/downvoteReview', params);
    }
  }
}]);


app.factory('business', function () {
  return {};
});

