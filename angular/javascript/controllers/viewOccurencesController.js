app.controller('viewOccurencesController', function($scope, $http, status,viewOccurences, $location, $routeParams, $modal, IP) {

   status.local()
 .then(function(res){
   if(res.data){
     if(res.data.user_type == 1)
       $scope.type = 1;
     else if(res.data.user_type == 2)
       $scope.type  = 4;
     else $scope.type = 3;
   }
   else {
     status.foreign()
     .then(function(res){
       if(res.data.user_type)
         $scope.type = 1;
       else $scope.type = 2;
     });
   }
 });

  viewOccurences.get($routeParams.eventId)
	.then(function(d) {
    $scope.eventocc = d.data.eventocc;
    $scope.time = d.data.eventocc[0].time;
  }, function errorCallback(response){
       $location.path("/error/"+response.status);
    });

  $scope.viewBookings = function(occId)
  {
     $location.path('/bookings/'+occId);
  }

  $scope.deleteEvent = function (occId) {
        $scope.message = "Show Occ Delete Button Clicked";
        var modalInstance = $modal.open({
            templateUrl: 'views/deleteOccPopUp.html',
            controller: DeletePopUp,
            scope: $scope,
            resolve: {

                    occId: function(){
                      return occId;
                    }
                }

        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
            });
    };
});

var DeletePopUp = function ($scope, $http, $modalInstance,viewOccurences,occId,$route, IP) {
    $scope.form = {}
    $scope.error ="";
    $scope.submitForm = function ()
    {
      $http.post('http://'+ IP.address + ':3000/event/getOccurrence', {occ_id: occId}).then(function successCallback(response)
      {
        var bookings = response.data.bookings;
        for(var j = 0; j < bookings.length; j++)
        {
          $http.post('http://'+ IP.address + ':3000/bookings/cancel_booking_after_delete', {booking_id: bookings[j]})
          .then(function successCallback(response){
          }, function errorCallback(response){
          });
        }

         viewOccurences.delete(occId)
        .then(function successCallback(d){
            $route.reload();
        $modalInstance.close('closed');
        },
        function errorCallback(d){
            $scope.error = d.data;
        });
      });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
