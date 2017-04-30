var stats = require('express').Router();
var StatsController = require('../controllers/stats.controller');

/**
 * Get stats divided in ranges of years betwen the start year and end year in req.body
 */
stats.post('/year', StatsController.getYearStats);


/**
 * Get stats divided in ranges of month betwen the start month and end month in req.body
 */
stats.post('/month', StatsController.getMothStats);


/**
 * Get stats divided in ranges of weeks betwen the start date and end date in req.body
 */1
stats.post('/week', StatsController.getWeekStats);

/**
 * Get all stats counted for this busines sinc its registration in the website 
 */
stats.post('/all', StatsController.getAllStats);

/**
 * Add statistics record to documet a certain event. 
 * Once call checks in every category of stats: week, month, year, if a record exists, 
 * it is update, if it doesn't, then create it 
 */
stats.post('/addStat', StatsController.addStatRoute);


module.exports = stats; 