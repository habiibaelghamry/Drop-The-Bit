angular.module('fasa7ny')
    .controller('SearchController', function ($scope, Search, $routeParams, $location, IP) {
        $scope.ip = IP.address;

        if ($routeParams.keyword == 'undefined')
            $scope.keyword = '';
        else

            $scope.keyword = $routeParams.keyword;
        $scope.minRating; //default min rating is zero 
        $scope.order = -1; //default sorting is descending
        $scope.cat = ''; //default category is all 
        $scope.sortBy = ''; //default is no sort 
        $scope.area = ''; //default area is all 
        $scope.businesses = 'No results.';
        $scope.checked = false;
        $scope.areas = ['New Cairo', 'Maadi', 'Mohandeseen', 'Zamalek'];
        $scope.check = function () {
            if ($scope.checked) {
                $scope.order = 1;
            } else {
                $scope.order = -1;
            }
            $scope.backendSort();
        }
        $scope.backendSort = function () {

            if ($scope.sortBy != '' && $scope.sortBy != 'none') {
                console.log($scope.sortBy);

                Search.sort({
                    sortBy: $scope.sortBy,
                    order: $scope.order
                })
                    .then(function (res) {
                        $scope.businesses = res.data;
                        $scope.chunkedBusinesses = chunk($scope.businesses, 4);

                    }, function (res) {
                        
                    });
            }
        }

        /**
         * Divide array into chunks of length 4
         */
        function chunk(arr, size) {
            var newArr = [];
            for (var i = 0; i < arr.length; i += size) {
                newArr.push(arr.slice(i, i + size));
            }
            return newArr;
        }

        /**
         * Get all business whose public = 1, and divide them into chunks of length 4 for better display
         */
        Search.get()
            .then(function (res) {
                $scope.businesses = res.data;
                $scope.chunkedBusinesses = chunk($scope.businesses, 4);
            }, function (res) {
                alert(res.data);
            });


        //===================
        //REDIRECT TO BUSINESS PAGE
        //===================
        $scope.goToBusinessPage = function (business) {

            $location.path('/business/' + business.name);
        }

    }); 