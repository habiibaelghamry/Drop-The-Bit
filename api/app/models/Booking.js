var mongoose = require('mongoose'),
     Schema   = mongoose.Schema;
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;
require('mongoose-double')(mongoose);

var BookingSchema = new Schema({
    booking_date : Date,
    count        : {type: Number, default: 1}, // how many people
    booker       : {type: mongoose.Schema.Types.ObjectId, ref: 'RegisteredUser'},
    booker_name  : String,
    event_id     : {type: mongoose.Schema.Types.ObjectId, ref:'EventOccurrences'},
    business_id  : {type: mongoose.Schema.Types.ObjectId, ref:'Businesses'},
    charge       : SchemaTypes.Double,		//amount
    stripe_charge: String					//token for refund
});
var Booking = mongoose.model('Booking', BookingSchema);
module.exports = Booking;








