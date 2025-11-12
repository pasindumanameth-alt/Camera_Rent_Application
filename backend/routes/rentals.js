const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Rental = require('../models/Rental');
const Camera = require('../models/Camera');

// Get all rentals for authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const rentals = await Rental.find({ user: req.user._id })
            .populate('camera')
            .sort({ createdAt: -1 });
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single rental
router.get('/:id', auth, async (req, res) => {
    try {
        const rental = await Rental.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('camera');
        
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }
        
        res.json(rental);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new rental
router.post('/', auth, async (req, res) => {
    try {
        const { cameraId, startDate, endDate } = req.body;

        // Check if camera exists and is available
        const camera = await Camera.findById(cameraId);
        if (!camera) {
            return res.status(404).json({ message: 'Camera not found' });
        }
        if (!camera.available) {
            return res.status(400).json({ message: 'Camera is not available for rent' });
        }

        // Calculate total price
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalPrice = days * camera.dailyRentPrice;

        const rental = new Rental({
            user: req.user._id,
            camera: cameraId,
            startDate,
            endDate,
            totalPrice
        });

        // Update camera availability
        camera.available = false;
        await camera.save();

        const newRental = await rental.save();
        await newRental.populate('camera');
        
        res.status(201).json(newRental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update rental status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const rental = await Rental.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        rental.status = status;
        
        if (status === 'completed' || status === 'cancelled') {
            // Make camera available again
            const camera = await Camera.findById(rental.camera);
            if (camera) {
                camera.available = true;
                await camera.save();
            }
        }

        const updatedRental = await rental.save();
        await updatedRental.populate('camera');
        
        res.json(updatedRental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;