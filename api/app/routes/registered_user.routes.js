var express  = require('express');
var app      = express();
var path 	 = require('path');
var router   = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });
var userController = require('../controllers/registered_user.controller.js');


var user   = require('../controllers/registered_user.controller');

router.use('/edit', function(req, res) {
  res.render('userEditInfo.ejs', {user:req.user});
});

/**
 * Return user objcect given its ID 
 */
router.get('/u/:id', userController.getUserDetails);

/**
 * Return booking object and the event, event occurrence and business objects related to it 
 */
router.get('/bookings/:booking', userController.getBookingDetails);

/**
 * Get businesses to which the logged in user is subscribed
 */
router.get('/subs/:business_id', userController.getSubscribedBusiness);

/**
 * Add rating of currently signed in user to the business 
 */
router.get('/rate/:rate/:bid', user.addRating);

/**
 * Subscribe currently signed in user to business 
 */
router.get('/subscribe/:id',user.subscribe);

/**
 * Unsubscribe currently signed in user from business 
 */
router.get('/unsubscribe/:id',user.unsubscribe);

/**
 * Edit information of currently signed in user, using the information in req.body 
 */
router.post('/editInfo/:userID', upload.single('img'), user.editInformation);

/**
 * Set the number of the unread notification by user to be 0 
 */
router.get('/resetUnread', user.resetUnread);

module.exports = router;
