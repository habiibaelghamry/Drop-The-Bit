var passport = require('passport'),
    async    = require('async'),
    crypto   = require('crypto'),
    User = require('../models/RegisteredUser'),
    Business   = require('../models/Business'),
    nodemailer = require("nodemailer"),
    configAuth = require('../../config/auth'),
    IP = require('../../config/address')
    xoauth2 = require('xoauth2');


let AuthController =
{
	// ============================
	// 			   HOME PAGE
	// ============================
	home: function(req, res) {
		res.render('index.ejs');
	},

	// ============================
	// 		    	LOGIN
	// ============================
	getLoginFail: function(req, res) {
		res.json(req.flash('loginMessage'));
	},


  getLoginSuccess: function(req, res) {
    res.status(200).json("success");
  },

	postLogin: function(req, res){
    passport.authenticate('local-login', {
		successRedirect : '/auth/successLogIn',
		failureRedirect : '/auth/failLogIn',

		failureFlash : true
	})(req, res);},

	// ============================
	//           SIGNUP
	// ============================
	getSignupFail: function(req, res) {
		res.json(req.flash('signupMessage'));
	},


  getSignupSuccess: function(req, res) {
		res.json("success");
	},


	postSignup: function(req, res){

    passport.authenticate('local-signup', {
		successRedirect : '/auth/successSignUp',
		failureRedirect : '/auth/failSignUp',

		failureFlash : true
	})(req, res);},




	// ============================
	// 	    PROFILE SECTION
	// ============================
	getProfile: function(req, res){
		if (req.isAuthenticated())
		{
			if(req.user.user_type == 1)       // regular user
			{
        res.redirect('/');
        // res.render('user_profile.ejs', {
        // user : req.user, bookings: req.user.bookings, subscriptions: req.user.subscriptions });
			}
			else if(req.user.user_type == 2)  // business
			{
        res.render('business_profile.ejs', {
          user : req.user });
			}
			else if(req.user.user_type == 3)  // admin
			{
				res.render('admin_profile.ejs', {
				user : req.user});
			}
		}
		else
    {
			res.redirect('/');
    }
	},

	// =====================================
	// 				     LOGOUT
	// =====================================
	logout: function(req, res) {

		req.session.destroy(function (err) {
      if(err) return res.status(500).json("error");

      req.logout();
      res.json("successful");

  });
	},
	// =====================================
	// 			     	FACEBOOK
	// =====================================
	facebookLogin   : function(req, res){
		passport.authenticate('facebook', { scope : 'email' })(req, res);},


	facebookCallback: function(req, res,next){
    passport.authenticate('facebook', function(err, user, info) {
          if (err) { return next(err); }
          if (!user) { return res.json("Error! Please go back to http://"+ IP + ":8000 to try and sign in again."); }
          req.logIn(user, function(err) {
            if (err) { return next(err); }
            req.session.save(function(){
              res.redirect("http://"+ IP + ":8000/");
           });
          });
        })(req, res);


		},






	// =====================================
	// 			      	GOOGLE
	// =====================================
	googleLogin : function(req, res){
		passport.authenticate('google', { scope : ['profile', 'email'] })(req, res);
	},

  googleCallback: function(req, res){
    passport.authenticate('google', function(err, user, info) {
          if (err) { return next(err); }
          if (!user) { return res.json("error"); }
          req.logIn(user, function(err) {
            if (err) { return next(err); }
            req.session.save(function(){
             return res.redirect("http://"+ IP + ":8000/");
           });
          });
        })(req, res);


		},


	// =====================================
	// 		     FORGOT PASSWORD
	// =====================================
	getForgetPassword: function(req, res){
		res.render('frogetPassword.ejs');
	},
//same email problem
	forgotPassword: function(req, res, next) {
    if(req.body.email){

  		async.waterfall([
      // generate random token of length 20, to uniquely identify each request of reseting password
    	function(done) {
      	crypto.randomBytes(20, function(err, buf) {
        	var token = buf.toString('hex');
        	done(err, token);
    	  });
   		},
      // validate the entered email belongs to some actual user saved in the database
      // first, search the business collection
    	function(token, done) {
        var check = 0;
        Business.findOne({ email: req.body.email }, function(err, business){
              if(err)
              {
                  return res.json("Sorry for inconvenience, your trial to reset the password has been denied");
              }
              if(!business)
              {
                check++;
                if(check == 2)    // if no user found, print error msg and redirect
                {
                return res.json("No account with that email address exists.");
                }
              }
              // if found, set the values of resetPasswordToken to the token generated
              else
               {
                 business.local.resetPasswordToken = token;
                 business.local.resetPasswordExpires = Date.now() + 3600000;    // expires after one hour
                 business.save(function(err){

                 done(err, token, business);
              });
            }
        });
        // then search the registeredusers collection
      		User.findOne({ email: req.body.email }, function(err, user) {
            if(err)
              {
                  return res.json("Sorry for inconvenience, your trial to reset the password has been denied");
              }
        	if (!user) {
            check++;
            if(check == 2)       // if no user found, print error msg and redirect
            {
              return res.json("No account with that email address exists.");
            }

        	}
          // if found, set the values of resetPasswordToken to the token generated
          else
          {
        	   user.local.resetPasswordToken = token;
        	   user.local.resetPasswordExpires = Date.now() + 3600000;   // expires after one hour
        	   user.save(function(err) {
        		  if(err)
              {
                  return res.json("Sorry for inconvenience, your trial to reset the password has been denied");
              }
          	done(err, token, user);
        	});
          }
      	});
    	},

      // the next function actually sends the email with the reset url
    	function(token, user, done) {
        // first login via our Gmail account, (this might be modified to use XOAuth2 later)
        var smtpTransport = nodemailer.createTransport({
        service:'Gmail',
        auth:
        {
            user: configAuth.gmail.user,
       		  pass: configAuth.gmail.pass
        }
      });
        // set the values of sender, receiver, subject and body of the mail
        var mailOptions = {
        	to: user.email,
        	from: 'fasa7ny.team@gmail.com',
        	subject: 'Fasa7ny Password Reset',
        	text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          	'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          	'http://' + IP+ ':8000/#!/auth/reset/' + token + '\n\n' +                                    //url containing the token generated
          	'If you did not request this, please ignore this email and your password will remain unchanged.\n'
     		};
     	  // send the email using nodeMailer, and previously specified options
      	smtpTransport.sendMail(mailOptions, function(err) {
      			if(err)
            {
              return res.json("ERROR: can not send email to the entered email, please try again");
            }
        	return res.json("An e-mail has been sent to " + user.email + " with further instructions.");
       		done(err, 'done');
      	});
    	}
  		], function(err) {
    	if (err) return next(err);
    	return res.redirect('http://'+ IP + ':8000');
  	  });
	}
},

	getReset: function(req, res) {
        var check = 0;


        // search the registeredusers collection
   User.findOne({ "local.resetPasswordToken": req.params.token,"local.resetPasswordExpires": { $gt: Date.now() } }, function(err, user) {
     if (!user) {
      check++;
      if(check == 2)      // if no user found, print error msg and redirect
      {
      return res.json('Password reset token is invalid or has expired.');
      }
      }
      else
      {
      return  res.json({
        user: req.user,
        token: req.params.token
      });
    }
      });

        // check the validity of the token sent in the url
        // first search the business collection
        Business.findOne({ "local.resetPasswordToken": req.params.token, "local.resetPasswordExpires": { $gt: Date.now() } }, function(err, business){
        if(!business)
        {
          check++;
          if(check == 2)      // if no user found, print error msg and redirect
          {

          return res.json( 'Password reset token is invalid or has expired.');

          }
        }
        else
        {
          res.render('reset', {
          user: req.user,
          token: req.params.token
          });
        }
      });

	},

	postReset: function(req, res) {
  async.waterfall([
    // recheck the validity of the token sent (it might be expired)

    function(done) {
      var check = 0;
          Business.findOne({ "local.resetPasswordToken": req.params.token, "local.resetPasswordExpires": { $gt: Date.now() } }, function(err, business){
            if(!business)
            {
              check++;
              if(check == 2)
              {
              return res.json('Password reset token is invalid or has expired.');
              }
            }
            // save the new password, and reset token related attributes
            else
            {
               business.local.password = business.generateHash(req.body.password);
              business.local.resetPasswordToken = undefined;
              business.local.resetPasswordExpires = undefined;
              business.save(function(err, business){
                 if(err)
                 {
                  return res.json("error: can not update the password, please try again");
                 }
                 done(err, business);

              });
            }
          });
      User.findOne({ "local.resetPasswordToken": req.params.token, "local.resetPasswordExpires": { $gt: Date.now() } }, function(err, user) {
        if (!user) {

          check++;
              if(check == 2)
              {
              return res.json('Password reset token is invalid or has expired.');
              }
        }
        // save the new password, and reset token related attributes
        else
        {
        user.local.password = user.generateHash(req.body.password);
        user.local.resetPasswordToken = undefined;
        user.local.resetPasswordExpires = undefined;
        user.save(function(err,user) {
            if(err)
            {
             return res.json("error: can not update the password, please try again");
            }
            done(err, user);
        });
      }
      });
    },
   // send confirmation mail
    function(user, done) {
        var smtpTransport = nodemailer.createTransport({
        service:'Gmail',
        auth:
        {
            user: configAuth.gmail.user,
            pass: configAuth.gmail.pass
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if(err)
        {
          return res.redirect("ERROR: can not send email to the entered email, please try again");
        }
        return res.json('Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('http://'+ IP + ':8000/');
  });
},

getStripePK: function(req, res)
{
  return res.status(200).json(configAuth.stripe.publicKey);
}


}

module.exports = AuthController;
