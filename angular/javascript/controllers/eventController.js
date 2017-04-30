
app.controller('eventController', function($scope, $http, status, Event, $location, $routeParams, $modal, $log,viewOccurences,$window, IP) {
	$scope.ip = IP.address;
	$scope.imageEventlength = 0;
	$scope.slides = [];
	$scope.event = {};
	$scope.eventocc = {};

	$scope.user = {};
		status.local()
		 .then(function(res){
		   if(res.data){
				 $scope.user = res.data._id;
		     if(res.data.user_type == 1)
		       $scope.type = 1;
		     else if(res.data.user_type == 2)
		       $scope.type  = 4;
		     else $scope.type = 3;
		   }
		   else {
				 $scope.user = res.data._id;
		     status.foreign()
		     .then(function(res){
		       if(res.data.user_type)
		         $scope.type = 1;
		       else $scope.type = 2;
		     });
		   }
		 });

		$scope.error = "";
		Event.get($routeParams.eventId)
		.then(function successCallback(d){
			$scope.business = d.data.business;
			$scope.event = d.data.event;
			$scope.eventocc = d.data.eventocc;
			$scope.slides = $scope.event.image;
			$scope.imageEventlength = $scope.event.image.length;
			$scope.date = new Date(d.data.eventocc.day);
			$scope.day = $scope.date.getDate();
			$scope.month = "";
			var m = $scope.date.getMonth();
			if(m==0) $scope.month = "Jan";
			if(m==1) $scope.month = "Feb";
			if(m==2) $scope.month = "Mar";
			if(m==3) $scope.month = "Apr";
			if(m==4) $scope.month = "May";
			if(m==5) $scope.month = "Jun";
			if(m==6) $scope.month = "Jul";
			if(m==7) $scope.month = "Aug";
			if(m==8) $scope.month = "Sept";
			if(m==9) $scope.month = "Oct";
			if(m==10) $scope.month = "Nov";
			if(m==11) $scope.month = "Dec";

	  if($scope.type == 4 && $scope.business != $scope.user) $scope.type = 2;

	}, function errorCallback(d) {
		$scope.error = d.data;
	});


	$scope.showDelete = function (id) {
    $scope.message = "Show Delete Button Clicked";
    var modalInstance = $modal.open({
        templateUrl: 'views/deletePopUp.html',
        controller: DeletePopUp2,
        scope: $scope,
        resolve: {
						bid: function() {
							return $scope.user;
						},
					  id: function(){
                	return id;
                }
            }

    });

    modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
    });
  };


  $scope.showForm = function (id) {
      $scope.message = "Show Form Button Clicked";
      var modalInstance = $modal.open({
        templateUrl: 'views/editEvent.html',
        controller: ModalInstanceCtrl,
        scope: $scope,
        resolve: {
				id: function () {
            	return id;
          }
        }
      });
      	modalInstance.result.then(function (selectedItem) {
        	$scope.selected = selectedItem;
			$scope.event = selectedItem.event;
			$scope.eventocc = selectedItem.eventocc;
      });
  };

	$scope.deleteImageEvent = function(eventId, image) {
		$scope.message = "Show delete Form Button Clicked";
		$scope.image = image;
		$scope.eId = eventId;
		var modalInstance = $modal.open({
			templateUrl: 'views/deleteImageEvent.html',
			controller: deleteImageEventCtrl,
			scope: $scope
		});

	modalInstance.result.then(function (selectedItem) {
		$scope.selected = selectedItem;
		$scope.event = selectedItem.event;
		$scope.slides = $scope.event.image;
		$scope.imageEventlength = $scope.event.image.length;
	}, function () {
			$log.info('Modal dismissed at: ' + new Date());
	});
};

	$scope.addImageEvent = function (eventId) {
		$scope.message = "Show image Form Button Clicked";
		$scope.eId = eventId;
		var modalInstance = $modal.open({
				templateUrl: 'views/addImageEvent.html',
				controller: addImageEventCtrl,
				scope: $scope
		});

		modalInstance.result.then(function (selectedItem) {
				$scope.selected = selectedItem;
				$scope.event = selectedItem.event;
				$scope.slides = $scope.event.image;
				$scope.imageEventlength = $scope.event.image.length;
		}, function () {
				$log.info('Modal dismissed at: ' + new Date());
		});
	};



    $scope.bookEvent = function(event_id){
            $location.path('/book-event/'+event_id);
          };

     $scope.viewEventBookings = function(eventId)
     {
        viewOccurences.get(eventId).then(function (response) {
        $scope.event_occ = response.data.eventocc[0]._id;
        $location.path('/bookings/'+$scope.event_occ); // /bookings/:onceEventOcc

         }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
     };

});

var DeletePopUp2 = function ($scope, $http, status, $location, $modalInstance,Event, Business, id,bid, $route,$window, IP) {
    $scope.form = {};
    $scope.error = "";
    $scope.submitForm = function ()
     {
        Business.getEventOccs(id).then(function successCallback(response)
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

            Event.delete(id)
                    .then(function successCallback(d) {
						status.local()
						 .then(function(res){
							 $location.path('/business/' + res.data.name)
						 });
            },
            function errorCallback(d){
                        $scope.error = d.data;
            });
        }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};




var ModalInstanceCtrl = function ($scope, $modalInstance, status, Event,id, $route) {
    $scope.form = {}
    $scope.formData = {}
    $scope.submitForm = function () {
			$scope.error = "";
         if(($scope.formData.starttime && !$scope.formData.endtime) || (!$scope.formData.starttime && $scope.formData.endtime)){
            $scope.error = "Must enter both a start date and end date";
        } else
        if($scope.formData.capacity == 0){
        	$scope.error = "Enter a valid capacity";
        } else
        if($scope.formData.price == 0){
        	$scope.error = "Enter a valid price";
        }
        else {
            Event.edit($scope.formData,id)
            .then(function successCallback(d){

				$modalInstance.close({
	            event:d.data.event,
				eventocc:d.data.eventocc
	            });

              $route.reload();
              $modalInstance.close('closed');
            }, function errorCallback(d) {
              $scope.error = d.data;
            });
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};


var deleteImageEventCtrl = function ($scope, $modalInstance, Event, $route) {
		$scope.form = {};
		$scope.error = "";
		$scope.yes = function (eventId, image) {
				// if ($scope.form.editForm.$valid) {
						Event.deleteImage(eventId, image)
						.then(function successCallback(d) {
							$modalInstance.close({
	              event:d.data.event
	            });
						}, function errorCallback(d) {
							$scope.error = d.data;
						});
						// $route.reload();
		};

		$scope.no = function () {
				$modalInstance.dismiss('cancel');
		};
};

var addImageEventCtrl = function ($scope, $modalInstance, Event, $route) {
	$scope.error = "";
		$scope.addImageEvent = function (eventId, formData) {
			Event.addImage(eventId, formData)
			.then(function successCallback(d) {
				$modalInstance.close({
					event : d.data.event
				});
      },
      function errorCallback(d){
        $scope.error = d.data;
      });
			// $route.reload();
		};

		$scope.no = function () {
				$modalInstance.dismiss('cancel');
		};
};
