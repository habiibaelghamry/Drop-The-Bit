var app = angular.module('fasa7ny');

app.controller('viewBookingsController',function($scope,$routeParams,status,$http,$location,occurrenceBookings, IP)
{


   status.local().then(function(res){
   if(res.data)
   {
     if(res.data.user_type == 1) $scope.type = 1;
     else if(res.data.user_type == 2) $scope.type  = 4;
     else $scope.type = 3;
   }
   else {
     status.foreign().then(function(res){
       if(res.data.user_type) $scope.type = 1;
       else $scope.type = 2;
     });
   }
 });


  $scope.eventocc = $routeParams.eventoccId;
  $scope.error_message = "";
  occurrenceBookings.get($scope.eventocc).then(function (response)
  {
      $scope.bookings = response.data;
  }, function errorCallback(response){
       $location.path("/error/"+response.status);
      });

  $scope.deleteBooking = function(bookingID,eventoccId)
  {
    $http.post('http://'+ IP.address + ':3000/bookings/cancel_booking',{booking_id:bookingID , event_id:eventoccId}).then(
      function success(response)
      {
        occurrenceBookings.get($scope.eventocc).then(function (response){
            $scope.bookings = response.data;
      },
      function error(response)
      {
          $scope.error_message = response.data;
      });
    });
  };

});


app.controller('viewEventBookings',function($scope,status,$http,$location,occurrenceBookings, IP)
{
   status.local().then(function(res){
   if(res.data)
   {
     if(res.data.user_type == 1) $scope.type = 1;
     else if(res.data.user_type == 2) $scope.type  = 4;
     else $scope.type = 3;
   }
   else {
     status.foreign().then(function(res){
       if(res.data.user_type) $scope.type = 1;
       else $scope.type = 2;
     });
   }
 });


    // viewOccurences.get($routeParams.eventId).then(function (response) {
    //     $scope.event_occ = response.data.eventocc[0];
    //  });

    $scope.event_occ = $routeParams.onceEventOcc;

    occurrenceBookings.get($scope.event_occ).then(function (response){
        $scope.bookings = response.data;
     }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });



   $scope.deleteBooking = function(bookingID,eventoccId)
  {
    $http.post('http://'+ IP.address + ':3000/bookings/cancel_booking',{booking_id:bookingID , event_id:eventoccId}).then(
      function success(response)
      {
        occurrenceBookings.get($scope.eventocc).then(function (response){
            $scope.bookings = response.data;
      },
      function error(response)
      {
          $scope.error_message = response.data;
      });
    });
  };
});
