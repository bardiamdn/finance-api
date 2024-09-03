<<<<<<< HEAD
const router = require('express').Router();
const Transaction = require('../db/transaction');
const Profile = require('../db/profile');
const { ObjectId } = require('mongodb');


router.post('/create', async (req, res) => {
    const transaction = req.body;
    try {
        const newTransaction = await Transaction.create(transaction);

        let newTransferTransaction = null
        let transferTransaction = { ...transaction };
        if (transaction.type === "transfer"){

            // Make modifications to the transferTransaction object
            transferTransaction.accountId = transaction.toAccountId;
            transferTransaction.fromAccountId = transaction.accountId;
            transferTransaction.parentTransactionId = newTransaction._id;

            // Delete the toAccountId property from the transferTransaction object
            transferTransaction.toAccountId = "";

            newTransferTransaction = await Transaction.create(transferTransaction)
        }

        console.log("New Transaction Created Successfully");
        (newTransferTransaction ? 
            res.status(201).json({ message: 'Transfer created successfully with ID: ' + newTransaction._id, success: true, data: {from: newTransaction, to: newTransferTransaction} })
            :
            res.status(201).json({ message: 'Transaction created successfully with ID: ' + newTransaction._id, success: true, data: newTransaction })
        )
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const PAGE_SIZE = 50
router.get('/read/:userId', async (req, res) => {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;

    try {
        const totalCount = await Transaction.countDocuments({ userId: userId, fromAccountId: "" });
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);

        const result = await Transaction.find({ userId: userId, fromAccountId:"" })
        .sort({ Date: -1 })
            .skip((page - 1) * PAGE_SIZE) 
            .limit(PAGE_SIZE) 
            .exec();
        if (result.length > 0) {
            res.status(200).json({ success: true, data: result, totalPages: totalPages, currentPage: page });
            console.log("Got Transaction History Successfully");
        } else {
            res.status(204).json({ success: true, msg: "no history data was found" })
        }
    } catch (error) {
        console.error('Error reading documents:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.put('/update/:userId', async (req, res) => {
    const userId = req.params.userId;
    const transactionId = req.body._id;
    const data = req.body;
    
    try {
        const result = await Transaction.updateOne(
            { _id: new ObjectId(transactionId), userId: userId },
            { $set: data }
        );
        res.status(200).json({ message: 'Document updated successfully', success: true, data: result });
        } catch (error) {
            console.error('Error updating document:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
});

router.delete('/delete/:userId/:transactionId', async (req, res) => {
    const userId = req.params.userId;
    const transactionId = req.params.transactionId;

    try {
        const result = await Transaction.deleteMany({ 
            $or: [
                { _id: new ObjectId(transactionId) },
                { accountId: new ObjectId(transactionId) },
                { toAccount: new ObjectId(transactionId) },
                { fromAccount: new ObjectId(transactionId) }
            ]
         })
        // const result = await Transaction.deleteOne({ _id: new ObjectId(transactionId), userId: new ObjectId(userId) });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Transaction deleted successfully', success: true, data: result });
        } else {
            res.status(404).json({ message: "Couldn't Find the Trasnaction", success: false, data: result });
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

=======
const router = require('express').Router();
const Transaction = require('../db/transaction');
const Profile = require('../db/profile');
const { ObjectId } = require('mongodb');


router.post('/create', async (req, res) => {
    const transaction = req.body;
    try {
        let newTransferTransaction = null
        let transferTransaction = { ...transaction };
        if (transaction.type === "transfer"){

            // Make modifications to the transferTransaction object
            transferTransaction.accountId = transaction.toAccountId;
            transferTransaction.fromAccountId = transaction.accountId;

            // Delete the toAccountId property from the transferTransaction object
            transferTransaction.toAccountId = "";

            newTransferTransaction = await Transaction.create(transferTransaction)
        }
        
        const newTransaction = await Transaction.create(transaction);

        console.log("New Transaction Created Successfully");
        (newTransferTransaction ? 
            res.status(201).json({ message: 'Transfer created successfully with ID: ' + newTransaction._id, success: true, data: {from: newTransaction, to: newTransferTransaction} })
            :
            res.status(201).json({ message: 'Transaction created successfully with ID: ' + newTransaction._id, success: true, data: newTransaction })
        )
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const PAGE_SIZE = 50
router.get('/read/:userId', async (req, res) => {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;

    try {
        const totalCount = await Transaction.countDocuments({ userId: userId, fromAccountId: "" });
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);

        const result = await Transaction.find({ userId: userId, fromAccountId:"" })
        .sort({ Date: -1 })
            .skip((page - 1) * PAGE_SIZE) 
            .limit(PAGE_SIZE) 
            .exec();
        if (result.length > 0) {
            res.status(200).json({ success: true, data: result, totalPages: totalPages, currentPage: page });
            console.log("Got Transaction History Successfully");
        } else {
            res.status(204).json({ success: true, msg: "no history data was found" })
        }
    } catch (error) {
        console.error('Error reading documents:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.put('/update/:userId', async (req, res) => {
    const userId = req.params.userId;
    const transactionId = req.body._id;
    const data = req.body;
    
    try {
        const result = await Transaction.updateOne(
            { _id: new ObjectId(transactionId), userId: userId },
            { $set: data }
        );
        res.status(200).json({ message: 'Document updated successfully', success: true, data: result });
        } catch (error) {
            console.error('Error updating document:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
});

router.delete('/delete/:userId/:transactionId', async (req, res) => {
    const userId = req.params.userId;
    const transactionId = req.params.transactionId;

    try {
        const result = await Transaction.deleteMany({ 
            $or: [
                { _id: new ObjectId(transactionId) },
                { accountId: new ObjectId(transactionId) },
                { toAccount: new ObjectId(transactionId) },
                { fromAccount: new ObjectId(transactionId) }
            ]
         })
        // const result = await Transaction.deleteOne({ _id: new ObjectId(transactionId), userId: new ObjectId(userId) });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Transaction deleted successfully', success: true, data: result });
        } else {
            res.status(404).json({ message: "Couldn't Find the Trasnaction", success: false, data: result });
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

>>>>>>> main
module.exports = router;