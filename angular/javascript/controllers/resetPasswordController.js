angular.module('fasa7ny')
.controller('resetPasswordController', function($scope, $routeParams, resetPassword, $window, $timeout, IP) {

    var token = $routeParams.token;
    $scope.form = {};

    $scope.submitForm = function(){
      $scope.err = "";
      if(!$scope.form.password)
        $scope.err = "Please use at least 8 characters."
      else {
        resetPassword.reset(token, $scope.form).then(function(data)
        {

          if(data.data.startsWith("Success!" ))
          {
              $scope.success = data.data;
              $timeout(function() {
              $location.path("/");
            }, 2000);
          }

          else {
            $scope.err = data.data;
          }
        });

      }
      }


});
