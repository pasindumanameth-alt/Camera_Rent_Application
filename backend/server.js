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
// In development allow common localhost origins (127.0.0.1 and ::1) and
// reflect the request origin when it matches the allowed list.
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000'];

// In development be permissive and reflect the request origin to avoid
// CORS mismatches from different localhost hostnames (127.0.0.1, ::1, etc.).
if (process.env.NODE_ENV === 'production') {
    app.use(cors({
        origin: function(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
            console.warn('Blocked CORS origin:', origin);
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true
    }));
} else {
    app.use(cors({
        origin: true,
        credentials: true
    }));
}

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

