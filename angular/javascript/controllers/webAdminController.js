
angular.module('fasa7ny').controller('webAdminController', function($scope,$http,$modal,$route ,status, IP)
	{
    $scope.ip = IP.address;
     status.local()
     .then(function(res){
       if(res.data){
         if(res.data.user_type == 3)    // admin
           $scope.type = 3;   // authorized as admin, anything else not admin, show "not authorized" message
       }
     });
    $scope.ads = [];
    $scope.requests = [];
    $scope.msg = "";


    $http.get('http://'+ IP.address + ':3000/admin/viewRequestedDelete').then(function successCallback(response){
            $scope.requests = response.data;
            }, function errorCallback(response){
              $location.path("/error/"+response.status);
            });

    $http.get('http://'+ IP.address + ':3000/admin/viewAdvertisements').then(function successCallback(response){
            $scope.ads = response.data;
      }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });


       $scope.addBusiness = function()
         {

             $http.post('http://'+ IP.address + ':3000/admin/add_business', $scope.business)
             .then(function(response)
             {
                $scope.msg = response.data;
                $scope.business = {};
             }, function errorCallback(response){
                $location.path("/error/"+response.status);
              });


         };


$scope.addAds = function()
{
     var fd = new FormData();
      for(var key in $scope.advertisement)
      fd.append(key, $scope.advertisement[key]);

      $http.post('http://'+ IP.address + ':3000/admin/createAdvertisement',fd, {

      transformRequest: angular.identity,
      headers: {'Content-Type':undefined }
      }).then(function(response)
      {
            $scope.msg = response.data;
           $scope.advertisement = {};

      })

  };


  $scope.deleteBusiness = function (request)
  {
    if (confirm('Are you sure you want to delete this?'))
     {
    $http.get("http://"+ IP.address + ":3000/admin/deleteBusiness/"+ request._id).then(function(response){
       $route.reload();
    },
     function(response){
      $scope.msg = response.data;
     });

    }

  };

  $scope.deleteAd = function(ad)
  {
    if (confirm('Are you sure you want to delete this?')) {
    $http.get("http://"+ IP.address + ":3000/admin/deleteAdvertisement/"+ ad._id).then(function(response){
       $route.reload();
    },
     function(response){
      $scope.msg = response.data;
     }
    )
  }
 }
});
