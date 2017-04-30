angular.module('fasa7ny')
.controller('notificationsController', function($scope, status, $q) {

  status.local().then(
    function(result)
         {
           if(result.data)
           {
              if(result.data.notifications)
              {
                result.data.notifications.reverse();
                $scope.notifications =  result.data.notifications;
              }
              else {
                $scope.err = "No notifications to show.";
              }
            }
            if(!result.data)
            {
              var deferred = $q.defer();
              status.foreign().then(function(result){
                if(result.data)
                {
                  if(result.data.notifications.length > 0)
                  {
                   result.data.notifications.reverse();
                   $scope.notifications =  result.data.notifications;
                  }
                  else {
                    $scope.err = "No notifications to show.";
                  }

                 }
                 else {
                   $scope.err = "Unauthorized access.";
                 }

                deferred.resolve(result);
              },function(response){
                deferred.reject();
                $location.path('/');
              });

            }


         });


  });
