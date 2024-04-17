const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const userIds = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true
    }
});

const usernames = new mongoose.Schema({
    username: {
        type: String,
        required: true
    }
});

const admins = new mongoose.Schema({
    admin: { type: ObjectId}
})

const spaceSchema = new mongoose.Schema({
    userIds: [userIds],
    usernames: [usernames],
    spaceName: {
        type: String,
        required: true
    },
    spaceBalance: {
        type: String,
    },
    admins: [admins]
});


const Space = mongoose.model('Space', spaceSchema);
module.exports = Space;

