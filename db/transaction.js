<<<<<<< HEAD
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
        index: true
    },
    spaceId: {
        type: String,
    },
    accountId: {
        type: String,
        required: true,
        index: true
    },
    toAccountId: {
        type: String
    },
    fromAccountId: {
        type: String
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    categoryId: {
        type: String,
    },
    description: {
        type: String,
    },
    submitDateTime: {
        type:Date,
    },
    parentTransactionId: {
        type: ObjectId
    }
});


const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;

=======
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
        index: true
    },
    spaceId: {
        type: String,
    },
    accountId: {
        type: String,
        required: true,
        index: true
    },
    toAccountId: {
        type: String
    },
    fromAccountId: {
        type: String
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    categoryId: {
        type: String,
    },
    description: {
        type: String,
    },
    submitDateTime: {
        type:Date,
    },
});


const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;

>>>>>>> main
