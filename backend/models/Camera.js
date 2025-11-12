const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    dailyRentPrice: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    specifications: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Camera', cameraSchema);