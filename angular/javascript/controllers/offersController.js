var app = angular.module('fasa7ny');


//========== View ===========
app.controller('ViewOffersController', function($scope, $http, $location, Offers,$routeParams, IP) {

      $scope.name = $routeParams.name;
      $http.post('http://'+ IP.address + ':3000/business/getBusinessId',{name:$scope.name}).then(
      	function(response)
      	{
      		$scope.business_id = response.data._id;
      		Offers.get($scope.business_id).then(function(response) {
              $scope.offers = response.data;
        });
      	}, function errorCallback(response){
            $location.path("/error/"+response.status);
          });

});


app.controller('createOffersController',function($scope,$http,Facilities,OneTimeEvent,status,$location,$routeParams,IP)
{
          $scope.formData = {};
          $scope.user = {};
      		$scope.business_id = $routeParams.businessId;
          status.local()
             .then(function(res){
               if(res.data){
                 $scope.user = res.data;
                 if(res.data.user_type == 1)
                   $scope.type = 1;
                 else if(res.data.user_type == 2 && res.data._id == $scope.business_id)
                 {
                   $scope.type  = 4;

                 }
                 else if(res.data.user_type == 3) $scope.type = 3;
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



      Facilities.get($scope.business_id).then(function(response) {
              $scope.facilities = response.data;
        }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
      OneTimeEvent.getOnceEvents($scope.business_id).then(function(response) {
              $scope.events = response.data;
        }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });

      $scope.today = new Date();
      $scope.error_message = "";

      $scope.createOffer = function()
      {
      	 var fd = new FormData();
		  for(var key in $scope.formData)
		  {
		    if($scope.formData[key] != null)
		    fd.append(key, $scope.formData[key]);
		  }

      	$http.post('http://'+ IP.address + ':3000/offers/createOffer', fd,{
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      }).then(function successCallback(response){
                      $location.path('/business/'+ $scope.user.name);
                    }, function errorCallback(response){
                      $scope.error_message = response.data;
                    });
      }


});

//========== Edit ============

app.controller('EditOffersController', function($scope, $http, $route,$location, Offers, $modal, $window,$routeParams,IP) {


       // $scope.business_id = "58f0f3faaa02d151aa4c987c";
        $scope.name = $routeParams.name;
      $http.post('http://'+ IP.address + ':3000/business/getBusinessId',{name:$scope.name}).then(
      	function(response)
      	{
      		$scope.business_id = response.data._id;
      	}, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
      Offers.get($scope.business_id).then(function(response) {
              $scope.offers = response.data;
        },function errorCallback(response){
            $location.path("/error/"+response.status);
          });

	  $scope.editOffer = function (offerId,offerType) {
			$scope.message = "Show edit Form Button Clicked";
			var modalInstance = $modal.open({
					templateUrl: 'views/editOffer.html',
					controller: 'EditOfferCtrl',
					scope: $scope,
					resolve: {
							offerId: function () {
								return offerId;
							}
							,
							offerType: function () {
								return offerType;
							}
					}
			});

			modalInstance.result.then(function (selectedItem) {
					$scope.selected = selectedItem;
					// $window.location.reload();
					$route.reload();
			});
	  };

});

app.controller('EditOfferCtrl',function($scope, $http, offerId,$location,offerType, $modalInstance, $route, Offers,$routeParams, IP)
{
	$scope.offerType = offerType;
    $scope.submitForm = function (formData, facilityId) {
       		var fd = new FormData();
		  for(var key in formData)
		  {
		    if(formData[key] != null)
		    fd.append(key, formData[key]);
		  }

		 fd.append("id",offerId);

      	$http.post('http://'+ IP.address + ':3000/offers/updateOffer', fd,{
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      }).then(function successCallback(response){
                      // $location.path('/'+$scope.business_id);
                      $route.reload();
                    }, function errorCallback(response){
                      $scope.error_message = response.data;
                    });


						$route.reload();
            $modalInstance.close('closed');
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


// =========== Delete ============
app.controller('DeleteOffersController', function($scope, $http, $modal, $location, Offers,$routeParams, IP) {

      $scope.business_id = $routeParams.id;
	  $scope.deleteOffer = function (offerId) {
				var modalInstance = $modal.open({
						templateUrl: 'views/deleteOffer.html',
						controller: 'DeleteOfferCtrl',
						scope: $scope,
						resolve: {
							offerId: function () {
									return offerId;
							}
					}
				});

				modalInstance.result.then(function (selectedItem) {
						$scope.selected = selectedItem;
				}, function () {
						$log.info('Modal dismissed at: ' + new Date());
				});
		};

});

app.controller('DeleteOfferCtrl',function($http, $scope, $modalInstance, offerId, $route,$routeParams, IP){
	$scope.yes = function () {
			$http.get('http://'+ IP.address + ':3000/offers/deleteOffer/'+offerId)
			.then(function successCallback(response){
                    }, function errorCallback(response){
                    });
						$route.reload();
            $modalInstance.close('closed');
    };

    $scope.no = function () {
        $modalInstance.dismiss('cancel');
    };
});
