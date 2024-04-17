const router = require('express').Router();
const User = require('../db/user');
const Profile = require('../db/profile');
const Space = require('../db/space');
const utils = require('..//lib/utils');


router.get('/authenticated/:userId', utils.authMiddleware, async (req, res) => {
    const userId = req.params.userId;
    try {
        const result = await User.findById({ _id: userId });
        if (result) {
            res.status(200).json({ success: true, msg: "you are authorized" });
        } else {
            res.status(401).json({success: false, msg: "user not found"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, msg: "an error occured in the server" });
    }

})

router.post('/signup', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });

        if (user) {
            res.status(400).json({ success: false, msg: "Username already exists" });
            return; // Ensure the response is sent and the function exits early
        }

        const saltHash = utils.genPassword(req.body.password);
        console.log(saltHash);

        const newUser = new User({
            username: String(req.body.username),
            hash: saltHash.hash,
            salt: saltHash.salt,
        });
        console.log(newUser);
        
        const savedUser = await newUser.save();
        console.log(savedUser);
        
        const newProfile = new Profile({
            username: savedUser.username,
            userId : savedUser._id,
            // categories: [
            //     {
            //         categoryTitle: "Default",
            //         categoryColor: "#949494c0",
            //         categoryType: "expense",
            //         createdAt: Date.now()
            //     },
            //     {
            //         categoryTitle: "Default",
            //         categoryColor: "#949494c0",
            //         categoryType: "income",
            //         createdAt: Date.now()
            //     }
            // ],
            // accounts: [
            //     {
            //         accountTitle: "Default",
            //         accountColor: "#949494c0",
            //         createdAt: Date.now()
            //     }
            // ],
            createdAt: Date.now(),
        });
        console.log(newProfile);

        await newProfile.save();


        res.status(201).json({ success: true, message: savedUser });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: "Username already exists" });
        }
        return res.status(500).json({ success: false, error: 'An error occurred during user creation', message: error.message });
    }
});

router.post('/login', async(req, res, next) => {
    const username = req.body.username;
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            res.status(409).json({ success: false, msg: "username or password is wrong" }); // Conflict
            return;
        }
        const isValid = utils.validPassword(req.body.password, user.hash, user.salt);

        if (isValid) {
            const tokenObject = utils.issueJWT(user);
            
            const profile = await Profile.findOne({ userId: user._id });
            try {
                if(profile) {
                    await Profile.updateOne({userId: user._id}, {$set: {lastSignin: Date.now()}});
                    res.status(201).json({
                        success: true,
                        username: username,
                        userId: user._id,
                        token: tokenObject.token, 
                        expiresIn: tokenObject.expires,
                        msg: "New token created and lastSignin updated successfully"
                    });
                } else {
                    const newProfile = new Profile({
                        userId: user._id,
                        createdAt: Date.now(),
                        lastSignin: Date.now(),
                    });

                    await newProfile.save();
                    res.status(201).json({
                        success: true,
                        username: username,
                        userId: user._id,
                        token: tokenObject.token, 
                        expiresIn: tokenObject.expires,
                        msg: "New token and new profile created successfully"
                    });
                }
            } catch (err) {
                console.error("Error updating profile:", err);
                return res.status(500).json({ success: false, msg: "Couldn't update the Profile" });
            }
    
        } else {
            res.status(401).json({ success: false, msg: "Username or password is wrong" });
        }

    }catch (err) {
        res.status(500).json({ sucess:false, msg: 'Something went wrong' });
        next(err);
    }
});

router.delete('/delete-account', utils.authMiddleware, async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    
    // Check the username password from the body before deleting
    if (!user) {
        res.status(409).json({ success: false, msg: "username doesn't exist" }); // Conflict
        return;
    }
    
    const isValid = utils.validPassword(req.body.password, user.hash, user.salt);

    if(isValid) {
        const userId = user._id;
        try {

            await Space.updateMany( 
            { userIds: userId },
            { $pull: { usernames: { username: user.username } } },
            { $push: { usernames: { username: 'Deleted Account' }} }
            );
            // res.status(200).json({ sucess: true, msg: 'removed from spaces successfully'});
        } catch (err) {

            res.status(500).json({ sucess: false, msg: 'An error occurd during removing from spaces'});
            console.error('Error deleting ')
        }
        try {

            await Profile.findOneAndDelete( {userId: userId });
            // res.status(200).json({ sucess: true, msg: 'Profile deleted successfully'});
        } catch (err) {

            res.status(500).json({ sucess: false, msg: 'An error occurd during deleting profile'});
            console.error('Error deleting profile')
        }
        try {

            await User.findByIdAndDelete({ _id: userId });
            res.status(200).json({ sucess: true, msg: 'User deleted successfully'});
        } catch (err) {

            res.status(500).json({ sucess: false, msg: 'An error occurd during deleting user'});
            console.error('Error deleting user')
        }
    } else {
        res.status(404).json({ sucess: false, msg: 'Invalid username or password' });
    }
});

// change password
// router.post('/change-password', async (req, res) => {

// });


module.exports = router;