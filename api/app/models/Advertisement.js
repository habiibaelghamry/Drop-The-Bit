var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;



var AdvertisementSchema = new Schema({
    image       : String,
    text        : String,
    start_date  : Date,
    end_date    : Date,
    available   : {type: Number, default: 1}
    //payment goes here

});

var Advertisement = mongoose.model('Advertisement', AdvertisementSchema);
module.exports = Advertisement;
