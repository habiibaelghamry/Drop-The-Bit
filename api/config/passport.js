var LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    User = require('../app/models/RegisteredUser'),
    Business = require('../app/models/Business'),
    Admin = require('../app/models/WebAdmin'),
    configAuth = require('./auth');

// using async waterfall ?

module.exports = function(passport)
{
   //  ========================
   //      Session setup
   //  ========================
   //  serialize and deserialize user, needed for session

   passport.serializeUser(function(user, done) {
        done(null, user.id);
   });

   passport.deserializeUser(function(id, done) {
         User.findById(id,'-local.password', function(err, user) {
            if(!user)
            {
              Business.findById(id, '-local.password',function(err, user){
                if(!user)
                {
                    Admin.findById(id, '-local.password',function(err, user){
                    done(err, user);
                  });
                }
                else done(err, user);
              });
            }
            else done(err, user);
          });
   });


    //   ========================
    //         LOCAL SIGNUP
    //   ========================


    passport.use('local-signup', new LocalStrategy(
      {
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
      },
      function(req, username, password, done)
      {
          var NaP = 0;
          if(req.body.phone)
          {
            if(req.body.phone.length < 11)
              NaP = 1;
            else {
                for(var i = 0; i < req.body.phone.length; i++)
                {
                  if(isNaN(req.body.phone[i]))
                    NaP = 1;
                    break;

                }
              }


          }

          var today = new Date();

          if(!req.body.name || !req.body.birthdate || !req.body.username || !req.body.password || !req.body.email || !req.body.phone || req.body.birthdate > today
            ||req.body.password.length < 8 || NaP)
            return done(null, false, req.flash('signupMessage',  'Please enter all the required information in a vaild form.'));
          var check = 0;
          // check weather the username entered is unique
          // search the registered users collection
          User.findOne({ $or: [{'local.username' :  username}, {'email': req.body.email} ]}, function(err, user)
          {
              if (err)
                return done(err);
              if (user)
              {
                return done(null, false, req.flash('signupMessage', 'The username or email provided is already taken.'));
              }
              else
              {
                check++;
                //if this is the third(last) check and no user found
                if(check == 3)
                {
                    // username and email entered is unique
                      var newUser          = new User();
                      newUser.local.username = username;
                      newUser.local.password = newUser.generateHash(password);
                      newUser.name           = req.body.name;
                      newUser.email          = req.body.email;
                      newUser.phone          = req.body.phone;
                      if (req.body.birthdate && req.body.birthdate !== 'null')
                      {
                        newUser.birthdate      = req.body.birthdate;
                      }
                      newUser.address        = req.body.address;
                      newUser.gender         = req.body.gender;
                      // save the user
                      newUser.save(function(err) {
                        if (err)
                          throw err;
                        return done(null, newUser);
                      });
                  }
               }
          });
          //repeate the same check on business usernames
            Business.findOne({ $or: [{'local.username' :  username}, {'email': req.body.email} ]}, function(err, user)
            {
              if(err)
                return done(err);
              if(user){
                return done(null, false, req.flash('signupMessage', 'The username or email provided is already taken.'));
              }
              else
              {
                  check++;
                  //if this is the third(last) check and no user found
                  if(check == 3)
                  {
                    // username entered is unique
                      var newUser            = new User();
                      newUser.local.username = username;
                      newUser.local.password = newUser.generateHash(password);
                      newUser.name           = req.body.name;
                      newUser.email          = req.body.email;
                      newUser.phone          = req.body.phone;
                      if (req.body.birthdate && req.body.birthdate !== 'null')
                      {
                        newUser.birthdate      = req.body.birthdate;
                      }
                      newUser.address        = req.body.address;
                      newUser.gender         = req.body.gender;
                      newUser.profilePic     = req.body.profilePic;
                      // save the user
                      newUser.save(function(err) {
                        if (err)
                          throw err;
                          return done(null, newUser);
                      });
                  }
              }
            });
            // finnally check web admins usernames
            Admin.findOne({ $or: [{'local.username' :  username}, {'email': req.body.email} ]}, function(err, user)
            {
                if(err)
                  return done(err);
                if(user)
                {
                  return done(null, false, req.flash('signupMessage', 'The username or email provided is already taken.'));
                }
                else
                {
                  check++;
                  //if this is the third(last) check and no user found
                  if(check == 3)
                  {
                    // username entered is unique

                      var newUser            = new User();
                      newUser.local.username = username;
                      newUser.local.password = newUser.generateHash(password);
                      newUser.name           = req.body.name;
                      newUser.email          = req.body.email;
                      newUser.phone          = req.body.phone;
                       if (req.body.birthdate && req.body.birthdate !== 'null')
                        {
                          newUser.birthdate      = req.body.birthdate;
                        }
                      newUser.address        = req.body.address;
                      newUser.gender         = req.body.gender;
                      newUser.profilePic     = req.body.profilePic;
                      // save the user
                      newUser.save(function(err) {
                        if (err)
                          throw err;
                          return done(null, newUser);
                      });
                  }
              }
            });
      })),

  //  ========================
  //        LOCAL LOGIN
  //  ========================

  passport.use('local-login', new LocalStrategy(
    {
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done)
    {
      if(!req.body.username || !req.body.password)
          return done(null, false, req.flash('loginMessage', 'No user found.'));
          
      var check = 0;

      // find a user whose username matches the username entered
      // search registered users collection
      User.findOne({ 'local.username' :  username }, function(err, user)
      {
         if (err)
            return done(err);
         if (!user)
         {
            check++;
            // if no user is found, and this is the third (last) check
            if(check == 3)
              return done(null, false, req.flash('loginMessage', 'No user found.'));
         }
         else if (!user.validPassword(password))
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

         // all is well, return successful(regular user)
         else return done(null, user);
      });
      // repeate the same check on business usernames
      Business.findOne({ 'local.username' :  username }, function(err, user)
      {
        if (err)
        {
          return done(err);
        }
        if(!user)
        {
          check++;
          // if no user is found, and this is the third (last) check
          if(check == 3)
            return done(null, false, req.flash('loginMessage', 'No user found.'));
        }
        else if (!user.validPassword(password))
        {
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        }
        // all is well, return successful user(Business)
        else
        {
            return done(null, user);
        }
      });
      // check if the username entered belongs to an admin
      Admin.findOne({ 'local.username' :  username }, function(err, user)
      {
        if(err)
          return done(err);
        if(!user)
        {
          check++;
           // if no user is found, and this is the third (last) check
          if(check == 3)
            return done(null, false, req.flash('loginMessage', 'No user found.'));
        }
        else if (!user.validPassword(password))
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
        // all is well, return successful user(Admin)
        else return done(null, user);
      });

    })),


// ==============================
//          FACEBOOK
// ==============================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields: ['id', 'displayName', 'photos', 'email']
    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

  // asynchronous
  process.nextTick(function()
  {

    // find the user in the database based on their facebook id
    User.findOne({ 'facebook.id' : profile.id }, function(err, user)
    {

       // if there is an error, stop everything and return that
       // ie an error connecting to the database
       if (err)
          return done(err);

        // if the user is found, then log them in
        if (user)
        {
          return done(null, user); // user found, return that user
        }
         else
         {
            // if there is no user found with that facebook id, create them
            var newUser = new User();
            newUser.facebook.id    = profile.id;
            newUser.facebook.token = token;
            newUser.name           = profile.displayName;
            newUser.facebook.email = profile.emails[0].value;
            newUser.gender         = profile.gender;
            // save our user to the database
            newUser.save(function(err)
            {
              if (err)
              {
                 return done(err);
              }
              return done(null, newUser);
            });
          }
    });
  });
 }));

// ============================
//          GOOGLE
// ============================


passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            User.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser          = new User();

                    // set all of the relevant information
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.name         = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                        {
                          
                          return done(err);
                        }
                        return done(null, newUser);
                    });
                }
            });
        });

    }));



};
