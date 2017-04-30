var mongoose = require('mongoose'),
     Schema   = mongoose.Schema;

var SchemaTypes = mongoose.Schema.Types;

var offerSchema = new Schema({
  name        : String,
  type 			 	: String, // Duration, First N lucky bookers, Minimum count to receive offer, specific audience (specified in details of offer)
  value       : SchemaTypes.Double,
  details		 	: String,
  start_date  : { type: Date, default: new Date() },
  expiration_date	  : Date,
  notify_subscribers: Number, 
  business:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'business'
  },
  image: String,
  facility_id:{type: mongoose.Schema.Types.ObjectId, ref:'Facility'},
  event_id : {type: mongoose.Schema.Types.ObjectId, ref:'Events'},
  lucky_first : Number,
  min_count: Number

});

var Offer = mongoose.model("Offer", offerSchema);
module.exports = Offer;
