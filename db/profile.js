<<<<<<< HEAD
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const accountSchema = new mongoose.Schema({
    dateUpdated: {
        type: Date,
    },
    accountTitle: {
        type: String,
        index: true
    },
    accountColor: {
        type: String,
        default: '#ffffff'  // set it to something better later
    },
    accountBalance: {
        type: Number,       // It is better to set it to string for negative balances
    },
    listPriority: {
        type: Number,
    },
    createdAt: {
        type: Date,
    },
});

const categorySchema = new mongoose.Schema({
    dateUpdated: {
        type: Date,
    },
    categoryTitle: {
        type: String,
    },
    categoryType: {
        type: String,
    },
    categoryColor: {
        type: String,
        // default: '#ffffff'  // set it to something better later
    },
    categoryBalance: {
        type: Number,       // It is better to set it to string for negative balances
    },
    listPriority: {
        type: Number,
    },
    createdAt: {
        type: Date,
    },
});

const profileSchema = new mongoose.Schema({
    userId : {
        type: ObjectId,
        required: true,
        index: true
    },
    username: {
        type: String
    },
    profilePic: {
        type: String,
        // default: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg stroke-width="1.25" viewBox="0 0 24 24" fill="none" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path opacity="0.1" d="M17 8A5 5 0 1 1 7 8a5 5 0 0 1 10 0Z" fill="#4DACD1"/><path d="M17 8A5 5 0 1 1 7 8a5 5 0 0 1 10 0Z" stroke="#4DACD1"/><path d="M3 21c.957-3.076 3.42-4 9-4s8.043.924 9 4" stroke="#4DACD1" stroke-linecap="round"/></svg>'
    },
    accounts: [accountSchema],
    categories: [categorySchema],
    lastSignin: {
        type: Date,
    },
    totalBalance: {
        type: Number
    },
    createdAt: {
        type: Date,
    },
});


const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
=======
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const accountSchema = new mongoose.Schema({
    dateUpdated: {
        type: Date,
    },
    accountTitle: {
        type: String,
        index: true
    },
    accountColor: {
        type: String,
        default: '#ffffff'  // set it to something better later
    },
    accountBalance: {
        type: Number,       // It is better to set it to string for negative balances
    },
    listPriority: {
        type: Number,
    },
    createdAt: {
        type: Date,
    },
});

const categorySchema = new mongoose.Schema({
    dateUpdated: {
        type: Date,
    },
    categoryTitle: {
        type: String,
    },
    categoryType: {
        type: String,
    },
    categoryColor: {
        type: String,
        // default: '#ffffff'  // set it to something better later
    },
    categoryBalance: {
        type: Number,       // It is better to set it to string for negative balances
    },
    listPriority: {
        type: Number,
    },
    createdAt: {
        type: Date,
    },
});

const profileSchema = new mongoose.Schema({
    userId : {
        type: ObjectId,
        required: true,
        index: true
    },
    username: {
        type: String
    },
    profilePic: {
        type: String,
        // default: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg stroke-width="1.25" viewBox="0 0 24 24" fill="none" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path opacity="0.1" d="M17 8A5 5 0 1 1 7 8a5 5 0 0 1 10 0Z" fill="#4DACD1"/><path d="M17 8A5 5 0 1 1 7 8a5 5 0 0 1 10 0Z" stroke="#4DACD1"/><path d="M3 21c.957-3.076 3.42-4 9-4s8.043.924 9 4" stroke="#4DACD1" stroke-linecap="round"/></svg>'
    },
    accounts: [accountSchema],
    categories: [categorySchema],
    lastSignin: {
        type: Date,
    },
    totalBalance: {
        type: Number
    },
    createdAt: {
        type: Date,
    },
});


const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
>>>>>>> main
