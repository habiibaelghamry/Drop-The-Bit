
var app = angular.module('fasa7ny');

app.controller('userController', function($scope, status,$http, User, $location, $routeParams, $modal, $window, $route, $log,  IP) {

	$scope.ip = IP.address; 
	$scope.user = {};
	$scope.error = "";
	$scope.booking;
	$scope.pic = "";

	status.local()
  	.then(function(res){
    if(res.data){
      if(res.data.user_type == 1){
      	$scope.type = 1;
      	$scope.user = res.data;
				$scope.pic = $scope.user.profilePic;
				$scope.subscribed_businesses = [];
			for(i = 0; i < $scope.user.subscriptions.length; i++) {
				User.getSubscribedBusiness($scope.user.subscriptions[i]).then(function(d) {
					$scope.subscribed_businesses.push(d.data);
				});
			}
				$scope.all_info = [];
			for(i = 0; i < $scope.user.bookings.length; i++) {
				User.getBookingDetails($scope.user.bookings[i]).then(function successCallback(d) {
					$scope.all_info.push(d.data);
				}, function errorCallback(d) {
					$scope.error = d.data;
				});
			}
      }

      else if(res.data.user_type == 2)
        $scope.type  = 4;
      else $scope.type = 3;
    }
    else {
      status.foreign()
      .then(function(res){
        if(res.data.user_type){
          $scope.type = 1;
          $scope.user = res.data;
        }
        else $scope.type = 2;
      });
    }
  });


	$scope.cancelBooking =function(bookingId)
	{
		$http.post('http://'+ IP.address + ':3000/bookings/deleteRegUserBookings',{bookingD:bookingId}).then(
			function success(response)
			{
				$route.reload();
			}, function errorCallback(response){
	            $location.path("/error/"+response.status);
	          });
	};


	$scope.goToEditProfile = function(userID) {
			var modalInstance = $modal.open({
					templateUrl: 'views/user_edit_profile.html',
					controller: EditProfileCtrl,
					scope: $scope,
					resolve: {
							userID: function() {
								return userID;
							}
					}
			});

			modalInstance.result.then(function (selectedItem) {
					$scope.selected = selectedItem;
			}, function () {
					$log.info('Modal dismissed at: ' + new Date());
			});
	}

	$scope.changeImage = function(userID) {
		User.changeImage(userID,$scope.formData).then(function successCallback(d) {
			$scope.pic = d.data.user.profilePic;
			// $route.reload();


		}, function errorCallback(d) {
			$scope.error = d.data;
		});
	}


	// $scope.cancelBooking = function(bookingId) {
	// 	User.cancelBooking(bookingId).then(function successCallback(d){
	// 	}, function errorCallback(d) {
	// 	})
	// }

});





var EditProfileCtrl = function ($scope, $modalInstance, userID, User, $route) {
    $scope.form = {};
    $scope.formData = {};
		$scope.error = "";
    $scope.submitForm = function () {
        // if ($scope.form.editForm.$valid) {
			User.editUserInfo(userID, $scope.formData) .then(function successCallback(d) {
				$route.reload();
	      $modalInstance.close('closed');
			}, function errorCallback(d) {
				$scope.error = d.data;
			});
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };



};
