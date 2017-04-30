var app = angular.module('fasa7ny');

app.controller('errorController',function($routeParams,$scope)
{
	$scope.status = $routeParams.status;
	if($scope.status  == '401' || $scope.status  == '403' )
		$scope.error_message = "Your are not authorized to view this page."
	else
		$scope.error_message = "Whoopsie Daisy!! Something went wrong."
});