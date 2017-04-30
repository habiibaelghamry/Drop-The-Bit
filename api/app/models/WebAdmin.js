var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    bcrypt   = require('bcrypt-nodejs');
var WebAdminSchema = new Schema({   
    local    :
    {   
    	username: 
        {
            type : String,
            required : true,
            unique : true
        },
        password: 
        {
            type : String,
            required : true
        },
    },        
    user_type : {type: Number, default: 3}
});   


// generating a hash (encrypted password)
WebAdminSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if (encrypted) password is valid
WebAdminSchema.methods.validPassword = function(password) {
    return (bcrypt.compareSync(password, this.local.password));
};


var WebAdmin = mongoose.model('WebAdmin', WebAdminSchema);
module.exports = WebAdmin;     