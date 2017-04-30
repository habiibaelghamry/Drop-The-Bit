var express = require('express');
var app = express();
var multer = require('multer');
var router = express.Router();
var RegularEventController = require('../controllers/event.controller.js');
var path 	 = require('path');
var upload = multer({ dest: 'public/uploads/' });


/**
 * Create a facility object in the database, initialized with the information in req.body
 */
router.post('/createFacility', upload.single('img'), RegularEventController.createFacility);

/**
 * Edit information of a certain facility given its ID 
 */
router.post('/editFacility/:facilityId', upload.single('img'), RegularEventController.editFacility);

/**
 * Delete facility from database given its ID
 */
router.get('/deleteFacility/:facilityId', RegularEventController.deleteFacility);

/**
 * Get all events that take place inside of a given facility 
 */
router.get('/getEvents/:facilityId', RegularEventController.getDailyEvents);


/**
 * Create event object in the database, initialized with data from the req.body
 */
router.post('/create', RegularEventController.createEvent);

/**
 * Edit information of a certain event given its ID, using data from req.body
 */
router.post('/edit/:id', RegularEventController.editEvent);

/**
 * Cancel event given its ID
 */
router.get('/cancel/:id', RegularEventController.cancelEvent);

/**
 * Cancel single occurence of an event given the occurrences's ID 
 */
router.get('/cancelO/:occId', RegularEventController.cancelOccurrence);

/**
 * Get all events of a given business 
 */
router.get('/view/:name', RegularEventController.getEvents);

/**
 * Get all event occurrences of a given event 
 */
router.get('/viewO/:eventId', RegularEventController.getOccurrences);

/**
 * Return event object given its ID 
 */
router.get('/getOnceEventDetails/:eventId', RegularEventController.getOnceEventDetails);


/**
 * Get all facilities 
 */
router.get('/facilities',RegularEventController.getAllFacilities);


router.get('/getEvent/:id', RegularEventController.getEvent);

/**
 * Get all once events of a given business 
 */
router.get('/getOnceEvents/:id',RegularEventController.getOnceEvents);

/**
 * Get details of an event occurence given its ID in req.body
 */
router.post('/getOccurrence', RegularEventController.getOccurrence);
/**
 * Get all occurences 
 */
router.get('/viewO',RegularEventController.getAllTimings); 

/**
 * Get  details of an event of repition type 'Once' 
 */
router.get('/getOnceEventDetails/:businessId/:eventId', RegularEventController.getOnceEventDetails);


/**
 * Delete an event image given the eventID and image name 
 */
router.get('/deleteImage/:eventId/:image', RegularEventController.deleteImage);

/**
 * Add image to an event given eventID 
 */
router.post('/addImage/:eventId', upload.single('img'), RegularEventController.addImage);

module.exports = router;
