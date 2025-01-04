const router = require('express').Router();

const Profile = require('../db/profile');

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

module.exports = router;