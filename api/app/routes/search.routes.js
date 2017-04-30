var express = require('express');
var router = express.Router(); 
var searchController = require('../controllers/search.controller'); 

/**
 * Get all businesses whose public value = 1 
 */
router.get('/', searchController.showAll); 

module.exports = router; 

