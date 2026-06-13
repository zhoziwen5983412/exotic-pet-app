const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    species: { type: String, required: true },
    speciesKey: { type: String, default: '' },
    gender: { type: String, default: '' },
    age: { type: String, default: '' },
    ageEn: { type: String, default: '' },
    gene: { type: String, default: '' },
    image: { type: String, default: '' },
    companionDays: { type: Number, default: 1 },
    location: { type: String, default: '' },
    locationKey: { type: String, default: '' },
    coordinates: { type: String, default: '' },
    followersCount: { type: Number, default: 0 },
    personality: { type: String, default: '' },
    personalityEn: { type: String, default: '' },
    story: { type: String, default: '' },
    storyEn: { type: String, default: '' },
    timeline: [{
        day: String,
        title: String,
        titleEn: String,
        desc: String,
        descEn: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Pet', petSchema);
