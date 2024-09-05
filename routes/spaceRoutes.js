const router = require('express').Router();
const Space = require('../db/space');
const utils = require('../lib/utils');

// create space
router.post('/create-space/:userId', async (req, res) => { 
    
    try {
        const newSpace = await Space.create(req.body);
        res.status(201).json({ message: 'Spacce created successfully with ID: ' + newSpace["_id"], success: true, data: newSpace });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// get space
router.get('/read-space/:spaceId', async (req, res) => {
    const spaceId = req.params.spaceId;
    
    try {
        const result = await Space.findOne({ _id: spaceId }).exec();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error reading documents:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// update (add) space
router.put('/add-space/:spaceId', async (req, res) => {
    const spaceId = req.params.spaceId;
    const data = req.body;
    
    try {
        const result = await Space.findOneAndUpdate(
            { _id: new ObjectId(spaceId) },
            { $set: data },
            { new: true }
        );
        res.status(200).json({ message: 'Document added successfully', success: true, data: result });
        } catch (error) {
            console.error('Error updating document:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }

});

// update (remove) space
router.put('/remove-space/:spaceId', async (req, res) => {
    const spaceId = req.params.spaceId;
    const data = req.body;
    
    try {
        const result = await Space.findOneAndUpdate(
            { _id: new ObjectId(spaceId) },
            { $pull: data },
            { new: true }
        );
        res.status(200).json({ message: 'Document removed successfully', success: true, data: result });
        } catch (error) {
            console.error('Error updating document:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
});

router.delete('/delete/:spaceId', utils.isAdmin, async (req, res) => {
    const spaceId = req.params.spaceId;
    try {
        const result = await Space.deleteOne({ _id: new ObjectId(spaceId) });
        res.status(200).json({ message: 'Space deleted successfully', success: true, data: result });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;