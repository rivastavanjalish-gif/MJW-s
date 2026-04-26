# 🍹✨ Stitch – Full Stack Food Ordering App

> 🚀 A modern **full-stack food ordering web application** built with Node.js, Express, MongoDB, and EJS — designed for smooth user experience and powerful admin control.

---

## 🌐 Live Links

🚀 **Live Demo:**
👉 https://mjw-shakeandspicyzone.onrender.com/

📂 **GitHub Repo:**
👉 https://github.com/rivastavanjalish-gif/MJW-s.git

---

## 🔥 Highlights

✨ Full-stack production-ready app
🍔 Dynamic food catalog (Shakes, Pizza, Burgers & more)
🛒 Real-time cart & order system
🔐 Secure authentication (session-based)
💳 Razorpay payment integration
📧 Email notifications system
🧑‍💼 Admin dashboard with protected routes

---

## ✨ Key Features

### 🔐 Authentication System

* Session-based login
* OTP-style logic support
* Secure user sessions

### 🍔 Dynamic Food Menu

* Categories: Shakes 🍹, Snacks 🍟, Sandwiches 🥪, Burgers 🍔, Pizza 🍕
* Add-ons support (e.g., Ice Cream)

### 🛒 Cart & Ordering

* Add to cart
* Update/remove items
* Order placement system

### 🧑‍💼 Admin Panel

* Manage products
* Manage users
* Protected admin routes

### 💳 Payments

* Razorpay integration
* Secure checkout flow

### 📧 Email System

* Nodemailer integration
* Order notifications

---

## 🧠 Tech Stack

| Layer        | Technology                      |
| ------------ | ------------------------------- |
| ⚙️ Backend   | Node.js, Express                |
| 🗄️ Database | MongoDB, Mongoose               |
| 🎨 Frontend  | EJS (SSR)                       |
| 🔐 Auth      | express-session + connect-mongo |
| 💳 Payments  | Razorpay                        |
| 📧 Email     | Nodemailer                      |

---

```
stitch/
├── models/
├── routes/
│   ├── index.js
│   ├── api.js
│   └── admin.js
├── views/
├── public/
├── asset/
├── server.js
├── seed.js
├── test-auth.js
├── test-ejs.js
└── package.json
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/rivastavanjalish-gif/MJW-s.git
cd stitch
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### ▶️ Run Locally

```bash
npm run dev
```

📍 App runs at:
http://localhost:8080

---

## 🌱 Database Setup

```bash
node seed.js
```

✔️ Seeds:

* Shakes 🍹
* Snacks 🍟
* Sandwiches 🥪
* Burgers 🍔
* Pizza 🍕

---

## 🔑 Environment Variables

Create a `.env` file:

```
MONGODB_URI=your_mongodb_uri
ADMIN_EMAIL=your_email
RAZORPAY_KEY=your_key
RAZORPAY_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
SESSION_SECRET=your_secret
```

---

## 🧪 Testing

```bash
node test-auth.js
node test-ejs.js
```

---

## 💡 Future Improvements

🚀 Order tracking system
📱 PWA / Mobile app version
⭐ Ratings & reviews
🎯 AI-based recommendations

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch (`feature-name`)
3. Commit changes
4. Push & open PR

---

## ⭐ Support

If you like this project:
👉 Give it a ⭐ on GitHub

---

## 📬 Contact

👨‍💻 GitHub: https://github.com/rivastavanjalish-gif

👨‍💻 GitHub: https://github.com/princerajoffical
