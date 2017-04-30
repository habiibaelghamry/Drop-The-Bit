app.controller('calendarController', function ($scope, Schedule, $routeParams, uiCalendarConfig) {

    $scope.events = [];
    $scope.eventSources = [$scope.events];
    $scope.error = "";
    Schedule.get($routeParams.name)
    .then(function successCallback(d) {
        $scope.events1 = d.data.events;
        $scope.eventocc = d.data.eventocc;

        $scope.events = [];
        for(var i = 0; i < $scope.events1.length; i++) {
            for(var j = 0; j < $scope.eventocc.length; j++) {
              if($scope.events1[i]._id == $scope.eventocc[j].event) {

                var startevent = new Date($scope.eventocc[j].day);
                var endevent = new Date($scope.eventocc[j].day);

                var time = $scope.eventocc[j].time;
                var a = time.split('-');
                var start = a[0];
                var end = a[1];

                var startsplit = start.split(':');
                var starthour = startsplit[0];
                var startmin = startsplit[1];

                startevent.setHours(Number(starthour));
                startevent.setMinutes(Number(startmin));

                var endsplit = end.split(':');
                var endhour = endsplit[0];
                var endmin = endsplit[1];

                endevent.setHours(Number(endhour));
                endevent.setMinutes(Number(endmin));
                $scope.events.push({
                  title:$scope.events1[i].name,
                  start:startevent,
                  end:endevent,
                  color:'#008000'
                });
              }
            }
          }

          var date = new Date();
		      $scope.now = date. getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
          $scope.uiConfig = {
              calendar: {
                header: {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'listDay,listWeek,month'
                },

                // customize the button names,
                // otherwise they'd all just say "list"
                views: {
                  listDay: { buttonText: 'list day' },
                  listWeek: { buttonText: 'list week' }
                },

                defaultView: 'month',
                defaultDate: $scope.now,
                navLinks: true, // can click day/week names to navigate views
                editable: true,
                eventLimit: true, // allow "more" link when too many events
                events:$scope.events
                // eventClick: function(event) {
                //   if (event.url) {
                //     return false;
                //   }
                // }
              }
          };
    }, function errorCallback(d) {
        $scope.error = d.data;
    });
});
