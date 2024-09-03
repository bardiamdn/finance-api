<<<<<<< HEAD
const router = require('express').Router();

const Transaction = require('../db/transaction');
const Profile = require('../db/profile');
const Space = require('../db/space');

// Get all data in one route with userId
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const userProfile = await Profile.findOne({userId: userId});
        res.status(200).json({sucess: true, msg: "All the User's Home Data", data: userProfile});
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

=======
const router = require('express').Router();

const Transaction = require('../db/transaction');
const Profile = require('../db/profile');
const Space = require('../db/space');

// Get all data in one route with userId
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const userProfile = await Profile.findOne({userId: userId});
        res.status(200).json({sucess: true, msg: "All the User's Home Data", data: userProfile});
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

>>>>>>> main
module.exports = router;