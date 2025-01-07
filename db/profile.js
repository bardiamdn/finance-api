const mongoose = require('mongoose');
const Transaction  = require('./transaction');
const { getRandomTransactions, defaultCategories, defaultAccounts } = require('../lib/defaultData');

const accountSchema = new mongoose.Schema({
    dateUpdated: {
        type: Date,
    },
    accountTitle: {
        type: String,
    },
    accountColor: {
        type: String,
        default: '#ffffff'  // set it to something better later
    },
    accountBalance: {
        type: Number,
        default: 0,
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
    listPriority: {
        type: Number,
    },
    createdAt: {
        type: Date,
    },
});

const currencySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    }
}, { _id: false });

const profileSchema = new mongoose.Schema({
    userEmail : {
        type: String,
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
    currency: {
        type: currencySchema,
        default: { code: "USD", symbol: "$", name: "United States Dollar" },
        required: true
    },
    totalBalance: {
        type: Number
    },
    createdAt: {
        type: Date,
    },
});

const number = 50; 
const mostIncome = 10000; 
const daysBefore = 45;
const incomeExpenseWeight = 0.7; // increased the weight, some of the expenses are being removed due to insufficient balance

profileSchema.pre("save", async function (next) {
    if (!this.accounts || this.accounts.length === 0) {
        this.accounts = defaultAccounts;
    }
    if (!this.categories || this.categories.length === 0) {
        this.categories = defaultCategories;
    }

    if (this.isNew) {       
        
        const transactions = await getRandomTransactions(this, number, mostIncome, daysBefore, incomeExpenseWeight);
        console.log(transactions)

        try {
            await Transaction.insertMany(transactions);
            
        } catch (err) {
            console.error("Error inserting default transactions:", err);
            next(err);
            return;
        }
    }

    next();
});


const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
