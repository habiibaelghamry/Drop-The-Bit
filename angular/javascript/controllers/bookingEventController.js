var app = angular.module('fasa7ny');
app.controller('bookingEventController', function($scope, $http,$routeParams,Business,$location,Event,status, Offers,viewOccurences, IP)
{
    $scope.current_event = $routeParams.id;
      Event.get($scope.current_event).then(
          function successCallback(response)
          {
            $scope.event = response.data.event;
            $scope.business_id = $scope.event.business_id;
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
                 Offers.get($scope.business_id)
                  .then(function(response) {
                         $scope.offers = response.data;

                     },function errorCallback(response){
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
             });



          }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });


        viewOccurences.get($scope.current_event).then(function (response) {
          $scope.event_occ = response.data.eventocc[0];
          $scope.max = $scope.event_occ.available;
        }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });

        $scope.min = 1;
        $scope.error_message="";


        $scope.book_cash = function()
        {
          $scope.error_message="";
          var chosen_offer = $scope.formData.chosen_offer;
          var min_charge = apply_best_offer_once_event($scope.event, $scope.event_occ, $scope.formData.count, $scope.formData.chosen_offer, $scope.offers);
          $scope.charge = min_charge;
          if($scope.type == 1)
          {
             $http.post('http://'+ IP.address + ':3000/bookings/createRegUserBookings', {count: $scope.formData.count ,event: $scope.event_occ._id, charge: $scope.charge,business_id:$scope.business_id})
                    .then(function successCallback(responce){
                     $location.path('/success/'+responce.data._id);

                    }, function errorCallback(responce){
                      $scope.error_message = responce.data;
                    });
           }
          else if($scope.type == 4)
          {
             $http.post('http://'+ IP.address + ':3000/bookings/book_event', {count: $scope.formData.count ,event_id: $scope.event_occ._id, charge: $scope.charge, user_id: $scope.user._id})
                    .then(function successCallback(responce){
                      $location.path('/success/'+responce.data._id);

                    }, function errorCallback(responce){
                      $scope.error_message = responce.data;
                    });
          }
        }

        $scope.stripe_handler = StripeCheckout.configure(
        {
          key: "pk_test_O1Gn3Rl11nLaHckNqvJOzaYz",
          locale: 'auto',
          currency : "egp",
          token: function(token)
          {
            $http.post('http://'+ IP.address + ':3000/bookings/charge', {stripeToken: token.id, amount: $scope.stripe_charge})
                    .then(function successCallback(responce){
                      $http.post('http://'+ IP.address + ':3000/bookings/createRegUserBookings/', {count: $scope.formData.count ,event: $scope.event_occ._id, charge: $scope.charge, stripe_charge: responce.data.id, user_id: $scope.user._id, business_id: $scope.business_id})
                            .then(function successCallback(responce){
                              $location.path('/success/'+responce.data._id);

                            }, function errorCallback(responce){
                              $scope.error_message = responce.data;

                            });

                    }, function errorCallback(responce){
                       $scope.error_message = responce.data;
                    });
          }
        });
        $scope.open_stripe = function()
        {
          var basic_charge = apply_best_offer_once_event($scope.event, $scope.event_occ, $scope.formData.count, $scope.formData.chosen_offer, offers);
          var new_charge = basic_charge * 103;
          $scope.stripe_charge = Math.round(new_charge);
          $scope.charge  = $scope.stripe_charge / 100;
          $scope.stripe_handler.open({
            name: $scope.event.name,
            description: "Booking for "+$scope.formData.count,       // TODO add offer
            amount: $scope.stripe_charge
          });
        }

        var apply_best_offer_once_event = function(event, event_occ, count, chosen_offer, offers)
        {
                var original_charge = event.price * count;
                var min_charge = original_charge;
                if(typeof chosen_offer != 'undefined')
                {
                    var newcharge = original_charge -  ((chosen_offer / 100) * original_charge);
                    min_charge = (min_charge > newcharge) ? newcharge : min_charge;
                }
                for (var i = offers.length - 1; i >= 0; i--)
                {
                    if(typeof offers[i].facility_id == 'undefined')
                    {
                        if(typeof offers[i].event_id == 'undefined' || offers[i].event_id === event._id)
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
                            if(offers[i].type === "lucky_first" && (event.capacity - event_occ.available) < offers[i].lucky_first)
                            {

                                var lucky = offers[i].lucky_first - (event.capacity - event_occ.available);
                                var apply_on = (lucky < count) ? lucky : count;
                                var newcharge = ((apply_on * event.price) - offers[i].value / 100 * apply_on * event.price) + (count - apply_on) * event.price;
                                min_charge = (min_charge > newcharge) ? newcharge : min_charge;
                            }
                        }
                    }
                }
                min_charge = min_charge.toFixed(2);
                return min_charge;
        }

});
