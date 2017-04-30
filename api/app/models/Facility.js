var mongoose    = require('mongoose');
var SchemaTypes = mongoose.Schema.Types;

var FacilitySchema = new mongoose.Schema(
{
	name: String,
    description: String,
    capacity: Number,
    image: String,
    business_id:{type: mongoose.Schema.Types.ObjectId, ref:'Business'}

});

var Facility = mongoose.model("Facility", FacilitySchema);

//exporting models
module.exports = Facility;
