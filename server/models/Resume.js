// server/models/Resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    data: { //To store the data Buffer
        type: Buffer,
        required: true
    },
    atsScore: {
        type: Number,
        required: true
    },
    analysis: {
        type: Object,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resume', ResumeSchema);