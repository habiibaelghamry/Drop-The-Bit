var app = angular.module('fasa7ny');

app.controller('bookFacilityController', function($scope, $http, $location,$routeParams,Business, Offers,status,Occurrences,Facilities, IP) {

    $scope.business_id = $routeParams.id;
      $scope.user = {};
      status.local().then(function(res){
         if(res.data)
         {
           $scope.user = res.data._id;
           if(res.data.user_type == 1)
             $scope.type = 1;
           else if(res.data.user_type == 2 && $scope.business_id == res.data._id)
             $scope.type  = 4;
           else if(res.data.user_type == 3) $scope.type = 3;
         }
         else {
           $scope.user = res.data._id;
           status.foreign()
           .then(function(res){
             if(res.data.user_type)
               $scope.type = 1;
             else $scope.type = 5;
           });
         }
       });

      $scope.business_id = $routeParams.id;
      Facilities.get().then(function(response){
           $scope.facilities = response.data;
      }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
      Offers.get($scope.business_id).then(function(response) {
              $scope.offers = response.data;              
        }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
      Occurrences.get().then(function(response){
           $scope.timings = response.data;
      }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
      Business.getById($scope.business_id).then(function(response){
            $scope.business = response.data;
            $scope.cash = false;
            $scope.stripe = false;
     for (var i = $scope.business.payment_methods.length - 1; i >= 0; i--) {
         if($scope.business.payment_methods[i] === "Cash")
            $scope.cash = true;
         if($scope.business.payment_methods[i] == "Stripe")
              $scope.stripe = true;
       }
      }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
      
      $scope.choose_date = function(date)
      {
        $scope.date  = date.getDate();
        $scope.year  = date.getFullYear();
        $scope.month = date.getMonth();
      }
      $scope.Date = function(datetime)
      {
        return new Date(datetime).getDate();
      }
      $scope.Year = function(datetime)
      {
        return new Date(datetime).getFullYear();
      }
      $scope.Month = function(datetime)
      {
        return new Date(datetime).getMonth();
      }
      $scope.choose_occ = function(timing)
      {
        $scope.max_count = timing.available;
        $scope.event = timing.event;
        $scope.occ_id = timing._id;

        Facilities.getEvent($scope.event).then(function(response)
        {
            $scope.chosen_event = response.data;
        }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });

      }


      $scope.minDate = new Date();
      var today = new Date();
      today.setMonth(today.getMonth()+1);
      $scope.maxDate = new Date(today.getFullYear(),today.getMonth() , today.getDate());
      $scope.error_message="";

      $scope.book_cash = function()
      {
        
        $scope.event_price = $scope.chosen_event.price;
        $scope.min_charge = apply_best_offer_facility($scope.chosen_facility, $scope.max_count, $scope.event_price, $scope.chosen_event.capacity, $scope.formData.count, $scope.formData.chosen_offer, $scope.offers);
         if($scope.type == 1)
        {
        $http.post('http://'+ IP.address + ':3000/bookings/createRegUserBookings', {count: $scope.formData.count ,event: $scope.occ_id, charge: $scope.min_charge, business_id: $scope.business_id})
                    .then(function successCallback(response){
                      $location.path('/success/'+response.data._id);
                    }, function errorCallback(response){
                       $scope.error_message = response.data;
                    });
         }
         else if($scope.type == 4)
          {
            $http.post('http://'+ IP.address + ':3000/bookings/book_event', {count: $scope.formData.count ,event_id: $scope.occ_id, charge: $scope.min_charge})
                    .then(function successCallback(responce){
                      $location.path('/success/'+responce.data._id);

                    }, function errorCallback(responce){
                      $scope.error_message = responce.data;
                    });
          }

      }

      $scope.stripe_handler = StripeCheckout.configure({
          key: "pk_test_O1Gn3Rl11nLaHckNqvJOzaYz",
          locale: 'auto',
          currency : "egp",
          token: function(token)
          {
            $http.post('http://'+ IP.address + ':3000/bookings/charge', {stripeToken: token.id, amount: $scope.stripe_charge})
                    .then(function successCallback(responce){
                      
                      $http.post('http://'+ IP.address + ':3000/bookings/createRegUserBookings', {count: $scope.formData.count ,event: $scope.occ_id, stripe_charge:responce.data.id, charge: $scope.charge, user_id: "58ed22fcbfe67363f0c3a41d", business_id: $scope.business_id})
                            .then(function successCallback(responce){
                              $location.path('/success/'+responce.data._id);

                            }, function errorCallback(responce){
                               //redirect to not authorized page
                               $scope.error_message = responce.data;
                            });

                    }, function errorCallback(responce){
                       //redirect to not authorized page
                       $scope.error_message = responce.data;
                    });
          }
        });
        $scope.open_stripe = function()
        {
          $scope.event_price = $scope.chosen_event.price;
          var basic_charge = apply_best_offer_facility($scope.chosen_facility, $scope.max_count, $scope.event_price, $scope.chosen_event.capacity, $scope.formData.count, $scope.formData.chosen_offer, $scope.offers);
          var new_charge = basic_charge * 103;
          $scope.stripe_charge = Math.round(new_charge);
          $scope.charge  = $scope.stripe_charge / 100;
          $scope.stripe_handler.open({
            name: $scope.event.name,
            description: "Booking for "+$scope.formData.count,       // TODO add offer
            amount: $scope.stripe_charge
          });
        }

});


app.controller('successfulBookingController', function($scope, $http, $location,$routeParams, status,IP)
{
  $scope.booking_id = $routeParams.bookingId;
  $http.post('http://'+ IP.address + ':3000/bookings/get_booking', {bookingId: $scope.booking_id}).then(
    function(response){
      $scope.booking = response.data;
    }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
});

var apply_best_offer_facility = function(facility, max_count, price, capacity, count, chosen_offer, offers)
{
                var original_charge = price * count;
                var min_charge = original_charge;
                if(typeof chosen_offer != 'undefined')
                {
                    var newcharge = original_charge -  ((chosen_offer / 100) * original_charge);
                    min_charge = (min_charge > newcharge) ? newcharge : min_charge;
                }
                for (var i = offers.length - 1; i >= 0; i--)
                {
                    if(typeof offers[i].event_id == 'undefined')
                    {
                        if(typeof offers[i].facility_id == 'undefined' || offers[i].facility_id === facility)
                        {
                            if(offers[i].type === "min_count" && count >= offers[i].min_count)
                            {
                                var newcharge = original_charge -  ((offers[i].value / 100) * original_charge);
                                min_charge = (min_charge > newcharge) ? newcharge : min_charge;
                            }
                            if(offers[i].type === "duration" && (new Date()).getTime() >= new Date(offers[i].start_date).getTime() && new Date(offers[i].expiration_date).getTime() > (new Date()).getTime())
                            {
                                var newcharge = original_charge -  ((offers[i].value / 100) * original_charge);
                                min_charge = (min_charge > newcharge) ? newcharge : min_charge;
                            }

                            if(offers[i].type === "lucky_first" && (capacity -  max_count) < offers[i].lucky_first)
                            {
                                var lucky = offers[i].lucky_first - (capacity - max_count);
                                var apply_on = (lucky < count) ? lucky : count;
                                var newcharge = ((apply_on * price) - offers[i].value / 100 * apply_on * price) + (count - apply_on) * price;
                                min_charge = (min_charge > newcharge) ? newcharge : min_charge;
                            }
                        }
                    }
                }
                return min_charge;
}
