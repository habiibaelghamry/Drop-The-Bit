app.controller('dailyEventsController', function($scope, status,$http, dailyEvents, $location, $routeParams, $modal, IP) {

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

	dailyEvents.get($routeParams.facilityId)
	.then(function(d) {
    $scope.events = d.data.events;
		$scope.eventslength = d.data.events.length;
    $scope.eventocc = d.data.eventocc;
		$scope.name = d.data.name;
    $scope.name1 = $scope.name.substring(0, $scope.name.length/2);
    $scope.name2 = $scope.name.substring($scope.name.length/2);

    for(var i = 0; i < $scope.events.length; i++)
      for(var j = 0; j < $scope.eventocc.length; j++)
        if($scope.events[i]._id == $scope.eventocc[j].event)
        {
          $scope.events[i].time = $scope.eventocc[j].time;
          break;
        }

    for(var x = 0; x < $scope.events.length; x++) {
      var days = "";
      for(var y = 0; $scope.events[x].daysOff && y < $scope.events[x].daysOff.length ; y++){
        if($scope.events[x].daysOff[y]==0){ days = days + "Sunday, ";}
        else if($scope.events[x].daysOff[y]==1){ days = days + "Monday, ";}
        else if($scope.events[x].daysOff[y]==2){ days = days + "Tuesday, ";}
        else if($scope.events[x].daysOff[y]==3){ days = days + "Wednesday, ";}
        else if($scope.events[x].daysOff[y]==4){ days = days + "Thursday, ";}
        else if($scope.events[x].daysOff[y]==5){ days = days + "Friday, ";}
        else if($scope.events[x].daysOff[y]==6){ days = days + "Saturday, ";}
      }
			if($scope.events[x].daysOff.length == 0){
				days = "No days off";
				$scope.events[x].days = days
			}
			else{
      $scope.events[x].days = days.substring(0, days.length-2);
		}
    }

	}, function errorCallback(response){
            $location.path("/error/"+response.status);
          });

  	$scope.deleteEvent = function (eventId) {
          $scope.message = "Show Daily Delete Button Clicked";
          var modalInstance = $modal.open({
              templateUrl: 'views/deleteDailyPopUp.html',
              controller: DeletePopUp1,
              scope: $scope,
              resolve: {
                      eventId: function() {
                      	return eventId;
                      }
                  }
          });
          modalInstance.result.then(function (selectedItem) {
              $scope.selected = selectedItem;
          });
      };

      $scope.editDailyEvent = function (eventId) {
        $scope.message = "Show Form Button Clicked";
        var modalInstance = $modal.open({
            templateUrl: 'views/editDailyEvent.html',
            controller: editDailyEvent,
            scope: $scope,
            resolve: {
                    eventId: function () {
                        return eventId;
                    }
                }

        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
            });
    };

		$scope.viewOccurences = function(eventId) {
			$location.path('/viewOccurences/' + eventId);

		}


});


var DeletePopUp1 = function ($scope, $http, Business, $modalInstance,dailyEvents,eventId,$route, IP) {
    $scope.form = {};
    $scope.error = "";
    $scope.submitForm = function () {

      Business.getEventOccs(eventId).then(function successCallback(response)
        {
            var occs = response.data;
            for (var i = 0; i < occs.length; i++)
            {
                var bookings = occs[i].bookings;
                for(var j = 0; j < bookings.length; j++)
                {
                $http.post('http://'+ IP.address + ':3000/bookings/cancel_booking_after_delete', {booking_id: bookings[j]})
                        .then(function successCallback(response){
                        }, function errorCallback(response){
                            $location.path("/error/"+response.status);
                          });


                }
            }

            dailyEvents.delete(eventId)
            .then(function successCallback(d){
              $route.reload();
              $modalInstance.close('closed');
            }, function errorCallback(d) {
              $scope.error = d.data;
            });
            // $route.reload();
        });

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};


var editDailyEvent = function ($scope, $modalInstance,dailyEvents,eventId,$route) {
    $scope.form = {}
    $scope.formData = {}
    $scope.submitForm = function () {

      var daysOff = [];
      var day = 0;
      if($scope.formData.day0 == true)
      {
        daysOff[day] = 0;
        day++;
      }

      if($scope.formData.day1 == true)
      {
        daysOff[day] = 1;
        day++;
      }

      if($scope.formData.day2 == true)
      {
        daysOff[day] = 2;
        day++;
      }

      if($scope.formData.day3 == true)
      {
        daysOff[day] = 3;
        day++;
      }

      if($scope.formData.day4 == true)
      {
        daysOff[day] = 4;
        day++;
      }

      if($scope.formData.day5 == true)
      {
        daysOff[day] = 5;
        day++;
      }

      if($scope.formData.day6 == true)
      {
        daysOff[day] = 6;
      }
      $scope.error = "";
      $scope.formData.day = daysOff;
        dailyEvents.edit($scope.formData,eventId)
        .then(function successCallback(d){
           $route.reload();
        $modalInstance.close('closed');
        },
        function errorCallback(d){
          $scope.error = d.data;
        });

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
