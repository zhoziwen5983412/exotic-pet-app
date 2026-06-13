const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        default: null
    },
    content: { type: String, required: true, maxlength: 1000 },
    contentEn: { type: String, default: '' },
    image: { type: String, default: '' },
    location: { type: String, default: '' },
    tag: { type: String, default: '日常分享' },
    tagEn: { type: String, default: 'Daily Story' },
    curiousCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    sharedCount: { type: Number, default: 0 },
    commentsList: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        avatar: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
