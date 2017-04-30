angular.module('fasa7ny')
    .factory('Stats', ['$http', '$cookies', 'IP', function ($http, $cookies, IP) {
        var api = 'http://' + IP.address + ':3000';
        var factory = {};
        factory.year = function (params) {
            return $http.post('http://' + IP.address + ':3000/stats/year', params);
        }
        factory.month = function (params) {
            return $http.post('http://' + IP.address + ':3000/stats/month', params);
        }
        factory.week = function (params) {
            return $http.post('http://' + IP.address + ':3000/stats/week', params);
        }
        factory.getAllStats = function (params) {
            return $http.post('http://' + IP.address + ':3000/stats/all', params);
        }

        var formatDate = function (date) {
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var day = date.getDate();
            var month = months[date.getMonth()];
            var year = date.getFullYear();
            return day + ' ' + month + ' ' + year;
        }
        factory.processData = function (resData, type) {
            var chart = {};
            chart.labels = [];
            chart.data = [];
            var views = [];
            var attend = [];
            var rating = [];
            var sales = [];
            var subs = [];

            for (var i = 0; i < resData.length; i++) {
                if (type == 'year')
                    chart.labels.push(resData[i].year);
                else if (type == 'month')
                    chart.labels.push((resData[i].month + 1) + ' - ' + resData[i].year);
                else if (type == 'week') {

                    chart.labels.push(formatDate(new Date(resData[i].startDate)) + ' - ' + formatDate(new Date(resData[i].endDate)));

                }

                views.push(resData[i].views);
                attend.push(resData[i].attendees);
                rating.push(resData[i].rating);
                sales.push(resData[i].sales);
                subs.push(resData[i].subscriptions);
            }
            chart.data.push(views);
            chart.data.push(attend);
            chart.data.push(rating);
            chart.data.push(sales);
            chart.data.push(subs);
            return chart;
        }

        factory.checkCookies = function (userType, businessID) {
            //if logged in user, or not logged in user, or another business, then count page views
            if (userType != 4 && userType != 3) {
                var cookieKey = 'fasa7ny.' + businessID;
                var cookie = $cookies.get(cookieKey);

                if (typeof cookie == 'undefined' || cookie == null) {
                    var date = new Date();
                    $http.post('http://' + IP.address + ':3000/stats/addStat', {
                        date: date,
                        businessID: businessID,
                        statType: 'views',
                        amount: 1
                    }, function (res) {

                    });
                    var now = new Date();
                    now.setDate(now.getDate() + 1);
                    $cookies.put(cookieKey, 'fasa7ny', {
                        expires: now
                    });
                }
            }
        }

        return factory;
    }]); 