const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        productName: String,
        priceAtPurchase: Number,
        quantity: Number,
        options: String,
        addons: {
            extraCheese: { type: Boolean, default: false },
            veggies: { type: Boolean, default: false }
        },
        finalPrice: { type: Number }
    }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
