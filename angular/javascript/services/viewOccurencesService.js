app.factory('viewOccurences', ['$http', 'IP', function($http, IP) {
  return {
    get : function(eventId) {
      return $http.get('http://'+ IP.address + ':3000/event/viewO/' + eventId);
    },

    delete : function(occId) {
      return $http.get('http://'+ IP.address + ':3000/event/cancelO/'+ occId);
    }
  }
}]);
