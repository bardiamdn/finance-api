const router = require('express').Router();
const Profile = require('../db/profile');
const Transaction = require('../db/transaction');
const { ObjectId } = require('mongoose').Types;

/* there is no create or delete profile 
it is done automatiically in the authRoutes*/

// get profile
router.get('/read-profile/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const result = await Profile.findOne({ userId: userId }).exec();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error reading documents:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// add account
router.put('/add-account/:userId', async (req, res) => {
    const userId = req.params.userId;
    const accountData = req.body;
    
    try {
        const result = await Profile.findOneAndUpdate(
            { userId: new ObjectId(userId) },
            { $push: { accounts: accountData } },
            { new: true }
        );
        res.status(200).json({ message: 'Account added successfully', success: true, data: result });
        } catch (error) {
            console.error('Error updating document:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
});

// update account
/* Acceptable data form -> 
[
    {
        accountId: which is _id of the account
        data: {data to be updated}
    },
    {
        data: {data to be updated}
        accountId:
    }
]*/
router.put('/update-account/:userId', async (req, res) => {
    const userId = req.params.userId;
    const updatedProfile = req.body;
    
    try {
        const profile = await Profile.findOneAndUpdate( 
            { userId: new ObjectId(userId) },
            { $set: updatedProfile }, // New data to set
            { new: true }
        );

        res.status(200).json({ message: 'Document updated successfully', success: true, data: profile });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// remove account
router.delete('/remove-account/:userId', async (req, res) => {
    const userId = req.params.userId;
    const accountId = req.query.accountId;
    
    try {
        const result = await Profile.findOneAndUpdate(
            { userId: new ObjectId(userId) },
            { $pull: { accounts: { _id: new ObjectId(accountId) } } },
            { new: true }
        );
        const transactionResult = await Transaction.deleteMany({ userId: new ObjectId(userId), accountId: accountId });
        if (!result) {
            return res.status(404).json({ message: `Account with ID ${accountId} not found` });
        }
        res.status(200).json({ message: 'Account removed successfully', success: true, data: result,
            removedTransactions: transactionResult 
        });
        } catch (error) {
            console.error('Error updating document:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
});

// add category
router.put('/add-category/:userId', async (req,res) => {
    const userId = req.params.userId;
    categoryData = req.body;

    try {
        const result = await Profile.findOneAndUpdate(
            { userId : new ObjectId(userId) },
            { $push: { categories: categoryData } },
            { new: true }
        );
        res.status(200).json({ message: 'Category added successfully', success: true, data: result });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// edit category
/* Acceptable data form -> 
[
    {
        categoryId: _id of the category
        data: {
            categoryTitle:
            categoryColor:
            categoryType:
        }
    },
    {
        categoryId:
        data: {data to be updated}
    }
]*/
router.put('/update-category/:userId', async (req, res) => {
    const userId = req.params.userId;
    const categoryId = req.body._id;
    const categoryTitle = req.body.categoryTitle;
    const categoryColor = req.body.categoryColor;
    const categoryType = req.body.categoryType;
    
    try {
            const result = await Profile.findOneAndUpdate(
                { userId: new ObjectId(userId), 'categories._id': categoryId },
                { $set: { 
                    "categories.$.categoryTitle": categoryTitle,
                    "categories.$.categoryColor": categoryColor,
                    "categories.$.categoryType": categoryType, 
                }},
                { new: true }
            )
            res.status(200).json({ message: 'Category updated successfully', success: true, data: result });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// remove category
router.delete('/remove-category/:userId/:categoryId', async (req, res) => {
    const userId = req.params.userId;
    const categoryId = req.params.categoryId;
    
    try {
        const result = await Profile.findOneAndUpdate(
            { userId: new ObjectId(userId) },
            { $pull: { categories: { _id: new ObjectId(categoryId) } } },
            { new: true }
        );
        const transactionResult = await Transaction.deleteMany({ userId: new ObjectId(userId), categoryId: categoryId });
        if (!result) {
            return res.status(404).json({ message: `Category with ID ${categoryId} not found` });
        }
        res.status(200).json({ message: 'Category removed successfully', success: true, data: result,
            removedTransactions: transactionResult
        });
        } catch (error) {
            console.error('Error updating document:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
});

router.put('/update-currency/:userId', async(req, res) => {
    const userId = req.params.userId;
    const updatedCurrency = req.body.updatedCurrency

    try {
        console.log(updatedCurrency)
        const result = await Profile.findOneAndUpdate(
            { userId: new ObjectId(userId) },
            { $set: { currency : updatedCurrency
            }},
            { new: true }
        )
        res.status(200).json({ message: 'Currency updated successfully', success: true, data: result });
    } catch(error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})


// // update (add to) profile
// router.put('/add-profile/:userId', async (req, res) => {
//     const userId = req.params.userId;
//     const data = req.body;
    
//     try {
//         const result = await Profile.findOneAndUpdate(
//             { userId: new ObjectId(userId) },
//             { $set: data },
//             { new: true }
//         ); 
//         res.status(200).json({ message: 'Document added successfully', success: true, data: result });
//         } catch (error) {
//             console.error('Error updating document:', error);
//             res.status(500).json({ message: 'Internal Server Error' });
//         }
// });


module.exports = router;