const mongoose = require('mongoose');

async function main() {
    try {
        // Use local MongoDB by default, fallback to environment variable
        const mongoUri = process.env.DB_CONNECT_STRING || 'mongodb://localhost:27017/14dev';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.log("Error connecting to the database: ", err);
        // Don't throw error, let the app continue without DB
    }
}

module.exports = main;


