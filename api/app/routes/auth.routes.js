
var AuthController = require('../controllers/auth.controller');
var express = require('express'),
    router = express.Router();


var app = express();

router.get('/', AuthController.home);

/**
 * Returns error message when login fails 
 * 
 * @api {get} /failLogIn Request error message when login fails
 * @apiName failLogin
 * @apiGroup Authentication 
 *
 *
 * @apiSuccess {String} Login message.
 * 
 */
router.get('/failLogIn', AuthController.getLoginFail);

/**
 * Returns success message when login succeeds 
 * 
 * @api {get} /successlogIn Request success message when login succeeds
 * @apiName  successLogin
 * @apiGroup Authentication 
 *
 *
 * @apiSuccess {String} Login message.
 * 
 */
router.get('/successLogIn', AuthController.getLoginSuccess);

/**
 * Processes a post request for a user to be logged in, 
 * redirects to /successLogIn on success of login process,
 * and /failLogIn on failed login
 * 
 * @api {post} /login Request to be authenticated to the website  
 * @apiName  login
 * @apiGroup Authentication 
 *
 *
 * 
 */
router.post('/login', AuthController.postLogin);


/**
 * Returns error message when sign up fails
 * 
 * @api {get} /failSignUp 
 * @apiName  failSignup
 * @apiGroup Authentication 
 *
 *
 * @apiSuccess {String} Signup message.
 * 
 */
router.get('/failSignUp', AuthController.getSignupFail);


/**
 * Returns success message when sign up succeeds
 * 
 * @api {get} /sucessSignUp
 * @apiName  sucessSignUp
 * @apiGroup Authentication 
 *
 *
 * @apiSuccess {String} Signup message.
 * 
 */
router.get('/successSignUp', AuthController.getSignupSuccess);

/**
 * Processes a post request for a user to be logged in, 
 * redirects to /successSingUp on success of login process,
 * and /failSignUp on failed login
 * 
 * @api {post} /signup Request from user to be registered   
 * @apiName  signup
 * @apiGroup Authentication 
 *
 * 
 */

router.post('/signup', AuthController.postSignup);




router.get('/profile', AuthController.getProfile);


/**
 * Processes a post request for a user to log out and end their session, 
 * * 
 * @api {post} /signup Request from user to logout 
 * @apiName  logout
 * @apiGroup Authentication 
 *
 *
 * 
 */
router.get('/logout', AuthController.logout);

/**
 * Login via Facebook
 */

router.get('/facebook', AuthController.facebookLogin);

/**
 * Redirect from /facebook route
 * 
 */
router.get('/facebook/callback', AuthController.facebookCallback);

router.get('/google', AuthController.googleLogin);

router.get('/google/callback', AuthController.googleCallback);


router.get('/forgot', AuthController.getForgetPassword);

/**
 *   
 * 
 * @api {post} /signup Post request with email to change password  
 * @apiName  forgot password
 * @apiGroup Authentication 
 *
 * 
 */
router.post('/forgot', AuthController.forgotPassword);

router.get('/reset/:token', AuthController.getReset);


/**
 * Change user passowrd
 * 
 * @api {post} /reset/:token Request from user to logout 
 * @apiName  logout
 * @apiParams {String} token Uniqure generated token which expires in an hour
 * @apiGroup Authentication 
 *
 * @apiSuccess {Object} res.json Success message is received
 * 
 * 
 */
router.post('/reset/:token', AuthController.postReset);
    
router.get('/getStripePK', AuthController.getStripePK);

module.exports = router;
