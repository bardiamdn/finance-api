const router = require('express').Router();
const Profile = require('../db/profile');
const Transaction = require('../db/transaction');
const { ObjectId } = require('mongoose').Types;

/* there is no create or delete profile 
it is done automatiically in the authRoutes*/

// get profile
router.get('/read-profile/:profileId', async (req, res) => {
    const profileId = req.params.profileId;
    try {
        const result = await Profile.findOne({ _id: profileId }).exec();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error reading documents:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// add account
router.put('/add-account/:profileId', async (req, res) => {
    const profileId = req.params.profileId;
    const accountData = req.body;
    
    try {
        const result = await Profile.findOneAndUpdate(
            { _id: profileId },
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
router.put('/update-account/:profileId', async (req, res) => {
    const profileId = req.params.profileId;
    const updatedProfile = req.body;
    
    try {
        const profile = await Profile.findOneAndUpdate( 
            { _id: profileId },
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
router.delete('/remove-account/:profileId', async (req, res) => {
    const profileId = req.params.profileId;
    const accountId = req.query.accountId;
    
    try {
        const result = await Profile.findOneAndUpdate(
            { _id: profileId },
            { $pull: { accounts: { _id: new ObjectId(accountId) } } },
            { new: true }
        );
        const transactionResult = await Transaction.deleteMany({ _id: profileId, accountId: accountId });
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
router.put('/add-category/:profileId', async (req,res) => {
    const profileId = req.params.profileId;
    categoryData = req.body;

    try {
        const result = await Profile.findOneAndUpdate(
            { _id: profileId },
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
router.put('/update-category/:profileId', async (req, res) => {
    const profileId = req.params.profileId;
    const categoryId = req.body._id;
    const categoryTitle = req.body.categoryTitle;
    const categoryColor = req.body.categoryColor;
    const categoryType = req.body.categoryType;
    
    try {
            const result = await Profile.findOneAndUpdate(
                { _id: profileId, 'categories._id': categoryId },
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
router.delete('/remove-category/:profileId/:categoryId', async (req, res) => {
    const profileId = req.params.profileId;
    const categoryId = req.params.categoryId;
    
    try {
        const result = await Profile.findOneAndUpdate(
            { _id: profileId },
            { $pull: { categories: { _id: new ObjectId(categoryId) } } },
            { new: true }
        );
        const transactionResult = await Transaction.deleteMany({ _id: profileId, categoryId: categoryId });
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

router.put('/update-currency/:profileId', async(req, res) => {
    const profileId = req.params.profileId;
    const updatedCurrency = req.body.updatedCurrency

    try {
        const result = await Profile.findOneAndUpdate(
            { _id: profileId },
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


module.exports = router;