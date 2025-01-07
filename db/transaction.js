const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = new mongoose.Schema({
    // same as _id profile
    userId: {
        type: ObjectId,
        required: true,
        index: true
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


let Profile;
transactionSchema.pre('save', async function (next) {
    const transaction = this;

    if (!Profile) {
        Profile = require('./profile'); // Lazy load Profile
    }

    try {
        const profile = await Profile.findOne({ _id: transaction.userId });

        if (!profile) {
            console.log('Account not found')
            throw new Error('Account not found');
        }

        const account = profile.accounts.id(transaction.accountId);
        if (!account) {
            console.log('Account not found in profile')
            throw new Error('Account not found in profile');
        }

        if (transaction.type === 'income') {
            account.accountBalance += transaction.amount;
        } else if (transaction.type === 'expense') {
            if (account.accountBalance < transaction.amount) {
                console.log('Insufficient balance for expense')
                throw new Error('Insufficient balance for expense');
            }
            account.accountBalance -= transaction.amount;
        } else if (transaction.type === 'transfer') {
            const fromAccount = profile.accounts.id(transaction.fromAccountId);
            const toAccount = profile.accounts.id(transaction.toAccountId);

            if (!fromAccount || !toAccount) {
                console.log('One or both transfer accounts not found')
                throw new Error('One or both transfer accounts not found');
            }

            if (fromAccount.accountBalance < transaction.amount) {
                console.log('Insufficient balance for transfer')
                throw new Error('Insufficient balance for transfer');
            }

            fromAccount.accountBalance -= transaction.amount;
            toAccount.accountBalance += transaction.amount;
        }

        await profile.save();
        next();
    } catch (error) {
        next(error);
    }
})


const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;

