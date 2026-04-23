const mongoose = require('mongoose');
require('dotenv').config();

async function checkIndices() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aman-frontend');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');
        const indices = await collection.indexes();
        console.log('Current Indices:', JSON.stringify(indices, null, 2));

        // Attempt to drop any unique index on phone
        for (const index of indices) {
            if (index.key.phone) {
                console.log(`Dropping index: ${index.name}`);
                await collection.dropIndex(index.name);
            }
        }

        console.log('Cleanup finished.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkIndices();
