const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/aman-frontend')
  .then(async () => {
    let phone = "9999999999";
    let user = await User.findOne({ phone });
    console.log("Found user:", user ? user.name : "null");
    
    // mimic verify-otp
    let name = ""; // client didn't send name
    if (!user) {
        if (!name) {
            console.log("Requires name!");
        }
    } else {
        console.log("Login successful!");
    }
    
    mongoose.connection.close();
  });
