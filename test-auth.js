const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/aman-frontend')
  .then(async () => {
    console.log("Connected to MongoDB.");
    
    // 1. Create a user
    const mockPhone = "9999999999";
    await User.deleteMany({ phone: mockPhone });
    
    let user = new User({ phone: mockPhone, name: "Test User" });
    await user.save();
    console.log("User created:", user);

    // 2. Fetch the user back
    let foundUser = await User.findOne({ phone: mockPhone });
    console.log("User found:", foundUser ? "Yes" : "No", foundUser?.name);
    
    mongoose.connection.close();
  });
