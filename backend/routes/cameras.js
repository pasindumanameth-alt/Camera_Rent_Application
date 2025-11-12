const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Camera = require('../models/Camera');

// Get all cameras
router.get('/', async (req, res) => {
    try {
        const cameras = await Camera.find();
        res.json(cameras);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single camera
router.get('/:id', async (req, res) => {
    try {
        const camera = await Camera.findById(req.params.id);
        if (!camera) {
            return res.status(404).json({ message: 'Camera not found' });
        }
        res.json(camera);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new camera (admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const camera = new Camera(req.body);
        const newCamera = await camera.save();
        res.status(201).json(newCamera);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update camera (admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const camera = await Camera.findById(req.params.id);
        if (!camera) {
            return res.status(404).json({ message: 'Camera not found' });
        }

        Object.assign(camera, req.body);
        const updatedCamera = await camera.save();
        res.json(updatedCamera);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete camera (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const camera = await Camera.findById(req.params.id);
        if (!camera) {
            return res.status(404).json({ message: 'Camera not found' });
        }

        await camera.remove();
        res.json({ message: 'Camera deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;