angular.module('fasa7ny')
.controller('searchtestController', ['$scope','$routeParams', function($scope, $routeParams) {
    $scope.id = $routeParams.id;

  }]);
