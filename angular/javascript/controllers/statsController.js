angular.module('fasa7ny')
    .controller('StatsController', function ($scope, Stats, $routeParams, status, $location) {
        // $scope.type = 1;
        $scope.businessID = $routeParams.id;
        $scope.title = 'Statistics';
        $scope.maxDate = new Date() + "";
        $scope.errMsg = '';
        $scope.type; 
        status.local()
            .then(function (res) {

                if (res.data) {
                    if (res.data.user_type == 1)
                        $scope.user_type = 1;
                    else if (res.data.user_type == 2)
                        $scope.user_type = 4;
                    else $scope.user_type = 3;
                }
                else {
                    status.foreign()
                        .then(function (res) {
                            if (res.data.user_type)
                                $scope.user_type = 1;
                            else $scope.user_type = 2;
                        });
                }
            }, function (res) {
                if (res.status == 401) {
                    $location.path('/not-authorized');
                } else {
                    alert(res.data);
                }
            });


        //the 5 metrics tracked in our stats system
        $scope.series = ['Views', 'Customers', 'Rating', 'Sales', 'Subscriptions'];

        //initilaization with dummy data as a demo 
        $scope.data = [
            [1, 4, 2, 5, 7],
            [8, 3, 4, 4, 2],
            [1, 2, 4, 8, 0],
            [2, 5, 3, 3, 3],
            [2, 7, 8, 2, 4],
        ];
        //get total stats of this business to display in boxes at the top
        Stats.getAllStats({ businessID: $scope.businessID })
            .then(function (res) {
                $scope.allStats = res.data;
            }, function errorCallback(response){
                $location.path("/error/"+response.status);
              });
        //get stats on demand when button is clicked
        $scope.getStats = function () {
            if ($scope.type == 'year') {
                Stats.year({ businessID: $scope.businessID, startYear: +$scope.startYear, endYear: +$scope.endYear })
                    .then(function (res) {
                        $scope.title = 'Yearly Statistics';

                        //clearing data and labels 
                        $scope.labels = [];
                        $scope.data = [];
                        var resData = res.data;
                        if (resData.length == 0)
                            $scope.noStats = true;
                        var chart = Stats.processData(resData, 'year');
                        $scope.data = chart.data;
                        $scope.labels = chart.labels;
                    }, function (res) {
                        if (res.status == 401) {
                            $location.path('/not-authorized');
                        } else {
                            $scope.errMsg = res.data;
                        }
                    });
            } else if ($scope.type == 'month') {
                Stats.month({
                    businessID: $scope.businessID,
                    startYear: +$scope.startYear,
                    endYear: +$scope.endYear,
                    startMonth: +$scope.startMonth - 1,
                    endMonth: +$scope.endMonth - 1
                })
                    .then(function (res) {
                        $scope.title = 'Monthly Statistics';
                        //clearing data and labels 
                        $scope.labels = [];
                        $scope.data = [];
                        var resData = res.data;
                        if (resData.length == 0)
                            $scope.noStats = true;
                        var chart = Stats.processData(resData, 'month');
                        $scope.data = chart.data;
                        $scope.labels = chart.labels;
                    }, function (res) {
                        if (res.status == 401) {
                            $location.path('/not-authorized');
                        } else {
                            $scope.errMsg = res.data;
                        }
                    })
            } else if ($scope.type == 'week') {
                Stats.week({
                    businessID: $scope.businessID,
                    startDate: $scope.startDate,
                    endDate: $scope.endDate
                }).then(function (res) {
                    $scope.title = 'Monthly Statistics';
                    //clearing data and labels 
                    $scope.labels = [];
                    $scope.data = [];
                    var resData = res.data;
                    if (resData.length == 0)
                        $scope.noStats = true;
                    var chart = Stats.processData(resData, 'week');
                    $scope.data = chart.data;
                    $scope.labels = chart.labels;
                }, function (res) {

                    if (res.status == 401) {
                        $location.path('/not-authorized');
                    } else {
                        $scope.errMsg = res.data;
                    }
                });
            }
        }

        $scope.onClick = function (points, evt) {
        };
        $scope.datasetOverride = [
            { yAxisID: 'y-axis-1' },
            { yAxisID: 'y-axis-2' },
            { yAxisID: 'y-axis-3' },
            { yAxisID: 'y-axis-4' },
            { yAxisID: 'y-axis-5' }

        ];
        $scope.options = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-3',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    },
                    {
                        id: 'y-axis-4',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    },
                    {
                        id: 'y-axis-5',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }
                ]
            }
        };


    });

