var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var RatingSchema = new Schema({
    user_ID : {type: mongoose.Schema.Types.ObjectId, ref:'RegisteredUser',default: []},
    business_ID : {type: mongoose.Schema.Types.ObjectId, ref:'Business',default: []},
    rating       : Number,
    //event_id     : {type: mongoose.Schema.Types.ObjectId, ref:'RegisteredUser',default: []}
});

var Rating = mongoose.model('Rating', RatingSchema);
module.exports = Rating;
