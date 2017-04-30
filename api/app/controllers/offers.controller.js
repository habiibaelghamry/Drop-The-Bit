var mongoose = require('mongoose');
var Business = mongoose.model('Business');
var Offer = mongoose.model('Offer');
var User  = require('mongoose').model('RegisteredUser');
var async = require("async");



/* this function views all the offers created by a business by finding the offers
 having the same id as the id of the business passed to the function.
 if the user is a business, he will be sent to his offer's page where he
 can update/delete the offers */
exports.viewOffers = function(req, res) {
 if(typeof req.params.id != "undefined") {
    var id = req.params.id;
   Business.findOne({_id:id}, function(err, business)
   {
      if(err || !business)
        return res.status(500).json("error in finding the business to view the offers");
      else
      {
        Offer.find({business:id}, function(err, offers)
         {
            if(err)
              res.status(500).json("error in viewOffers");
            else
              res.status(200).json(offers);
         });
      }
    });
  }
}

exports.viewOffersByName = function(req, res) {
  if(typeof req.params.name != "undefined") {
    var name = req.params.name;

    Business.findOne({name:name}, function(err, business) {
      if(err || !business) return res.status(500).json("error in finding the business to view the offers");
      else {
        Offer.find({business:business._id}, function(err, offers) {
          if(err) res.status(500).json("error in viewOffersByName");
          else res.status(200).json({offers:offers});
        })
      }
    })
  }
}

exports.offerDetails = function(req, res) {
  if(typeof req.params.id != "undefined") {
    var id = req.params.id;

    Offer.findOne({_id:id}, function(err, offer) {
      if(err || !offer) return res.status(500).json("error in finding the offer");
      else {
        res.status(200).json({offer:offer});
      }
    })
  }
}

exports.businessViewOffers = function(){
 if(req.user && req.user instanceof Business)
   {
      var id = req.user.id;
      Offer.find({business:id}, function(err, offers) {
        if(err) {
          res.status(500).json("error in finding all offers");
        } else {
            res.status(200).json({offers:offers, id:req.user.id});
        }
    })
  }
  else {
    res.status(401).json("YOU ARE NOT AUTHORIZED");
}
}

exports.getCreateOffer = function(req, res){
  if(req.user && req.user instanceof Business)
   {
      var id = req.user.id;
      Offer.find({business:id}, function(err, offers) {
        if(err) {
          res.status(500).json("error in finding all offers");
        } else {
            res.status(200).json(offers);
        }
    });
  }
  else {
    res.status(401).json("YOU ARE NOT AUTHORIZED");
  }
}

/*this function is used by business to create an offer where he must enter
the name, type, value, details and expiration date.
if the business added an expiration_date that is before the start_date(which if
 he did not enter it will be by default the current date when he created the offer)
 he will be notified that he entered a wrong expiration_date */

exports.createOffer = function(req, res) {

  if(req.user && req.user instanceof Business)
  {
    var businessId = req.user.id;  //get _id from session
    var body = req.body;
    var file = req.file;
    // expiration date not required in case of count dependent offer
    if(!body.name || !body.type || !body.value || !body.details )
    {
      res.send("please add all information");
    }
    else
    {
      var newOffer = new Offer({
        name:body.name,
        type:body.type,
        value:body.value,
        details:body.details

      });
      newOffer.business = businessId;

      if(req.body.facility_id)
      {
            newOffer.facility_id = req.body.facility_id;
      }

      if(req.body.lucky_first)
      {
         newOffer.lucky_first = req.body.lucky_first;
      }

       if(req.body.min_count)
      {
        newOffer.min_count = req.body.min_count;
      }

      if(req.body.event_id)
      {
        newOffer.event_id = req.body.event_id;
      }

      if(typeof file != 'undefined') {
        newOffer.image = file.filename;
      }

      var now = new Date();

       if( (!body.expiration_date  || !body.start_date) && body.type === "duration")
      {
        return res.status(400).json("Please add a valid start/end date. [1]");
      }
      if(body.type === "duration") //checking undefined was not working even though it was undefined
      {
        var expirationdate = body.expiration_date;
        if(new Date(body.start_date).getTime() >= new Date(expirationdate).getTime() || new Date(body.start_date).getTime() < new Date(now).getTime())
        {
          return res.status(400).json("Please add a valid start/end date.[2]");
        }
        else
        {
           newOffer.expirationdate = expirationdate;
           newOffer.startdate = body.start_date;
        }
      
      } 
        newOffer.save(function(err, offer) 
        {
          if(err) {
            res.status(500).json("error in creating offer "+ err);
          } else 
          {   
               var notification = {content:req.user.name + " added " + req.body.name, date:new Date()}; 
                  async.each(req.user.subscribers, function(subscriber, callback){
                    User.findByIdAndUpdate({_id:subscriber},{$push:{"notifications": notification}},function(err,user)
                    {
                      if(err)
                        res.status(500).json('Oops..something went wrong.'); 
                      else
                      {
                        user.unread_notifications = user.unread_notifications + 1;
                        user.save();
                      }
                    });
                  });
            res.status(200).json(offer);
          }
        });

    } //
  } else //
  {
    res.status(401).json("you're not a logged in business");
  }
};

/* this function is used by the business to update the offers either by
changing its name, type, value, details, start date, expiration_date, image
or the notify_subscribers flag.
if the updated expiration date is before the start date then an error will be
displayed.
At the beginning before updating anything, we check if such offer belongs to
the following business or not */
exports.updateOffer = function(req, res) {

  if(req.user && req.user instanceof Business ) {
    var body = req.body;
    var businessId = req.user.id;
    var id = req.body.id;
    var file = req.file;
    Offer.findOne({_id:id}, function(err, offer) {
      if(err) res.status(500).json("error in finding the offer");
      else
      {
        if(!offer) res.status(500).json("offer does not exist");
        else
        {
          if(offer.business == businessId)
          {
            if(typeof body.name != 'undefined' && body.name.length != 0) offer.name = body.name;
            if(typeof body.type != 'undefined' && body.type.length != 0) offer.type = body.type;
            if(typeof body.value != 'undefined' && body.value.length != 0) if(body.value >= 0.01) offer.value = body.value; else res.status(500).json("Enter a value greater than 0.01");
            if(typeof body.details != 'undefined' && body.details.length != 0) offer.details = body.details;
            if(typeof file != 'undefined') { offer.image = file.filename; }

            var startdate = offer.start_date;
            var expirationdate = offer.expiration_date;
            var flag1 = false;
            var flag2 = false;
            var now = new Date();
            if(typeof body.start_date != 'undefined' && body.start_date.length != 0)
            {
               startdate = new Date(body.start_date);
               flag1 = true;
            }

            if(typeof body.expiration_date != "undefined" && body.expiration_date.length != 0)
            {
              expirationdate = new Date(body.expiration_date);
              flag2 = true;
            }
            var error = "";
            if(startdate - expirationdate >= 0 || (flag1 && now - startdate > 0) || (flag2 && now - expirationdate > 0)) error = "please add a valid start_date/ expiration_date";
            else
            {
              if(flag1 == true) offer.start_date = startdate;
              if(flag2 == true) offer.expiration_date = expirationdate;
            }
            if(typeof body.notify_subscribers != 'undefined' && body.notify_subscribers.length != 0)
              offer.notify_subscribers = Number(body.notify_subscribers);

              if(typeof file != 'undefined') offer.file = file.filename;

              offer.save(function(err, updatedoffer) {
                if(err) res.status(500).json("error saving offer");
                else res.status(200).json(updatedoffer);
              })

          } else res.status(403).json("you must update only your offers");
        }
      }
    });
  } 

  else res.status(401).json("NOT AUTHORIZED");
};



/* a business can delete an offer.*/
exports.deleteOffer = function(req, res) {
   if(req.user && req.user instanceof Business && typeof req.params.id != "undefined") {
    var id = req.params.id;
    var businessId = req.user.id;
    var d = new Date();
    Offer.findOne({_id:id}, function(err, offer) {
      if(err)
      {
        res.status(500).json("error in finding the offer");
      }
      else
      {
        if(offer && offer.business.equals(businessId)) {
          Offer.remove({_id:id}, function(err)
          {
            if(err)
              res.res.status(500).json("cannot delete offer");
            else
            {
              Offer.find({business:businessId},function(err, myoffers) {
                if(err)
                  res.res.status(500).json("cannot get my offers");
                 else
                {
                  if(myoffers) res.status(200).json("done");
                }
              });
            }
          })
        } else {
          if(!offer) res.status(500).json("Oops, something went wrong, please try again with the correct information.");
          else res.status(403).json("YOU ARE NOT AUTHORIZED TO ACCESS THID PAGE");
        }
      }
    })
  } else {
    res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THID PAGE");
   }
};
