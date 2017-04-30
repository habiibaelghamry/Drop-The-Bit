var express  = require('express');
var webAdmin  = require('../controllers/web_admin.controller');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: 'public/uploads/'});
	//router.get('/', function(req, res){
    //    res.render('test');
    //});


    /**
     * View business that requested to be deleted from website 
     */
     router.get('/viewRequestedDelete', webAdmin.webAdminViewRequestedDelete);

     /**
      * Delete business object from database and all its related events, facilities and even occurrences
      */
     router.get('/deleteBusiness/:id', webAdmin.WebAdminDeleteBusiness);
     
     /**
      * Add business object in database initialized with information in req.body
      */
     router.post('/add_business', webAdmin.AddBusiness);

     /**
      * Add advertisment to be posted on the website homepage
      */
     router.post('/createAdvertisement', upload.single('image'), webAdmin.addAdvertisement);

     /**
      * Delete advertisment given its ID 
      */
     router.get('/deleteAdvertisement/:id', webAdmin.deleteAdvertisement);
     
     router.post('/updateAdvertisements', webAdmin.updateAdvertisements);
     /**
      * Return an array of all advertisements 
      */
	   router.get('/viewAdvertisements', webAdmin.viewAllAdvertisements);

       /**
        * View advertisements that have not expired yet 
        */
     router.get('/viewAvailableAdvertisements', webAdmin.viewAvailableAdvertisements);






module.exports = router;
