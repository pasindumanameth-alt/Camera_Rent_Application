// Support either MONGODB_URI (common) or MONGO_URI (used in docker-compose env)
module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: '24h',
    mongoURI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/camerarent'
};