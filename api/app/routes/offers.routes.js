var express = require('express');
var multer = require('multer');
var router = express.Router();
var OffersController = require('../controllers/offers.controller');
var upload = multer({ dest: 'public/uploads/' });

//Offer routes

router.get("/update_offer", function(req, res) {
  if(req.user && typeof req.query.id != "undefined") {
    var id = req.query.id;
    res.render("updateoffer.ejs", {id:id, user:req.user})
  } else res.send("you're not authorized to view this page");
});
/**
 * View all offers of a give business 
 */
router.get('/viewOffers/:id', OffersController.viewOffers);

/** 
 * Get all offers created by business currently logged in 
 * 
 */
router.get('/createOffer', OffersController.getCreateOffer);

/**
 * Create offer object in the database, initialized with values from req.body
 */
router.post('/createOffer', upload.single('img'), OffersController.createOffer);

/**
 * Update an offer object in the database, using the new information from req.body
 */
router.post('/updateOffer', upload.single('img'), OffersController.updateOffer);

/**
 * Delete offer object from the database give its ID 
 */
router.get('/deleteOffer/:id', OffersController.deleteOffer);
router.get('/viewOffersByName/:name', OffersController.viewOffersByName); //used for breakOut bot

router.get('/offerDetails/:id', OffersController.offerDetails); //used fot breakOut bot

module.exports = router;
