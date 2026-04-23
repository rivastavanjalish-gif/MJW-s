const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    basePrice: { type: Number },
    category: { type: String, required: true }, // 'Shakes', 'Snacks', 'Sandwiches', 'Burgers', 'Pizza'
    description: { type: String },
    imageUrl: { type: String },
    hasOptions: { type: Boolean, default: false },
    optionDetails: {
        name: String,
        priceIncrease: Number
    },
    isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Product', ProductSchema);
