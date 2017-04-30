
var app = angular.module('fasa7ny');
app.controller('businessController', function ($scope, status, $http, Business, $location, $routeParams, $modal, $log, $window, $document, Stats, IP) {
  // $scope.type = {}; //must be initialized otherwise is undefined later
  $scope.ip = IP.address;
  status.local()
    .then(function (res) {
      if (res.data) {
        if (res.data.user_type == 1)
          $scope.type = 1;
        else if (res.data.user_type == 2)
          $scope.type = 4;
        else $scope.type = 3;
      }
      else {
        status.foreign()
          .then(function (res) {
            if (res.data.user_type)
              $scope.type = 1;
            else $scope.type = 2;
          });
      }
    });


  // $scope.type = 2; //unregistered user or business visiting another business

  $scope.maxRating = 5;
  $scope.ratedBy = 0;
  $scope.avgRate = 0;
  $scope.sub = "Subscribe";



  $scope.imagelength = 0;
  $scope.business = {};
  $scope.slides = [];
  $scope.facilities = [];
  $scope.facilitylength = 0;
  $scope.phones = [];
  $scope.methods = [];

  $scope.events = []; //once events
  $scope.eventlength = 0;

  $scope.sublength = 0;
  $scope.offerslength = 0;
  Business.get($routeParams.name)
    .then(function (d) {
      status.local()
        .then(function (res) {
          if (res.data) {
            //storing user
            $scope.user = res.data;
            if (res.data.user_type == 1) {
              $scope.type = 1;
              if (d.data.rate) $scope.ratedBy = d.data.rate;

              $scope.check = 0;
              for (var i = 0; i < d.data.result.subscribers.length; i++) {
                if (d.data.result.subscribers[i] == res.data._id) {
                  $scope.check = 1;
                  $scope.sub = "Unsubscribe";
                }
              }
            }
            else if (res.data.user_type == 3) {
              $scope.type = 3;
            }
            else if (res.data.user_type == 2) {
              if (res.data._id == d.data.result._id) {
                $scope.type = 4;
              } else {
                $scope.type = 2;
              }
            } else $scope.type = 2;

          }
          else {
            status.foreign()
              .then(function (res) {
                if (res.data) {
                  //storing user object
                  $scope.user = res.data;
                  if (res.data.user_type == 1) {
                    $scope.type = 1;
                    if (d.data.rate) $scope.ratedBy = d.data.rate;

                    $scope.check = 0;
                    for (var i = 0; i < d.data.result.subscribers.length; i++) {
                      if (d.data.result.subscribers[i] == res.data._id) {
                        $scope.check = 1;
                        $scope.sub = "Unsubscribe";
                      }
                    }
                  }
                  else if (res.data.user_type == 3) {
                    $scope.type = 3;
                  }
                  else if (res.data.user_type == 2) {
                    if (res.data._id === d.data.result.id) {
                      $scope.type = 4; //my business page
                    } else {
                      $scope.type = 2; //business visiting another business' page
                    }
                  } else $scope.type = 2;
                }
                else {
                  $scope.type = 2;
                }
              });
          }

        });

      $scope.business = d.data.result;

      //check cookies for page views count
      Stats.checkCookies($scope.type, $scope.business._id);


      $scope.phones = d.data.result.phones;
      $scope.phonelength = 0; //zero means that the business has more than one phone number
      if ($scope.phones.length == 1) $scope.phonelength = 1;

      $scope.sublength = $scope.business.subscribers.length;

      $scope.methods = d.data.result.payment_methods;
      $scope.paymentlength = $scope.methods.length; //zero means that the business has more than one payment method
      // if($scope.methods.length == 1) $scope.paymentlength = 1;
      $scope.categories = d.data.result.category;
      // $scope.user = d.data.user;
      // $scope.images = d.data.result.images;

      $scope.facilities = d.data.facilities;
      $scope.facilitylength = d.data.facilities.length;

      $scope.events = d.data.events; //once events
      $scope.eventlength = d.data.events.length;

      $scope.avgRate = d.data.result.average_rating;
      $scope.slides = $scope.business.images;
      $scope.imagelength = $scope.business.images.length;
      $scope.location = d.data.result.location;

    //  google.maps.event.addDomListener(window, 'load', $scope.initMap);
      var initMap = function () {


        if ($scope.business.location) {
          var myLatLng2 = new google.maps.LatLng($scope.business.location.Lat, $scope.business.location.Lng);
          var mapProp2 =
            {
              center: myLatLng2,
              zoom: 5,
              mapTypeId: google.maps.MapTypeId.ROADMAP

            };

          var map2 = new google.maps.Map(document.getElementById("googleMap2"), mapProp2);


          var marker2 = new google.maps.Marker
            ({
              position: myLatLng2,
              map: map2,
              title: 'Location',
              draggable: false
            });



        }

      };

      initMap();






    },function errorCallback(response){
            $location.path("/error/"+response.status);
       });






  $scope.remove = function () {
    $scope.message = "Remove Button Clicked";

    Business.hasBookings().then(function (responce) {
      if (responce.data != 0) {

        var notAllowedModalInstance = $modal.open({
          templateUrl: 'views/notAllowedRemovePop.html',
          controller: NotAllowedRemove,
          scope: $scope

        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        });
      }
      else {

        var modalInstance = $modal.open({
          templateUrl: 'views/removePop.html',
          controller: Remove,
          scope: $scope

        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        });
      }
    }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });

  };


  $scope.createOffer = function (id) {
    $location.path('/createOffer/' + id);
  };

  $scope.deleteImage = function (image) {
    $scope.message = "Show delete Form Button Clicked";
    $scope.image = image;
    var modalInstance = $modal.open({
      templateUrl: 'views/deleteImage.html',
      controller: deleteImageCtrl,
      scope: $scope
    });

  }



  $scope.subscribe = function (id) {
    Business.subscribe(id)
      .then(function (d) {
        $scope.sub = "Unsubscribe";
        $scope.check = 1;
        $scope.sublength = $scope.sublength + 1;
      }, function (res) {
        alert(res.data);
      })
  };

  $scope.unsubscribe = function (id) {
    Business.unsubscribe(id)
      .then(function (d) {
        $scope.sub = "Subscribe";
        $scope.check = 0;
        $scope.sublength = $scope.sublength - 1;
      }, function (res) {
        alert(res.data);
      })
  };

  $scope.rateBy = function (star, bid) {
    Business.rate(star, bid)
      .then(function (d) {
        $scope.avgRate = d.data.average_rating;
        $scope.ratedBy = star;
      }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
  };


  $scope.public = function () {
    $scope.message = "Public Button Clicked";
    var modalInstance = $modal.open({
      templateUrl: 'views/publicPop.html',
      controller: Public,
      scope: $scope

    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
      $scope.business.public = selectedItem.public;
    }, function errorCallback(response){
            $location.path("/error/"+response.status);
       });
  };

  $scope.businessEdit = function () {
    $location.path('/editBusiness');
  };

  $scope.businessEditLocation = function () {
    $location.path('/editLocation');
  };


  $scope.remove = function () {
    $scope.message = "Remove Button Clicked";
    var modalInstance = $modal.open({
      templateUrl: 'views/removePop.html',
      controller: Remove,
      scope: $scope

    });



    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
      $scope.business.delete = selectedItem.delete;
    }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
  };

  $scope.bookFacility = function () {
    $scope.name = $routeParams.name;
    $http.post('http://' + IP.address + ':3000/business/getBusinessId', { name: $scope.name }).then(
      function (response) {
        $scope.business_id = response.data._id;
        $location.path('/book_facility/' + $scope.business_id);
      }, function errorCallback(response){
            $location.path("/error/"+response.status);
          });
  };

  $scope.getEvent = function (eventId) {
    $location.path('/eventPage/' + eventId);
  };

  $scope.createFacility = function (id) {
    $location.path('/createFacility/' + id);
  };

  $scope.deleteImage = function (image) {
    $scope.message = "Show delete Form Button Clicked";
    $scope.image = image;
    var modalInstance = $modal.open({
      templateUrl: 'views/deleteImage.html',
      controller: deleteImageCtrl,
      scope: $scope
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
      $scope.business = selectedItem.business;
      $scope.slides = $scope.business.images;
      $scope.imagelength = $scope.business.images.length;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.addImage = function () {
    $scope.message = "Show image Form Button Clicked";
    var modalInstance = $modal.open({
      templateUrl: 'views/addImage.html',
      controller: addImageCtrl,
      scope: $scope
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
      $scope.business = selectedItem.business;
      $scope.slides = $scope.business.images;
      $scope.imagelength = $scope.business.images.length;

    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.deletePhone = function (phone) {
    $scope.message = "Show delete Form Button Clicked";
    $scope.phone = phone;
    var modalInstance = $modal.open({
      templateUrl: 'views/deletePhone.html',
      controller: deletePhoneCtrl,
      scope: $scope
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
      $scope.phones = selectedItem.phones;
      $scope.phonelength = selectedItem.phones.length;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.deletePaymentMethod = function (method) {
    $scope.message = "Show delete Form Button Clicked";
    $scope.method = method;
    var modalInstance = $modal.open({
      templateUrl: 'views/deletePaymentMethod.html',
      controller: deletePaymentMethodCtrl,
      scope: $scope
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
      $scope.methods = selectedItem.methods;
      $scope.paymentlength = selectedItem.methods.length;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.createOneEvent = function (id) {
    $location.path('/createOneEvent/' + id);
  };

  $scope.schedule = function (name) {
    $location.path('/schedule/' + name);
  };

  $scope.changeImage = function () {
    $scope.error = "";
    Business.changeImage($scope.formData)
      .then(function successCallback(d) {
        $route.reload();
      },
      function errorCallback(d) {
        $scope.error = d.data;
      });
  };

  $scope.viewStats = function () {
    $location.path('/statistics/' + $scope.business._id);
  }


  // ============================================
  //            REVIEWS FUNCTIONS
  // ============================================
  // $scope.desc = false; //sort reviews by votes descendingly
  $scope.addReview = function () {
    Business.addReview({
      review: $scope.reviewBody,
      businessID: $scope.business._id,
      user: {
        name: $scope.user.name,
        id: $scope.user._id,
        image: $scope.user.image
      }
    })
      .then(function (res) {
        $scope.business = res.data;
        $scope.reviewBody = "";
      }, function (res) {
        alert(res.data);
      });
  };
  $scope.deleteReview = function (review) {
    Business.deleteReview({
      reviewUser: review.user._id,
      businessID: $scope.business._id,
      review: review,
      user: $scope.user
    })
      .then(function (res) {
        $scope.business = res.data;
      });
  };

  $scope.addReply = function (reviewID, replyBody) {
    Business.addReply({
      businessID: $scope.business._id,
      reviewID: reviewID,
      reply: replyBody,
      user: $scope.user
    })
      .then(function (res) {
        $scope.business = res.data;
      }, function (res) {
        alert(res.data);
      });
  }

  $scope.deleteReply = function (review, reply) {
    Business.deleteReply({
      businessID: $scope.business._id,
      review: review,
      reply: reply,
      user: $scope.user
    })
      .then(function (res) {
        $scope.business = res.data;
      }, function (res) {
        alert(res.data);
      });
  }

  $scope.upvote = function (review) {
    Business.upvote({
      businessID: $scope.business._id,
      review: review,
      user: $scope.user
    })
      .then(function (res) {
        $scope.business = res.data;
      }, function (res) {
        alert(res.data);
      });
  }

  $scope.downvote = function (review) {
    Business.downvote({
      businessID: $scope.business._id,
      review: review,
      user: $scope.user
    })
      .then(function (res) {
        $scope.business = res.data;
      }, function (res) {
        alert(res.data);
      }, function (res) {
        $scope.reviewError = res.data;
      });
  }


});


var Public = function ($scope, $modalInstance, Business, $route) {
  $scope.form = {}
  $scope.error = "";
  $scope.submitForm = function () {
    Business.public()
      .then(function successCallback(d) {
        $modalInstance.close({
          public: 1
        });
      },
      function errorCallback(d) {
        $scope.error = d.data;
      });

  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var Remove = function ($scope, $modalInstance, Business, $route) {
  $scope.form = {}
  $scope.error = "";
  $scope.submitForm = function () {
    Business.remove()
      .then(function successCallback(d) {
        $modalInstance.close({
          delete: 1
        });
      },
      function errorCallback(d) {
        $scope.error = d.data;
      });
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};


var NotAllowedRemove = function ($scope, $modalInstance, Business, $route) {
  $scope.form = {}
  $scope.submitForm = function () {
    $route.reload();
    $modalInstance.close('closed');
  };
};



var deleteImageCtrl = function ($scope, $modalInstance, Business, $route) {
  $scope.form = {};
  $scope.error = "";
  $scope.yes = function (image) {
    Business.deleteImage(image)
      .then(function successCallback(d) {
        $modalInstance.close({
          business: d.data.business
        });
      }, function errorCallback(d) {
        $scope.error = d.data;
      });
    // $location.path("/business/");
    // $route.reload();
  };

  $scope.no = function () {
    $modalInstance.dismiss('cancel');
  };
};

var addImageCtrl = function ($scope, $modalInstance, Business, $route) {
  $scope.error = "";
  $scope.addImage = function (formData) {
    Business.addImage(formData)
      .then(function successCallback(d) {
        // $scope.business = business;
        // business = d.data.business;

        $modalInstance.close({
          business: d.data.business
        });
      }, function errorCallback(d) {
        $scope.error = d.data;
      });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var deletePhoneCtrl = function ($scope, $modalInstance, Business, $route) {

  $scope.error = "";
  $scope.yes = function (phone) {
    Business.deletePhone(phone)
      .then(function successCallback(d) {
        $modalInstance.close({
          phones: d.data.business.phones
        });
      },
      function errorCallback(d) {
        $scope.error = d.data;
      });

  };

  $scope.no = function () {
    $modalInstance.dismiss('cancel');
  };
};

var deletePaymentMethodCtrl = function ($scope, $modalInstance, business, Business, $route) {
  $scope.error = "";
  $scope.yes = function (method) {
    Business.deletePaymentMethod(method)
      .then(function successCallback(d) {
        $scope.business = business;
        $scope.business = d.data.business;
        $modalInstance.close({
          methods: d.data.business.payment_methods
        });
      },
      function errorCallback(d) {
        $scope.error = d.data;
      });
  };
  $scope.no = function () {
    $modalInstance.dismiss('cancel');
  };

  //check if user is logged in
}
