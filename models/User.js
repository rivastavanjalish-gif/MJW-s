const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    options: { type: String }, // e.g. "With Ice Cream"
    addons: {
        extraCheese: { type: Boolean, default: false },
        veggies: { type: Boolean, default: false }
    },
    finalPrice: { type: Number }
});

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },
    bio: { type: String, maxlength: 180 },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    landmark: { type: String },
    favoriteCategory: {
        type: String,
        enum: ['Shakes', 'Pizza', 'Burgers', 'Sandwiches', 'Snacks', '']
    },
    spicePreference: {
        type: String,
        enum: ['Mild', 'Medium', 'Spicy', 'Extra Spicy', '']
    },
    dietaryPreference: {
        type: String,
        enum: ['Vegetarian', 'Eggetarian', 'No Preference', '']
    },
    cart: [CartItemSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
