var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    bcrypt   = require('bcrypt-nodejs');

var RegisteredUserSchema = new Schema({
    name          : String,
    username      : String,
    password      : String,
    email         : String,
    phone         : String,
    birthdate     : Date,
    address       : String,  //url string or x and y doubles?
    gender        : String,
    profilePic    : String,
    bookings      : [{type: mongoose.Schema.Types.ObjectId, ref:'Booking',default: []}],
    subscriptions : [{type: mongoose.Schema.Types.ObjectId, ref:'Business',default: []}],
    notifications : [{content:String,date:Date}],
    unread_notifications : {type: Number, default: 0},
    local    :
    {
        username:
        {
            type : String
        },
        password:
        {
            type : String,
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },
    facebook   :
    {
        id     : String,
        token  : String,
        email  : String
    },
    google     :
    {
        id     : String,
        token  : String,
        email  : String
    },
    user_type  : {type: Number, default: 1},
    name       : String,
    email      : String,
    phone      : String,
    birthdate  : Date,
    address    : String,  //url string or x and y doubles?
    gender     : String,
    profilePic : String,
    bookings      : [{type: mongoose.Schema.Types.ObjectId, ref:'Booking', default: []}],
    subscriptions : [{type: mongoose.Schema.Types.ObjectId, ref:'Business', default: []}]
});


// generating a hash (encrypted password)
RegisteredUserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if (encrypted) password is valid
RegisteredUserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


var RegisteredUser = mongoose.model('RegisteredUser', RegisteredUserSchema);
module.exports = RegisteredUser;
