const mongoose = require('mongoose');

// Authentication User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        sparse: true, //sparse accepts multiple nulls
        // unique: true,
        index: true
    },
    hash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
});

// User _id generated by mongodb in the authentication (user) will be used for everything

const User = mongoose.model('User', userSchema);
module.exports = User;

