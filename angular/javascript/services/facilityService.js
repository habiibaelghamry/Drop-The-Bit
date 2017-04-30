app.factory('Facility', ['$http', 'IP', function($http, IP) {
  return {
    createFacility : function(data) {
      var fd = new FormData();
      for(var key in data)
        fd.append(key, data[key]);

      return $http.post('http://'+ IP.address + ':3000/event/createFacility', fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      });
    },

    editFacility : function(facilityId, data) {
      var fd = new FormData();
      for(var key in data)
      {
        fd.append(key, data[key]);
      }
      return $http.post('http://'+ IP.address + ':3000/event/editFacility/' + facilityId, fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      });
    },

    deleteFacility : function(facilityId) {

      return $http.get('http://'+ IP.address + ':3000/event/deleteFacility/' + facilityId);
    },

     addDaily : function(fid,description,capacity,name,formData){
          formData.repeat = "Daily";
          formData.description = description;
          formData.capacity = capacity;
          formData.facility_id = fid;
          formData.name = name;

          var starthour = formData.starttime.getHours()+"";
          if(starthour.length == 1) starthour = "0" + starthour;

          var endhour = formData.endtime.getHours()+"";
          if(endhour.length == 1) endhour = "0" + endhour;

          var startminute = formData.starttime.getMinutes()+"";
          if(startminute.length == 1) startminute = "0" + startminute;

          var endminute = formData.endtime.getMinutes()+"";
          if(endminute.length == 1) endminute = "0" + endminute;

          formData.timing = starthour+":"+startminute+"-"+endhour+":"+endminute;

          return $http.post('http://'+ IP.address + ':3000/event/create', formData);
        }
  }
}]);
