require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const path = require('path');

// routes imports here
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');

const app = express();
app.use(cors())

// Database Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aman-frontend';

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// App Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/asset', express.static(path.join(__dirname, 'asset')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Setup
app.use(session({
    secret: 'shake_and_spicy_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUri,
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        secure: false, // Set to true if using HTTPS
        httpOnly: true
    }
}));

// Global variable for view templates (user session)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.adminEmail = process.env.ADMIN_EMAIL || 'lakshyagrover27@gmail.com';
    next();
});

// Routes
app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
