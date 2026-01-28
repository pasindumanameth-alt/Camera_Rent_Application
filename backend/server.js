// Load environment variables from .env (for local development)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
const cameraRoutes = require('./routes/cameras');
const rentalRoutes = require('./routes/rentals');

const app = express();

// CORS configuration
const corsOptions = {
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://[::1]:3000',
            'http://localhost',
            'http://127.0.0.1',
            'http://[::1]',
            'http://172.31.192.1:3000'
        ];
        
        // Check if origin is in allowlist or if in development mode
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.warn('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Dashboard endpoint (get statistics)
app.get('/api/dashboard', (req, res) => {
    res.json({
        status: 'OK',
        data: {
            totalCameras: 0,
            availableCameras: 0,
            rentedCameras: 0,
            totalRevenue: 0
        }
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/rentals', rentalRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ 
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

