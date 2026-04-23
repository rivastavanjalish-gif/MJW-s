const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Middleware to calculate total cart items
router.use(async (req, res, next) => {
    let cartCount = 0;
    if (req.session.user) {
        try {
            const user = await User.findById(req.session.user._id);
            if (user && user.cart) {
                cartCount = user.cart.reduce((acc, item) => acc + item.quantity, 0);
            }
        } catch(e) {
            console.error(e);
        }
    }
    res.locals.cartCount = cartCount;
    next();
});

router.get('/', (req, res) => {
    // Render landing page
    res.render('landing_page');
});

router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/menu');
    }
    // Get referer to redirect back after login
    const returnTo = req.query.returnTo || req.headers.referer || '/menu';
    res.render('login', { returnTo: returnTo.includes('/login') ? '/menu' : returnTo });
});

router.get('/menu', async (req, res) => {
    try {
        const shakes = await Product.find({ category: 'Shakes' });
        const snacks = await Product.find({ category: 'Snacks' });
        const sandwiches = await Product.find({ category: 'Sandwiches' });
        const burgers = await Product.find({ category: 'Burgers' });
        const pizza = await Product.find({ category: 'Pizza' });

        res.render('menu', { shakes, snacks, sandwiches, burgers, pizza });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.get('/cart', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(req.session.user._id).populate('cart.product');
        if (!user) {
            req.session.destroy();
            return res.redirect('/login');
        }
        let subtotal = 0;
        user.cart.forEach(item => {
            if (item.product) {
                const itemPrice = item.finalPrice || item.product.price;
                subtotal += (itemPrice * item.quantity);
            }
        });
        
        res.render('cart', { user, cartItems: user.cart, subtotal });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/sidebar', (req, res) => {
    res.render('sidebar');
});

router.get('/user', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            req.session.destroy();
            return res.redirect('/login');
        }
        
        const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
        
        let totalSpent = 0;
        orders.forEach(o => totalSpent += o.totalAmount);

        const completionFields = [
            user.name,
            user.phone,
            user.bio,
            user.addressLine1,
            user.city,
            user.state,
            user.pincode,
            user.favoriteCategory,
            user.spicePreference,
            user.dietaryPreference
        ];
        const completedCount = completionFields.filter(Boolean).length;
        const profileCompletion = Math.round((completedCount / completionFields.length) * 100);
        
        res.render('user', { user, orders, totalSpent, profileCompletion });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
