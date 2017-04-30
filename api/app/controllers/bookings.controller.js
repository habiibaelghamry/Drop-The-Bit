var Booking = require('mongoose').model('Booking');
var Events = require('mongoose').model('Events');
var EventOccurrences = require('mongoose').model('EventOccurrences');
var RegisteredUser = require('mongoose').model('RegisteredUser');
var Business = require('mongoose').model('Business');
var statsController = require('../controllers/stats.controller');
var configAuth = require("../../config/auth"),
  stripe = require("stripe")(configAuth.stripe.secretKey);


//================  < BUSINESS BOOKINGS > ====================


exports.getBooking = function (req, res) {
  var bookingId = req.body.bookingId;

  if (req.user) {
    Booking.findById(bookingId, function (err, booking) {
      if (err || !booking)
        return res.status(500).json("Oops, Something went wrong");
      if (booking.booker != req.user.id) {
        return res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
      }
      return res.status(200).json(booking);
    });
  }
  else
    return res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
}


exports.book_event = function (req, res) {
  //checking active session
  if (req.user && req.user instanceof Business) {
    var form = req.body;

    //exception handling
    if (!form.count || form.count < 1) res.status(500).JSON("Please enter count greater than 1");
    else count = form.count;
    if (form.count < 1) return;

    var event_id = req.body.event_id;
    //get event occurrence being booked
    EventOccurrences.findById(event_id, function (err, eventocc) {
      if (err || !eventocc)
        res.status(500).json("Oops, something went wrong, please try again with the correct information.");
      else {
        Events.findById(eventocc.event, function (err, event) {
          if (err || !event)
            res.status(500).json("Oops, something went wrong, please try again with the correct information.");
          else {
            //check if this event belongs to business currently booking it
            if (event.business_id == req.user.id) {
              //cannot book more than available number
              if (eventocc.available < count) {
                res.status(400).json("Capacity doesn't allow more than " + eventocc.available);
              }
              else {//Create booking instance
                var booking = new Booking
                  ({
                    booking_date: new Date(),
                    count: count,
                    event_id: event_id,
                    booker: req.user.id,
                    booker_name: req.user.name,
                    business_id: req.user.id,
                    charge: req.body.charge,
                    stripe_charge: req.body.stripe_charge
                  });


                //update number of available bookings in event occurrence by subtracting
                // the number of people in booking (count) and the available.
                booking.save(function (err, booking) {
                  if (err || !booking)
                    res.status(500).json("Oops, something went wrong, please try again with the correct information ");
                  else {
                    var newAvailable = eventocc.available - booking.count;

                    // Insert booking in array of bookings of booked event occurrence
                    EventOccurrences.findByIdAndUpdate(event_id, { $set: { "available": newAvailable }, $push: { "bookings": booking } }, { safe: true, upsert: true, new: true },
                      function (err, eventoccur) {
                        if (err || !eventoccur)
                          res.status(500).json("Oops, something went wrong, please try again with the correct information ");
                        else {
                         
                          var now = new Date();
                          now.setHours(0, 0, 0, 0);

                          //add stats records to count number of attendees and amount of money
                          statsController.addStat(now, req.user._id, 'attendees', count);
                          statsController.addStat(now, req.user._id, 'sales', req.body.charge);

                          res.status(200).json(booking);
                        }
                      });
                  }
                });
              }

            }
            else {
              res.status(403).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
            }
          }
        });
      }
    });

  }
  else {
    res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
  }
}


exports.cancel_booking = function (req, res) {

  if (req.user && req.user instanceof Business) {

    var bookingID = req.body.booking_id;       //id of booking to be cancelled
    var event_id = req.body.event_id;         //event_id of booking to be cancelled

    // get booking
    Booking.findById(bookingID, function (err, booking) {
      if (err || !booking)
        return res.status(500).json("Oops, Something went wrong, please try again with the correct information");
      else {
        // get event occurrence of this booking
        EventOccurrences.findById(booking.event_id, function (err, eventocc) {
          if (err || !eventocc)
            return res.status(500).json("Oops, Something went wrong, please try again with the correct information");
          else {
            //get event of event occurrence
            Events.findById(eventocc.event, function (err, event) {
              if (err || !event)
                return res.status(500).json("Oops, Something went wrong, please try again with the correct information");
              else {
                var business = event.business_id;

                // check if this booking belongs to business currently manipulating it
                if (business != req.user.id)
                  return res.status(403).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
                else {

                  Booking.findByIdAndRemove(bookingID, function (err, booking) {
                    if (err || !booking)
                      return res.status(500).json("Oops, something went wrong, please try again with the correct information ");
                    else {
                      var content = business.name + " cancelled your booking in " + event.name + "     ";
                      var now = Date.now();
                      RegisteredUser.findByIdAndUpdate({ _id: booking.booker }, { $push: { "notifications": { content: content, date: now } } }, function (err, user) {
                        if (err)
                          return res.status(500).json("Oops, Something went wrong, please try again with the correct information");
                      });

                      var charge_id = booking.stripe_charge;
                      if (!charge_id || charge_id === undefined) {
                        // return res.status(200).json(booking);
                      }
                      else {
                        var amount = Math.round(booking.charge * 97);
                        var refund = stripe.refunds.create({
                          charge: charge_id,
                          amount: amount
                        }, function (err, refund) {
                          if (err) {
                            res.status(500).json(err.message);
                          }

                        });
                      }



                      EventOccurrences.findByIdAndUpdate(event_id, { $pull: { bookings: bookingID } },
                        function (err, eventocc) {
                          if (err || !eventocc)
                            return res.status(500).json("Oops, Something went wrong, please try again with the correct information");
                          else {
                            eventocc.available = eventocc.available + booking.count;
                            eventocc.save();
                            //stats
                            statsController.addStat(booking.booking_date, booking.business_id, 'attendees', -1 * booking.count);
                            statsController.addStat(booking.booking_date, booking.business_id, 'sales', -1 * booking.charge);

                            res.status(200).json("Booking cancelled successfully, booker is notified");
                          }
                        });

                    }
                  });


                }
              }
            });
          }
        });
      }
    });
  }
  else {
    res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
  }

}


exports.cancel_booking_after_delete = function (req, res) {
  var bookingID = req.body.booking_id;       //id of booking to be cancelled
  var business_id = req.user._id;
  Booking.findByIdAndRemove(bookingID, function (err, booking) {
    if (err || !booking)
      return res.status(500).json("Oops, something went wrong, please try again with the correct information ");
    else {

      if (req.user.id == booking.business_id) {

        var content = req.user.name + "cancelled your booking ";
        var now = Date.now();
        RegisteredUser.findByIdAndUpdate({ _id: booking.booker }, { $push: { "notifications": { content: content, date: now } } }, function (err, user) {
          if (err)
            return res.status(500).json("Oops, Something went wrong, please try again with the correct information");
        });

        var charge_id = booking.stripe_charge;
        if (!charge_id || charge_id === undefined) {
          return res.status(200).json(booking);
        }
        else {
          var amount = Math.round(booking.charge * 97);
          var refund = stripe.refunds.create({
            charge: charge_id,
            amount: amount
          }, function (err, refund) {
            if (err) {
              return res.status(500).json(err.message);
            }
            else {
              //stats
              statsController.addStat(booking.booking_date, booking.business_id, 'attendees', -1 * booking.count);
              statsController.addStat(booking.booking_date, booking.business_id, 'sales', -1 * booking.charge);
              return res.status(200).json("refund successfully completed");
            }
          });
        }
      }
      else {
        return res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
      }
    }
  });

};

exports.view_event_bookings = function (req, res) {
  if (req.user && req.user instanceof Business) {
    var event_id = req.params.event_id;

    EventOccurrences.findById(event_id, function (err, eventocc) {
      if (err || !eventocc)
        res.status(500).json("Oops, something went wrong, please try again with the correct information");
      else {
        Events.findById(eventocc.event, function (err, event) {

          if (err || !event)
            res.status(500).json("Oops, something went wrong, please try again with the correct information");
          else {
            //check if this event belongs to business currently viewing its bookings
            if (event.business_id == req.user.id) {
              
              Booking.find({ event_id: event_id }, function (err, bookings) {
                if (err || !bookings)
                  res.status(500).json("Oops, something went wrong, please try again with the correct information");
                else
                  res.status(200).json(bookings);

              });

            }
            else {
              res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
            }
          }
        });
      }
    });

  }
  else {
    res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
  }
};


//======================= < USER > ==============================


//Registered User adds bookings by giving count, event id. Booking date is saved as current date.
exports.regUserAddBooking = function (req, res, next) {

  if (req.user) {
    if (req.user instanceof RegisteredUser) {


      if (req.body.count <= 0)
        return res.status(500).json("Please enter valid count.");

      var date = new Date();
      var booking = new Booking(
        {
          count: req.body.count,
          booker: req.user.id,
          event_id: req.body.event,
          business_id: req.body.business_id,
          booker_name: req.user.name,
          booking_date: date,
          charge: req.body.charge,
          stripe_charge: req.body.stripe_charge
        });

      booking.save(function (err, booking) {
        if (!err) {
          //decreases capacity of event occurence and stores booking in event occurence's list of bookings
          EventOccurrences.findOne({ _id: req.body.event }, function (err, eve) {
            if (err || !eve) {
              res.status(500).json("Error adding booking. Please try again!");
              return;
            }
            else {
              eve.available = eve.available - req.body.count;
              if (eve.available < 0) {
                booking.remove();
                res.status(500).json("Not enough spaces - please decrease count of booking.");
                return;
              }
              else {
                eve.bookings.push(booking);
                eve.save();
              }

              //finds registered user and adds this event to his/her list of bookings
              RegisteredUser.findOne({ _id: req.user.id }, function (err, user) {
                if (err || !user) {
                  booking.remove();
                  res.status(500).json("Error saving booking. Please try again.");
                  return;
                }
                else {
                  user.bookings.push(booking);
                  user.save();

                  var now = new Date();
                  now.setHours(0, 0, 0, 0);

                   //add stats records to count number of attendees and amount of money
                   statsController.addStat(now, req.body.business_id, 'attendees', req.body.count);
                   statsController.addStat(now, req.body.business_id, 'sales', req.body.charge);

                   res.status(200).json(booking);
                  return;
                }

              });
            }
          });
        }
        else {
          return res.status(500).json("Oops!! Something went wrong, please try again.");
        }
      });

    }

  }

  else {
    res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
    return;
  }


};


//Registered user views booking using his/her id
exports.regUserViewBookings = function (req, res, next) {

  if (req.user) {
    if (req.user instanceof RegisteredUser) {
      RegisteredUser.findOne({ _id: req.user.id }).populate('bookings').exec(function (err, bookings) {
        if (err || !bookings) {
           return res.status(500).json("Error finding bookings or possibly no bookings");
        }
        else {
          return res.status(200).json(bookings.bookings);
        }
      });
    }
    else {
      return res.status(401).json("You are not a registered user.");
    }
  }
  else {
   return res.status(401).json("Please log in to view upcoming bookings.");
  }

};







//Registered User deletes bookings
exports.regUserDeleteBookings = function (req, res, next) {

  if (req.user) {
    if (req.user instanceof RegisteredUser) {
      Booking.findById(req.body.bookingD, function (err, booking) {
        if (err || !booking) {
          return res.status(500).json("Error deleting booking. Please recheck information and try again.");
         
        }
        else {
          if (booking.booker == req.user.id) {
            RegisteredUser.findByIdAndUpdate(req.user.id, { "$pull": { bookings: req.body.bookingD } }, function (err, user) {
              if (err || !user) return res.status(500).json("Error");
            });
            EventOccurrences.findByIdAndUpdate(booking.event_id, { "$pull": { bookings: req.body.bookingD } }, function (err, eve) {
              if (err || !eve) return res.status(500).json("Error.");
              eve.available = eve.available + booking.count;
              eve.save();
              booking.remove(function (err) {
                if (err) return res.status(500).json(err.message);
                else {
                  var charge_id = booking.stripe_charge;
                  if (!charge_id || charge_id === undefined) {
                    return res.status(200).json(booking);
                  }
                  else {
                    var amount = Math.round(booking.charge * 97);
                    var refund = stripe.refunds.create({
                      charge: charge_id,
                      amount: amount
                    }, function (err, refund) {
                      if (err) {
                        res.status(500).json(err.message);
                      }
                      else {
                        statsController.addStat(booking.booking_date, booking.business_id, 'attendees', -1 * booking.count);
                        statsController.addStat(booking.booking_date, booking.business_id, 'sales', -1 * booking.charge);
                        res.status(200).json("refund successfully completed");
                      }
                    });
                  }
                }

              });
            });

          }
          else {
            res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
            return;
          }
        }

      });
    }
    else {
      res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
    }

  }
  else {
    res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");

}
}

