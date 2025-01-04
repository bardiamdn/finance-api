const mongoose = require('mongoose');

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

const defaultAccounts = [
    { accountTitle: "💵 Cash", accountColor: "#FFD700", accountBalance: 0 }, 
    { accountTitle: "🏦 Bank Account", accountColor: "#3E8E41", accountBalance: 0 }, 
    { accountTitle: "💳 Credit Card", accountColor: "#FF4500", accountBalance: 0 }, 
    { accountTitle: "💰 Savings", accountColor: "#2E86C1", accountBalance: 0 }, 
    { accountTitle: "📈 Investment", accountColor: "#6A1B9A", accountBalance: 0 }, 
];

const defaultCategories = [
    { categoryTitle: "💼 Salary", categoryType: "Income", categoryColor: "#4CAF50" }, // Green for wealth
    { categoryTitle: "🏢 Business", categoryType: "Income", categoryColor: "#81C784" }, // Light green for commerce
    { categoryTitle: "📊 Investments", categoryType: "Income", categoryColor: "#FFD54F" }, // Yellow for returns
    { categoryTitle: "🎁 Other Income", categoryType: "Income", categoryColor: "#FFEE58" },
    { categoryTitle: "🍔 Food", categoryType: "Expense", categoryColor: "#FF7043" }, // Orange-red for meals
    { categoryTitle: "🏠 Rent", categoryType: "Expense", categoryColor: "#BDBDBD" }, // Gray for housing
    { categoryTitle: "🚗 Transportation", categoryType: "Expense", categoryColor: "#546E7A" }, // Blue-gray for vehicles
    { categoryTitle: "💡 Utilities", categoryType: "Expense", categoryColor: "#8D6E63" }, // Brown for resources
    { categoryTitle: "🎮 Entertainment", categoryType: "Expense", categoryColor: "#03A9F4" }, // Bright blue for fun
    { categoryTitle: "❤️ Healthcare", categoryType: "Expense", categoryColor: "#E91E63" }, // Red for health
    { categoryTitle: "🛡️ Insurance", categoryType: "Expense", categoryColor: "#00796B" }, // Teal for security
    { categoryTitle: "🎓 Education", categoryType: "Expense", categoryColor: "#3F51B5" }, // Indigo for learning
    { categoryTitle: "📦 Other Expenses", categoryType: "Expense", categoryColor: "#FF9800" }, // Bright orange for miscellaneous

];

profileSchema.pre("save", function (next) {
    if (!this.accounts || this.accounts.length === 0) {
        this.accounts = defaultAccounts;
    }
    if (!this.categories || this.categories.length === 0) {
        this.categories = defaultCategories;
    }
    next();
});


const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
