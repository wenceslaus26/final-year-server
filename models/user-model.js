const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true }
},
{ 
    collection: 'users' 
});


// Compile and export the User model
module.exports = mongoose.model('User', userSchema);