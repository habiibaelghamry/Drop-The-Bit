var mongoose = require('mongoose'),
  Schema = mongoose.Schema; 

var ReplySchema = new Schema({
  reply: String,
  timestamp: { type: Date, default: new Date() },
  authorType: {
    type: String,
    enum: ['user', 'business']
  },
  user: {
    id: mongoose.Schema.Types.ObjectId, 
    name: String, 
    image: String 
  },
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' }
});

var Reply = mongoose.model('Reply', ReplySchema);
var ReviewSchema = new Schema({
  review: String,
  timestamp: { type: Date, default: new Date() },
  replies: [ReplySchema],
  votes: Number,
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  user: {
    id: mongoose.Schema.Types.ObjectId, 
    name: String, 
    image: String 
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RegisteredUser', default: [] }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RegisteredUser', default: [] }]
});


var Review = mongoose.model('Review', ReviewSchema);
module.exports = {
  Reply: Reply,
  Review: Review,
  ReviewSchema: ReviewSchema,
  ReplySchema: ReplySchema
}
