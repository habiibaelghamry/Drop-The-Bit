var mongoose = require('mongoose');
var SchemaTypes = mongoose.Schema.Types;

var EventsSchema = mongoose.Schema({
    name: String,
    description: String,
    location: String,
    price: SchemaTypes.Double,
    capacity: Number,
    image: [String],
    repeated: String,
    daysOff:[String],
    business_id:{type: mongoose.Schema.Types.ObjectId, ref:'Business'},
    facility_id:{type: mongoose.Schema.Types.ObjectId, ref:'Facility'}

});


var EventOccurrencesSchema = mongoose.Schema({
    day: Date,
    time: String,
    available: Number,
    bookings : [{type: mongoose.Schema.Types.ObjectId,ref: 'Booking',default: [] }],
    event : {type: mongoose.Schema.Types.ObjectId, ref:'Events'},
    facility_id  :{type: mongoose.Schema.Types.ObjectId, ref:'Facility'},
    business_id:{type: mongoose.Schema.Types.ObjectId, ref:'Business'}


});

//creating models
var Events = mongoose.model("Events", EventsSchema);
var EventOccurrences = mongoose.model("EventOccurrences", EventOccurrencesSchema);

//exporting models
module.exports = {
    Events: Events,
    EventOccurrences: EventOccurrences
};
