var mongoose = require('mongoose');
var Business = mongoose.model('Business');
var Review = mongoose.model('Review');
var RegisteredUser = mongoose.model('RegisteredUser');
var Reply = mongoose.model('Reply');
var WebAdmin = mongoose.model('WebAdmin');

/* a user can write a review about a certain business by creating the review
 then pushing this review to the array of reviews of the business*/
exports.writeReview = function (req, res) {

  if (req.user && req.user.user_type == 1 && typeof req.body.review != "undefined"
    && req.body.review.length > 0 && typeof req.body.businessID != "undefined") {


    var businessID = req.body.businessID;
    var id = req.user._id;

    Business.findOne({ _id: businessID }, function (err, business) {
      if (err) return res.status(500).json(err.message);
      else if (business) {
        RegisteredUser.findById(id, function (err, user) {
          if (err)
            return res.status(500).json(err.message);
          else {
            var newReview = new Review({
              review: req.body.review,
              votes: 0
            });
            newReview.business = businessID;
            newReview.user.id = user._id;
            newReview.user.name = user.name;
            newReview.user.image = user.profilePic; 
            business.reviews.push(newReview);
            business.save(function (err, updatedBusiness) {
              if (err) {
                res.status(500).json('Oops.. something went wrong.');
              } else {
                res.status(200).json(updatedBusiness);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(401).json('You are not authorized to perform this action.');
  }
}

/*A user can upvote a review about a business. Any user can upvote only once,
so when such user upvotes he will be added to the upvotes array of the review
and the upvotes will be incremented.
and also can change a downvote to upvote by removing the user from the downvotes
array and decrementing the array then add such user to the upvotes array and
the upvotes will be incremented*/
exports.upvoteReview = function (req, res) {

  //only a signed in user can upvote a review 
  if (req.user && req.user.user_type == 1 && typeof req.body.review != "undefined"
    && typeof req.body.businessID != "undefined") {
    var businessID = req.body.businessID;
    var reviewID = req.body.review._id;
    var userID = req.user._id;

    Business.findById(businessID, function (err, business) {
      var review = business.reviews.id(reviewID); //if this review  belongs to this business 
      if (review != null) {
        var upIndex = business.reviews.id(reviewID).upvotes.indexOf(userID);
        if (upIndex > -1) { //user has upvoted before

          business.reviews.id(reviewID).upvotes.splice(upIndex, 1); //undo upvote
          business.reviews.id(reviewID).votes--;

        } else { //user has downvoted before 
          var downIndex = business.reviews.id(reviewID).downvotes.indexOf(userID);
          if (downIndex > -1) { //if user has downvoted before 
            business.reviews.id(reviewID).downvotes.splice(downIndex, 1); //remove downvote
            business.reviews.id(reviewID).votes++;

          }
          business.reviews.id(reviewID).upvotes.push(userID); //add upvote
          business.reviews.id(reviewID).votes++;
        }
        business.save(function (err, updatedBusiness) {
          if (err) {
            res.status(500).json('Oops.. something went wrong.');
          } else {
            res.status(200).json(updatedBusiness);
          }
        });

      } else {
        return res.status(500).json("ERROR");
        
      }
    });
  } else {
    res.status(401).json('You are not authorized to perform this action.');
  }



}

/*A user can downvote a review about a business. Any user can downvote only once,
so when such user downvotes he will be added to the downvotes array of the
review and the downvote will be incremented.
and also can change the upvote to downvote by removing the user from the
upvotes array and decrementing the array then add such user to the downvote
array and the downvotes will be incremented*/
exports.downvoteReview = function (req, res) {

  //only a signed in user can downvote a review
  if (req.user && req.user.user_type == 1 && typeof req.body.review != "undefined"
    && typeof req.body.businessID != "undefined") {
    var businessID = req.body.businessID;
    var reviewID = req.body.review._id;
    var userID = req.user._id;

    Business.findById(businessID, function (err, business) {
      var review = business.reviews.id(reviewID);
      if (review != null) { //if review belongs to this business 
        var downIndex = business.reviews.id(reviewID).downvotes.indexOf(userID);
        if (downIndex > -1) { //if user has downvoted before 
          business.reviews.id(reviewID).downvotes.splice(downIndex, 1); //undo downvote
          business.reviews.id(reviewID).votes++;
        } else {
          var upIndex = business.reviews.id(reviewID).upvotes.indexOf(userID);
          if (upIndex > -1) { //if user has upvoted before
            business.reviews.id(reviewID).upvotes.splice(upIndex, 1); // remove upvote
            business.reviews.id(reviewID).votes--;
          }
          //add downvote
          business.reviews.id(reviewID).downvotes.push(userID);
          business.reviews.id(reviewID).votes--;
        }
        business.save(function (err, updatedBusiness) {
          if (err) {
            res.status(500).json('Oops.. something went wrong.');
          } else {
            res.status(200).json(updatedBusiness);
          }
        });
      } else {
        res.status(401).json('You are not authorized to perform this action.');
      }
    });


  } else {
    res.status(401).json('You are not authorized to perform this action.');
  }



}
/* A business or a RegisteredUser can reply to a review.
First, we must check if the user who is replying a business or a RegisteredUser
then add the reply to the replies array in the review */
exports.replyReview = function (req, res) {
  //only a signed in user or a business replying to its own reviews can reply to reviews   
  if (req.user && typeof req.body.reviewID != "undefined"
    && typeof req.body.businessID != "undefined" && typeof req.body.reply != 'undefined' && 
    ((req.user.user_type == 1) || (req.user.user_type == 2 && req.body.businessID) )
  ) {


    var businessID = req.body.businessID;
    var reviewID = req.body.reviewID;
    var userID = req.user._id;
    var reply = req.body.reply;

    Business.findById(businessID, function (err, business) {
      if (err)
        return res.status(500).json(err.message);
      else {
        if (business.reviews.id(reviewID) != null) {
          //if review belongs to this business 
          if (userID != businessID) { //if user is replying to user review
            RegisteredUser.findById(userID, function (err, user) {
              if (err)
                return res.status(500).json(err.message);
              else {
                var newReply = new Reply();
                newReply.user.id = user._id;
                newReply.user.name = user.name;
                newReply.user.image = user.profilePic; 
                newReply.authorType = 'user';
                newReply.reply = reply;
                business.reviews.id(reviewID).replies.push(newReply);
                business.save(function (err, updatedBusiness) {
                  if (err) {
                    res.status(500).json('Oops.. something went wrong');
                  }
                  else {
                    res.status(200).json(updatedBusiness);
                  }
                })
              }
            });
          } else if (req.user._id == businessID) { //if business if replying to review about itself 
            var newReply = new Reply();
            newReply.authorType = 'business';
            newReply.reply = reply;
            business.reviews.id(reviewID).replies.push(newReply);
            business.save(function (err, updatedBusiness) {
              if (err) {
                res.status(500).json('Oops.. something went wrong');

              } else {
                res.status(200).json(updatedBusiness);
              }
            });

          } else {
            res.status(401).json('You are not allowed to perform this action.');
          }
        } else {
          res.status(401).json('You are not allowed to perform this action.');
        }
      }
    })

  } else {
    res.status(401).json('You are not allowed to perform this action.');
  }
}
/**
 * A review can be deleted either by the user or business who posted it or by the web admin
 */
exports.deleteReply = function (req, res) {

  if (req.user && typeof req.body.review != "undefined"
    && typeof req.body.businessID != "undefined"
    && typeof req.body.reply != 'undefined'
    && ((req.user.user_type == 1
      && req.body.reply.authorType == 'user' &&
      req.user._id == req.body.reply.user.id)
      || (req.user.user_type == 3))
    || (req.user._id == req.body.businessID && req.body.reply.authorType == 'business')) {

    var userID = req.user._id;
    var businessID = req.body.businessID;
    var reviewID = req.body.review._id;
    var replyID = req.body.reply._id;
    Business.findById(businessID, function (err, business) {
      if (err)
      return res.status(500).json(err.message);
      
        // res.status(500).json('Oops.. something went wrong');
      //if business both the review and the reply exist within this business object
      else if (business.reviews.id(reviewID) != null && business.reviews.id(reviewID).replies.id(replyID) != null) {
        business.reviews.id(reviewID).replies.id(replyID).remove();
        business.save(function (err, updatedBusiness) {
          if (err)
          return res.status(500).json(err.message);
          else {
            return res.status(200).json(updatedBusiness);
          }
        });
      } else {   
        return res.status(500).json('Oops.. something went wrong');
      }
    });
  } else {
    return res.status(500).json('Oops.. something went wrong');
  }

}
/* A webadmin can delete a review if it is inappropriate. So first we must
if he is a webadmin because otherwise the review cannot be deleted.
When the review is deleted, all the replies must be deleted as well as the
review will be removed from the reviews array at the business */
exports.deleteReview = function (req, res) {
  if (req.user && typeof req.body.review != "undefined"
    && typeof req.body.businessID != "undefined"
    && ((req.user.user_type == 1 && req.user._id == req.body.review.user.id)
      || (req.user.user_type == 3))) {
    var userID = req.user._id;
    var reviewUser = req.body.review.user.id;
    var businessID = req.body.businessID;
    var reviewID = req.body.review._id;
    var businessID = req.body.businessID;

    Business.findById(businessID, function (err, business) {
      if (err)
        return res.status(500).json('Oops.. something went wrong'); 
      else if (business.reviews.id(reviewID) != null) { //check if review exists within given business object
        business.reviews.id(reviewID).remove();
        business.save(function (err, updatedBusiness) {
          if (err)
            return res.status(500).json(err.message);
          else
            return res.status(200).json(updatedBusiness);
        });
      } else {
        return res.status(500).json('Oops.. something went wrong');
      }

    });
  } else {
    return res.status(500).json('Oops.. something went wrong');
  }

}
