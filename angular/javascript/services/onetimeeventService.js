var app = angular.module('fasa7ny');

app.factory('OneTimeEvent', ['$http', 'IP', function($http, IP) {
    return {
        create : function(formData) {

          var starthour = formData.starttime.getHours()+"";
          if(starthour.length == 1) starthour = "0" + starthour;

          var endhour = formData.endtime.getHours()+"";
          if(endhour.length == 1) endhour = "0" + endhour;

          var startminute = formData.starttime.getMinutes()+"";
          if(startminute.length == 1) startminute = "0" + startminute;

          var endminute = formData.endtime.getMinutes()+"";
          if(endminute.length == 1) endminute = "0" + endminute;

          formData.timing = starthour+":"+startminute+"-"+endhour+":"+endminute;

          formData.repeat = "Once";
            return $http.post('http://'+ IP.address + ':3000/event/create', formData);
        },

        getOnceEvents : function(businessId)
        {
        	return $http.get('http://'+ IP.address + ':3000/event/getOnceEvents/'+businessId);
        }
  }
}]);
