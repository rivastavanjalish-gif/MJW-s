const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.email === (process.env.ADMIN_EMAIL || 'lakshyagrover27@gmail.com')) {
        next();
    } else {
        res.status(403).render('error', { 
            message: 'Access Denied', 
            error: { status: 403, stack: 'You do not have permission to access the Admin Panel.' } 
        });
    }
};

router.use(isAdmin);

router.get('/', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const orders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('user');
        const revenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;

        res.render('admin/overview_page', { 
            totalOrders, 
            totalUsers, 
            totalRevenue, 
            orders 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('user');
        res.render('admin/order_management', { orders });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get('/inventory', async (req, res) => {
    try {
        const products = await Product.find();
        const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0); // Simplified for now, in real apps it would be price * stock
        res.render('admin/inventory', { products, totalValue });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin/user_management', { users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get('/analytics', async (req, res) => {
    try {
        // 1. Total Stats (All non-cancelled orders)
        const totalRevenueResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
        const totalOrders = await Order.countDocuments({ status: { $ne: 'Cancelled' } });
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // 2. Revenue Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const trend = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyTotal: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3. Category Mix
        const categoryMix = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    value: { $sum: 1 }
                }
            }
        ]);

        // 4. Top Selling Items
        const topItems = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productName",
                    count: { $sum: "$items.quantity" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 5. Detailed Revenue Metrics
        const revenueMetricsResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: null,
                    onlinePaid: { 
                        $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0] } 
                    },
                    onlinePending: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$paymentMethod", "Online"] }, { $eq: ["$paymentStatus", "Pending"] }] }, "$totalAmount", 0] }
                    },
                    codReceived: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$paymentMethod", "COD"] }, { $eq: ["$status", "Delivered"] }] }, "$totalAmount", 0] }
                    },
                    codPending: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$paymentMethod", "COD"] }, { $ne: ["$status", "Delivered"] }] }, "$totalAmount", 0] }
                    }
                }
            }
        ]);
        const metrics = revenueMetricsResult.length > 0 ? revenueMetricsResult[0] : { onlinePaid: 0, onlinePending: 0, codReceived: 0, codPending: 0 };

        res.render('admin/analytics', {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            trend: trend || [],
            categoryMix: categoryMix || [],
            topItems: topItems || [],
            metrics
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// API for updating order status
router.post('/orders/update-status', async (req, res) => {
    const { orderId, status } = req.body;
    try {
        await Order.findByIdAndUpdate(orderId, { status });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API for inventory
router.post('/inventory/add', async (req, res) => {
    const { name, price, category, description, imageUrl } = req.body;
    try {
        const newProduct = new Product({
            name,
            price: Number(price),
            category,
            description,
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1000'
        });
        await newProduct.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/inventory/update', async (req, res) => {
    const { productId, name, price, category, description, imageUrl } = req.body;
    try {
        await Product.findByIdAndUpdate(productId, { 
            name, 
            price: Number(price), 
            category,
            description,
            imageUrl
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/inventory/delete', async (req, res) => {
    const { productId } = req.body;
    try {
        await Product.findByIdAndDelete(productId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/inventory/toggle-availability', async (req, res) => {
    const { productId, isAvailable } = req.body;
    try {
        await Product.findByIdAndUpdate(productId, { isAvailable });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/users/delete', async (req, res) => {
    const { userId } = req.body;
    try {
        await User.findByIdAndDelete(userId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
