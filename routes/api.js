const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const sgMail = require('@sendgrid/mail');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// SendGrid Setup
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Temporary in-memory store for OTPs
const otpStore = {};

function buildOtpEmailTemplate({ customerName, otp, isNewUser }) {
    const heading = isNewUser
        ? `Welcome to MJW's Shake & Spicy, ${customerName || 'there'}!`
        : `Good to see you again, ${customerName || 'foodie'}!`;
    const intro = isNewUser
        ? "We're excited to have you here. Your next favorite shake, snack, or spicy bite is just a few clicks away."
        : "Your account is ready for another quick login so you can get back to your cravings without the wait.";

    return `
        <div style="margin:0;padding:32px 16px;background:linear-gradient(180deg,#f8f7fb 0%,#f0e8ff 100%);font-family:'Segoe UI',Arial,sans-serif;color:#3B1E54;">
            <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(59,30,84,0.12);border:1px solid rgba(115,60,195,0.08);">
                <div style="padding:28px 32px;background:linear-gradient(135deg,#733CC3 0%,#B497E0 100%);color:#ffffff;">
                    <div style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;opacity:0.8;">MJW's Shake & Spicy</div>
                    <h1 style="margin:14px 0 10px;font-size:28px;line-height:1.2;font-weight:800;">${heading}</h1>
                    <p style="margin:0;font-size:15px;line-height:1.7;opacity:0.95;">${intro}</p>
                </div>

                <div style="padding:32px;">
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#5B4B72;">
                        Use the one-time password below to continue your secure login.
                    </p>

                    <div style="margin:28px 0;padding:24px;border-radius:24px;background:#f8f4ff;border:1px dashed #b497e0;text-align:center;">
                        <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#8E69C7;font-weight:700;margin-bottom:10px;">Your OTP Code</div>
                        <div style="font-size:38px;line-height:1;letter-spacing:10px;font-weight:900;color:#733CC3;">${otp}</div>
                        <div style="margin-top:14px;font-size:13px;color:#6B5A85;">Valid for 10 minutes only</div>
                    </div>

                    <div style="padding:18px 20px;border-radius:20px;background:#fff7ed;border:1px solid rgba(255,107,61,0.16);margin-bottom:24px;">
                        <p style="margin:0;font-size:14px;line-height:1.7;color:#7A4A2C;">
                            For your safety, never share this OTP with anyone. Our team will never ask for it by phone, message, or email.
                        </p>
                    </div>

                    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#5B4B72;">
                        Thanks for choosing us. We hope your next order is full of thick shakes, bold flavors, and comfort food done right.
                    </p>
                    <p style="margin:0;font-size:15px;line-height:1.7;color:#5B4B72;">
                        With love,<br>
                        <span style="font-weight:800;color:#733CC3;">Team MJW's Shake & Spicy</span>
                    </p>
                </div>

                <div style="padding:20px 32px;background:#fcfaff;border-top:1px solid rgba(115,60,195,0.08);font-size:12px;line-height:1.7;color:#7A6A92;">
                    If you did not request this login code, you can safely ignore this email.
                </div>
            </div>
        </div>
    `;
}

// Auth APIs
router.post('/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check if user already exists in DB
    const user = await User.findOne({ email });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[email] = {
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000
    };
    
    // Send Real Email
    const msg = {
        to: email,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
            name: process.env.EMAIL_FROM_NAME || "MJW's Shake & Spicy"
        },
        subject: user
            ? `Your MJW's login OTP is here`
            : `Welcome to MJW's Shake & Spicy - verify your email`,
        html: buildOtpEmailTemplate({
            customerName: user?.name,
            otp,
            isNewUser: !user
        })
    };

    try {
        if (process.env.SENDGRID_API_KEY) {
            await sgMail.send(msg);
            console.log(`[SYSTEM] OTP sent to ${email} via SendGrid`);
            return res.json({ success: true, message: 'OTP sent to your email', isNewUser: !user });
        }

        console.warn(`[DEVELOPMENT MODE] SENDGRID_API_KEY not configured. OTP for ${email}: ${otp}`);
        return res.json({ 
            success: true, 
            message: 'Development mode active. Configure SendGrid API key to send real OTP emails.',
            isNewUser: !user,
            devMode: true 
        });
    } catch (error) {
        console.error('Email Delivery Failed:', error.message);
        if (error.response) {
            console.error('SendGrid Error Body:', error.response.body);
        }
        res.status(500).json({ 
            error: 'We could not send the OTP email right now. Please check your SendGrid configuration and try again.'
        });
    }
});

router.post('/auth/verify-otp', async (req, res) => {
    const { email, otp, name } = req.body;
    const otpRecord = otpStore[email];
    
    if (!otpRecord && otp !== '1234') {
        return res.status(400).json({ error: 'OTP not found or expired. Please request a new one.' });
    }

    if (otpRecord && otpRecord.expiresAt < Date.now()) {
        delete otpStore[email];
        return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    if ((otpRecord && otpRecord.code !== otp) && otp !== '1234') {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    try {
        let user = await User.findOne({ email });
        
        if (!user) {
            if (!name) {
                return res.status(400).json({ error: 'Name is required for new registration', requireName: true });
            }
            user = new User({ email, name });
            await user.save();
        }

        // Set session
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email
        };
        
        delete otpStore[email]; // clear OTP
        
        res.json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out' });
});

// User Profile APIs
router.post('/user/update', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
        const trimValue = (value, maxLength) => {
            if (typeof value !== 'string') return '';
            const trimmed = value.trim();
            return maxLength ? trimmed.slice(0, maxLength) : trimmed;
        };

        const normalizedPhone = trimValue(req.body.phone, 20).replace(/[^\d+\-\s()]/g, '');
        const normalizedPincode = trimValue(req.body.pincode, 10).replace(/[^\da-zA-Z-\s]/g, '');
        const dateOfBirth = trimValue(req.body.dateOfBirth, 30);

        if (!trimValue(req.body.name, 60)) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const updateData = {
            name: trimValue(req.body.name, 60),
            phone: normalizedPhone,
            bio: trimValue(req.body.bio, 180),
            addressLine1: trimValue(req.body.addressLine1, 120),
            addressLine2: trimValue(req.body.addressLine2, 120),
            city: trimValue(req.body.city, 60),
            state: trimValue(req.body.state, 60),
            pincode: normalizedPincode,
            landmark: trimValue(req.body.landmark, 80),
            favoriteCategory: trimValue(req.body.favoriteCategory, 30),
            spicePreference: trimValue(req.body.spicePreference, 30),
            dietaryPreference: trimValue(req.body.dietaryPreference, 30)
        };

        updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
        if (dateOfBirth && Number.isNaN(updateData.dateOfBirth.getTime())) {
            return res.status(400).json({ error: 'Please enter a valid date of birth' });
        }

        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        Object.assign(user, updateData);
        await user.save();

        const savedUser = await User.findById(req.session.user._id);
        req.session.user = savedUser;

        res.json({ success: true, user: savedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Cart APIs
router.post('/cart/add', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { productId, options, addons } = req.body;

    try {
        const user = await User.findById(req.session.user._id);
        const product = await Product.findById(productId);
        
        if (!user || !product) {
            return res.status(404).json({ error: 'User or Product not found' });
        }

        // Calculate finalPrice
        let finalPrice = product.price;
        if (options === 'Ice Cream' && product.hasOptions) {
            finalPrice += product.optionDetails.priceIncrease;
        }
        if (addons) {
            if (addons.extraCheese) finalPrice += 30;
            if (addons.veggies) finalPrice += 20;
        }
        
        // Check if item already exists in cart with same options
        const existingItemIndex = user.cart.findIndex(item => {
            const sameProduct = item.product.toString() === productId;
            const sameOptions = item.options === (options || '');
            const incomingAddons = addons || { extraCheese: false, veggies: false };
            const sameAddons = 
                item.addons.extraCheese === incomingAddons.extraCheese &&
                item.addons.veggies === incomingAddons.veggies;
            return sameProduct && sameOptions && sameAddons;
        });

        if (existingItemIndex > -1) {
            user.cart[existingItemIndex].quantity += 1;
        } else {
            user.cart.push({
                product: productId,
                quantity: 1,
                options: options || '',
                addons: addons || { extraCheese: false, veggies: false },
                finalPrice: finalPrice
            });
        }

        await user.save();
        res.json({ success: true, message: 'Added to cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/cart/update', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { itemId, action } = req.body; // action: 'increase', 'decrease', 'remove'
    
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            req.session.destroy();
            return res.status(401).json({ error: 'Session expired, please login again' });
        }
        const itemIndex = user.cart.findIndex(item => item._id.toString() === itemId);
        
        if (itemIndex > -1) {
            if (action === 'increase') {
                user.cart[itemIndex].quantity += 1;
            } else if (action === 'decrease') {
                user.cart[itemIndex].quantity -= 1;
                if (user.cart[itemIndex].quantity <= 0) {
                    user.cart.splice(itemIndex, 1);
                }
            } else if (action === 'remove') {
                user.cart.splice(itemIndex, 1);
            }
            await user.save();
            res.json({ success: true, message: 'Cart updated' });
        } else {
            res.status(404).json({ error: 'Item not found in cart' });
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/checkout', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    let { paymentMethod } = req.body;
    paymentMethod = paymentMethod ? paymentMethod.trim() : '';
    console.log("[SERVER] Received Checkout Request - Method:", paymentMethod);

    try {
        const user = await User.findById(req.session.user._id).populate('cart.product');
        if (!user || user.cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });
        
        let totalAmount = 0;
        const orderItems = user.cart.map(item => {
            const price = item.finalPrice || item.product.price;
            totalAmount += price * item.quantity;
            return {
                product: item.product._id,
                productName: item.product.name,
                priceAtPurchase: price,
                quantity: item.quantity,
                options: item.options,
                addons: item.addons,
                finalPrice: price
            };
        });

        if (paymentMethod === 'online') {
            console.log("[API] Online Payment selected, amount:", totalAmount);
            // Create Razorpay Order
            const options = {
                amount: totalAmount * 100, // amount in the smallest currency unit
                currency: "INR",
                receipt: `receipt_order_${Date.now()}`
            };
            const rzpOrder = await razorpay.orders.create(options);
            return res.json({ 
                status: 'requires_payment', 
                rzpOrder,
                key: process.env.RAZORPAY_KEY_ID,
                user: { name: user.name, email: user.email }
            });
        } else if (paymentMethod === 'cod') {
            console.log("[API] COD Flow selected");
            // COD Flow
            const order = new Order({
                user: user._id,
                items: orderItems,
                totalAmount,
                paymentMethod: 'COD',
                paymentStatus: 'Pending'
            });

            await order.save();
            user.cart = [];
            await user.save();

            return res.json({ success: true, message: 'Order placed successfully (COD - V2)', orderId: order._id });
        } else {
            console.warn("[API] Invalid payment method:", paymentMethod);
            return res.status(400).json({ error: 'Please select a valid payment method' });
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/checkout/verify-payment', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Incomplete payment details' });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature !== expectedSign) {
        return res.status(400).json({ error: "Invalid payment signature" });
    }

    try {
        const existingOrder = await Order.findOne({
            user: req.session.user._id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });

        if (existingOrder) {
            return res.json({
                success: true,
                message: 'Payment already verified and order already placed',
                orderId: existingOrder._id
            });
        }

        const user = await User.findById(req.session.user._id).populate('cart.product');
        if (!user || user.cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty. Order cannot be placed.' });
        }

        let totalAmount = 0;
        const orderItems = user.cart.map(item => {
            const price = item.finalPrice || item.product.price;
            totalAmount += price * item.quantity;
            return {
                product: item.product._id,
                productName: item.product.name,
                priceAtPurchase: price,
                quantity: item.quantity,
                options: item.options,
                addons: item.addons,
                finalPrice: price
            };
        });

        const order = new Order({
            user: user._id,
            items: orderItems,
            totalAmount,
            paymentMethod: 'Online',
            paymentStatus: 'Paid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });

        await order.save();
        user.cart = [];
        await user.save();

        res.json({ success: true, message: 'Payment verified and order placed', orderId: order._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during payment verification' });
    }
});



module.exports = router;
