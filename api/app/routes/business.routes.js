
var business = require('express').Router();
var businessController = require('../controllers/business.controller.js');
var path 	 = require('path');
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });

business.use('/makepagepublic', function(req, res) {
  res.render("makePagePublic.ejs", {user:req.user});
})



/**
 * Given a business name, returns business object 
 */
business.get('/b/:name', businessController.getBusiness);

/**
 * Given a business name in the post request, 
 * return business ID 
 */
business.post('/getBusinessId',businessController.getBusinessId);

/**
 * Business requests to be removed from the website, 
 * this request appears later to the web admin 
 */
business.get('/requestRemoval',businessController.requestRemoval)

/**
 * Deletes one of the business's payment methods: stripe or cash. 
 * Business must have at least one payment methods. 
 * 
 */
business.get('/deletePaymentMethod/:method', businessController.deletePaymentMethod);

/**
 * Business requests to edit its into: area, address, profile picture, addres 
 */
business.post('/editInformation', upload.single('img'), businessController.editInformation);

/**
 * Delete phone number of business, must have at leasts
 */
business.get('/deletePhone/:phone', businessController.deletePhone);

/**
 * Busines makes its page public so that it can appear in search result 
 */
business.get('/publicPage', businessController.makePagePublic);

/**
 * Business removes one of its images 
 */
business.get('/deleteImage/:image', businessController.deleteImage);
// business.post('/changeProfilePicture', upload.single('img'), businessController.changeProfilePicture);

/**
 * Returns boolean variable to indicate whether or not the business has bookings
 */
business.get('/hasBookings', businessController.hasBookings);

/**
 * Get all event occurrences of a given event 
 */
business.get('/getEventOccs/:event', businessController.getEventOccs);

/**
 * Get all event occurrences that take place in a given facility 
 */
business.get('/getFacilityOccs/:facility', businessController.getFacilityOccs);

/**
 * Return a booking object given its ID 
 */
business.get('/getBooking/:booking', businessController.getBooking);

/**
 * Given a business name in the post request, 
 * return business ID 
 */
business.post('/getBusinessId',businessController.getBusinessId);

/**
 * Change one of the business images 
 */
business.post('/changeImage', upload.single('img'), businessController.changeImage);
/**
 * Return business object given business ID
 */
business.get('/getBusinessById/:id',businessController.getBusinessById);


// business.get('/checkSession', businessController.checkSession);




module.exports = business;
