

var express  = require('express');
var app      = express();
var path 	 = require('path');
var router   = express.Router();

var booking    = require('../controllers/bookings.controller');
var payment    = require('../controllers/payment.controller');


    //below belongs to business
    router.get('/', function(req, res){
        if(req.user && req.user.user_type == 2)
             res.render(path.resolve('app/views/test2.ejs'));
         else
         {
            res.send("You Are Not Authorized To Access This Page!");
         }
    });

    /**
     * Books a certain event to the signed in user.
     * req.body.count: number of people in booking
     */

    router.post('/book_event', booking.book_event);

    /**
     * Cancel booking of the signed in user.
     * req.body.booking_id is the ID of booking to cancelled 
     * req.body.event_id is the id of the even 
     * 
     */
    router.post('/cancel_booking',booking.cancel_booking);

    /**
     * Returns all bookings of a given event 
     */

    router.get('/view_event_bookings/:event_id',booking.view_event_bookings);

    /**
     * Deletes bookings of an event, event occurence of facility after they have been deleted 
     */
    router.post('/cancel_booking_after_delete', booking.cancel_booking_after_delete);

    


    router.get('/regusers', function(req, res){
        res.sendFile(path.resolve('app/views/regusersbookingtest.html'));
    });

    /**
     * Create a charge in Stripe with a given amount using Stripe token 
     */
    router.post('/charge', payment.pay);

    /**
     * Refund a charge in Stripe
     */
    router.post('/refund', payment.refund);



    /**
     * Return booking object given its ID 
     */
    router.post('/get_booking', booking.getBooking);

    
    
    /**
     * Registered user books an event given and event ID,
     * returns the booking object
     *
     */

    router.post('/createRegUserBookings', booking.regUserAddBooking);



    /**
     * Returns all bookings made by a user given the user's ID 
     */
    router.post('/viewRegUserBookings', booking.regUserViewBookings);

    /**
     * Delete a certain booking of a certain user 
     */
    router.post('/deleteRegUserBookings', booking.regUserDeleteBookings);


module.exports = router;
