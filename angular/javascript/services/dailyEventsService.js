app.factory('dailyEvents', ['$http', 'IP', function($http, IP) {
  return {
    get : function(facilityId) {
      return $http.get('http://'+ IP.address + ':3000/event/getEvents/' + facilityId);
    },

    delete : function(eventId){
      return $http.get('http://'+ IP.address + ':3000/event/cancel/'+ eventId);

    },

     edit : function(formData,eventId){
          return $http.post('http://'+ IP.address + ':3000/event/edit/'+eventId, formData);
        }
  }
}]);
