var WebAdmin = require('mongoose').model('WebAdmin');
var Business = require('mongoose').model('Business');
var generator = require('generate-password');
var Events = require('mongoose').model('Events');
var EventOcc = require('mongoose').model('EventOccurrences');
var Facility = require('mongoose').model('Facility');
var Offer = require('mongoose').model('Offer');
var User = require('mongoose').model('RegisteredUser');
var Review = require('mongoose').model('Review');
var Reply = require('mongoose').model('Reply');
var async = require('async');
var Advertisement = require('mongoose').model('Advertisement');

const nodemailer = require('nodemailer');
var configAuth = require('../../config/auth');


exports.AddBusiness = function (req, res) {

  if(req.user && req.user instanceof WebAdmin){
    if(!req.body.email || !req.body.merchant_ID || !req.body.name || !req.body.username || !req.body.category)
    {
      return res.status(200).json("Please fill in all necessary components");
    }
    else
    {
    //test if name and merchant_ID
    Business.find({
        $or: [
            { 'local.username': req.body.username },
            { name: req.body.name },
            { merchant_ID: req.body.merchant_ID },
             {'email': req.body.email}
        ]
    }, //check if business is unique
        function (err, resultBusiness) {
            if (err) { return next(err); }

            if (resultBusiness.length == 0) {   //if yes then check user
                User.find({
                    $or: [
                        { 'local.username': req.body.username },
                        {'email': req.body.email}
                    ]
                },
                    function (err, resultUser) {
                        if (err) return res.status(500).json("something went wrong");
                        else if (resultUser.length == 0) {

                            WebAdmin.find({ $or: [
                                    { 'local.username': req.body.username },
                                    {'email': req.body.email}
                                ]},
                                    function (err, resultAdmin) {

                                    if (err)return res.status(500).json("something went wrong");
                                    else if (resultAdmin.length == 0) {
                                        var business = new Business();
                                        var generatedPassword = generator.generate({
                                            length: 10,
                                            numbers: true
                                        });
                                        business.local.password = business.generateHash(generatedPassword);
                                        business.local.username = req.body.username;
                                        business.name = req.body.name;
                                        business.merchant_ID = req.body.merchant_ID;
                                        business.category = req.body.category;
                                        business.email = req.body.email;

                                        business.save(function (err) {

                                            if (err)
                                                res.status(500).json("ERROR");
                                            else { //send confirmation email
                                                var smtpTransport = nodemailer.createTransport({
                                                    service: 'Gmail',
                                                    auth: {
                                                        user: configAuth.gmail.user,
                                                        pass: configAuth.gmail.pass
                                                    }

                                                });
                                                var mailOptions = {
                                                    to: req.body.email,
                                                    from: 'fasa7ny.team@gmail.com',
                                                    subject: 'Confirmation Mail',
                                                    text: 'Welcome to Fasa7ny' + '\n\n' + 'You have successfully joined our platform' + '\n'
                                                    + 'You can login to create your profile' + '\n\n' + 'Username: ' + req.body.username +
                                                    '\n' + 'Password: ' + generatedPassword + '\n\n' + 'http://' + req.headers.host + '\n\n' +
                                                    'Fasa7ny team'

                                                };
                                                smtpTransport.sendMail(mailOptions, function (err) {
                                                    if (err) return res.status(500).json("something went wrong");
                                                    // req.flash('info', 'An e-mail has been sent to ' + req.body.email + ' with further instructions.');

                                                });
                                                //res.render("admin_profile", { user: req.user });
                                                res.status(200).json("Business is successfully added and an email has been sent");

                                            }
                                        });
                                    } //end of web admin check
                                    else {
                                        //res.render("admin_profile", { user: req.user });
                                        res.status(500).json("There is another webAdmin with the same username");
                                    }
                                });
                        }//end of user check
                        else {
                               res.status(500).json("There is another User with the same username");
                        }
                    }
                );
            }//end of business check
            else {
                    res.status(500).json("There is another business with the same username");
            }

        });
}
}
 else {
    return res.status(401).json("Unauthorized access. Please log in.");

  }
}



//i am not sure about attribute name deleted ? ,,, and business attribute name in offer... check eno m3ndosh booking

exports.WebAdminDeleteBusiness = function (req, res) {

if(req.user && req.user instanceof WebAdmin){
    Business.findById(req.params.id, function (err, business) {
        if(err) res.status(500).json(err.message);

        //remove offers
        Offer.remove({ business: business._id }, function (err) {

           if(err) return res.status(500).json(err.message);
        });
        // remove events
        Events.remove({ business_id: business._id }, function (err) {
            if (err)
                if(err) return res.status(500).json(err.message);
        });
        // remove facilities
        Facility.remove({business_id: business._id}, function(err){
            if(err) return res.status(500).json(err.message);
        });
        // remove event occuerrences
        EventOcc.remove({business_id: business._id}, function(err){
            if(err) return res.status(500).json(err.message);
        });


        //remove business from subscribers

        async.each(business.subscribers, function(subscriber, callback){
            User.findById(subscriber, function (err, user) {
                if (err)
                        return res.status(500).json(err.message);
                else {
                    var subs = user.subscriptions;
                    var index = subs.indexOf(business._id);
                    if (index > -1) {
                        subs.splice(index, 1);
                        User.findByIdAndUpdate(subscriber, { $set: { subscriptions: subs } }, function (err, userResult) {
                            if (err)
                                return res.status(500).json(err.message);

                        });
                    }
                }
            });
        });

        Business.findByIdAndRemove(req.params.id, function (err, business) {
            if (err)
                return res.status(500).json("something went wrong");
            return res.status(200).json("Succefully deleted");
        });


    });

}
 else {
    return res.status(401).json("Unauthorized access. Please log in.");

  }

}



exports.webAdminViewRequestedDelete = function (req, res) {

if(req.user && req.user instanceof WebAdmin)
  {

    Business.find({ delete: 1 }, function (err, requests) {
      if(err) return res.status(500).json("something went wrong");
        return res.status(200).json(requests);
    });
  }
  else {
    return res.status(401).json("Unauthorized access. Please log in.");

  }

}









//<=========================================================================ADVERTISEMENT=======================================================================>


exports.addAdvertisement = function(req,res)
{


  if(req.user && req.user instanceof WebAdmin)
  {
      if(req.file){

    if(!req.file.filename || !req.body.text || !req.body.sdate || !req.body.edate)
    {
      return res.status(500).json("Please fill in all necessary components");
    }
    else
    {
    var ad = new Advertisement(
      {
        image       : req.file.filename, //should be changed to req.file.filename
        text        : req.body.text,
        start_date  : req.body.sdate,
        end_date    : req.body.edate
      }
    )

    ad.save(function(err,ad){
      if(err)
       res.status(500).json("error");
      else{

         res.status(200).json("successfully created advertisement");
}
    });
  }
              }
              else
              {
                res.status(200).json("Please fill in all necessary components");
              }
    }
  else {
    return res.status(401).json("Unauthorized access. Please log in.");
  }


}





exports.deleteAdvertisement = function(req,res)
{

    if(req.user && req.user instanceof WebAdmin)
    {
      Advertisement.findByIdAndRemove(req.params.id, function(err,ad)
      {
        if(err)
          res.status(500).json("error deleting advertisement");
        else {
          res.status(200).json("successfully deleted advertisement");
        }

      });
    }
    else {
    return res.status(401).json("Unauthorized access. Please log in.");
  }




}


exports.viewAvailableAdvertisements = function(req,res)
{

    Advertisement.find({}, function(err, ads)
    {
      if(err)
        return res.json(err);
      else
      {
        var today = new Date();
        var send = [];
        for(var i = 0; i < ads.length; i++)
        {
          if( ads[i].start_date > today || ads[i].end_date < today)
          {
            ads[i].available = 0;
            ads[i].save();
          }
          else {
            send.push(ads[i]);
          }
        }

        return res.status(200).json(send);

      }

    });


}


exports.updateAdvertisements = function(req,res)
{
  if(req.user && req.user instanceof WebAdmin)
  {
    Advertisement.findByIdAndUpdate(req.body.ad, {available:0}, function(err, ad)
    {
      if(err)
        return res.status(500).json("something went wrong");
        else {
          return res.status(200).json("success");
        }
    });
   }
  else {
    return res.status(401).json("Unauthorized access. Please log in.");
  }
}



exports.viewAllAdvertisements = function(req,res)
{
  if(req.user && req.user instanceof WebAdmin)
  {

    Advertisement.find({},function(err, ads)
    {
      if(err) return res.status(500).json("something went wrong");
      res.status(200).json(ads);
    });
  }
  else {
    return res.status(401).json("Unauthorized access. Please log in.");
  }

}