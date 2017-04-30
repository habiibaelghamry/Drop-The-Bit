
app.controller('editLocationController',  function($scope, $routeParams, Business, status) {


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

  $scope.goToEdit= new function()
  {
    $scope.formData = {};
    $scope.formData.location = {};
    $scope.formData.location.Lat = $scope.Lat;
    $scope.formData.location.Lng = $scope.Lng;

    Business.editLocation($scope.formData)
    .then(function successCallback(d) {
    //  $location.path('/business/'+ d.data.business.name);
    },function errorCallback(d){
      $scope.error = d.data;
    })
  }

  google.maps.event.addDomListener(window, 'load', $scope.initMap);

  $scope.initMap = function () {

      var myLatlng3 = new google.maps.LatLng(30.05483, 31.23413);
      var mapProp3 = {
      center:myLatlng3,
      zoom:5,
      mapTypeId:google.maps.MapTypeId.ROADMAP

    };

    var map3 = new google.maps.Map(document.getElementById("googleMap3"), mapProp3);

    var marker3 = new google.maps.Marker({
        position: myLatlng3,
        map: map3,
        title: 'Hello World!',
        draggable:true
    });


  // marker drag event
   google.maps.event.addListener(marker3,'drag',function(event) {
     $scope.Lat = event.latLng.lat();
     $scope.Lng = event.latLng.lng();

   });
  //marker drag event end
   google.maps.event.addListener(marker3,'dragend',function(event) {
   $scope.Lat = event.latLng.lat();
   $scope.Lng = event.latLng.lng();
   });

}

});
