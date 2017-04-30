var express = require('express');
var router = express.Router();
var ReviewController = require('../controllers/review.controller');

// review routes
/**
 * Post review by the currently signed in user, about the business in req.body
 */
router.post('/writeReview', ReviewController.writeReview);

/**
 * Currently signed in user upvotes a certain review about business 
 * Reeattempting upvote caused it to be undone 
 */
router.post('/upvoteReview', ReviewController.upvoteReview); 


/**
 * Currently signed in user downvotes a certain review about business 
 * Reeattempting downvote caused it to be undone 
 */
router.post('/downvoteReview', ReviewController.downvoteReview); 
/**
 * Post reply by currently signed in user to a review
 */
router.post('/replyReview', ReviewController.replyReview);

/**
 * Delete review object from database, ID is sent in req.body
 */
router.post('/deleteReview', ReviewController.deleteReview);
/**
 * Delete reply object from database, ID is sent in req.body
 */
router.post('/deleteReply', ReviewController.deleteReply);
module.exports = router;
