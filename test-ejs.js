const ejs = require('ejs');

const data = {
    user: { name: '', phone: '1234567890' },
    orders: [],
    totalSpent: 0,
    locals: { cartCount: 0 }
};

ejs.renderFile('views/user.ejs', data, (err, html) => {
    if (err) {
        console.error('EJS Render Error:', err.message);
    } else {
        console.log('EJS Render Success');
    }
});
