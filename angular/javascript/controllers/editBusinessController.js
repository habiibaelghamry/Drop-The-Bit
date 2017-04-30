app.controller('editBusinessController', function($scope, status,$http, Business, $location, $routeParams, $modal, $log) {

  $scope.user = {};
  $scope.cash = 0;
  $scope.stripe = 0;
  $scope.both = 0;
  $scope.formData = {};

		status.local()
		 .then(function(res){
		   if(res.data){
				 $scope.user = res.data;
         for(var i = 0; i < $scope.user.payment_methods.length; i++)
          {
            if($scope.user.payment_methods[i] === "Cash") $scope.cash = 1;
            if($scope.user.payment_methods[i] === "Stripe") $scope.stripe = 1;
            if($scope.cash && $scope.stripe) $scope.both = 1;
          }
		     if(res.data.user_type == 1)
		       $scope.type = 1;
		     else if(res.data.user_type == 2)
		       $scope.type  = 4;
		     else $scope.type = 3;
		   }
		   else {
				 $scope.user = res.data;
		     status.foreign()
		     .then(function(res){
		       if(res.data.user_type)
		         $scope.type = 1;
		       else $scope.type = 2;
		     });
		   }
		});

    $scope.formData = {};

    google.maps.event.addDomListener(window, 'load', $scope.initMap);

    $scope.initMap = function () {

        var myLatlng = new google.maps.LatLng(30.05483, 31.23413);
        var mapProp = {
        center:myLatlng,
        zoom:5,
        mapTypeId:google.maps.MapTypeId.ROADMAP

      };

      var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

      var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'Hello World!',
          draggable:true
      });


     // marker drag event
     google.maps.event.addListener(marker,'drag',function(event) {
       $scope.Lat = event.latLng.lat();
       $scope.Lng = event.latLng.lng();

     });
   //  marker drag event end
     google.maps.event.addListener(marker,'dragend',function(event) {
     $scope.Lat = event.latLng.lat();
     $scope.Lng = event.latLng.lng();
     });






    }


  $scope.goToEdit = function() {
  $scope.error = "";

  for(var i = 0; $scope.formData.phones && i < $scope.formData.phones.length; i++)
  {
    if(isNaN($scope.formData.phones[i]) || ($scope.formData.phones.length != 11))
    {
      $scope.error = "Please enter a valid phone number.";
    }
  }


  if(!$scope.error) {
    var payment = [];
    var i = 0;
    
    if($scope.formData.pay0 == true){
      payment[i] =  "Cash";
      i++;
    }
     if($scope.formData.pay1 == true) payment[i] =  "Stripe";

     $scope.formData.payment_methods = payment;
     
      Business.edit($scope.formData)
      .then(function successCallback(d) {
        
        $location.path('/business/'+ d.data.business.name);
      },function errorCallback(d){
        $scope.error = d.data;
      })
    }
  };


  $scope.goToLocEdit = function() {
  $scope.error = "";
  $scope.formData.location = {};
  $scope.formData.location.Lat = $scope.Lat;
  $scope.formData.location.Lng = $scope.Lng;

    Business.editLocation($scope.formData)
    .then(function successCallback(d) {
      $location.path('/business/'+ d.data.business.name);
    },function errorCallback(d){
      $scope.error = d.data;
    })
  };




























});
