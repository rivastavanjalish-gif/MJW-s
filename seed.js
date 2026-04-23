const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/aman-frontend')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.log(err));

const seedData = [
    // Shakes
    ...[
        { name: "Green Apple", desc: "Crisp and refreshing green apple blend with a tangy kick.", img: "green.avif" },
        { name: "Strawberry", desc: "Classic sweet and creamy strawberry delight.", img: "strawbry.avif" },
        { name: "Black Current", desc: "Rich and fruity black currant shake packed with antioxidants.", img: "blackcurrent.avif" },
        { name: "Banana", desc: "Thick and energy-boosting classic banana smoothie.", img: "banana.avif" },
        { name: "Papaya", desc: "Tropical papaya blend, smooth and healthy.", img: "papaya.jpg" },
        { name: "Choco", desc: "Indulgent and rich chocolate fantasy for the sweet tooth.", img: "choco.avif" },
        { name: "Mango", desc: "The king of fruits blended into a thick, sweet summer treat.", img: "mango.jpg" },
        { name: "Cold Coffee", desc: "Chilled, frothy coffee blend for the perfect caffeine hit.", img: "coldcoffee.avif" },
        { name: "Kiwi", desc: "Exotic and tangy green kiwi sensation.", img: "kiwi.avif" },
        { name: "Ras Malai", desc: "Traditional Indian dessert flavor in a rich, creamy shake.", img: "rasmalai.jpg" },
        { name: "Jamun", desc: "Unique and mildly tart Indian blackberry cooler.", img: "jamun.jpg" },
        { name: "Kitkat", desc: "Crunchy wafer and chocolate blended into perfection.", img: "kitkat.jpg" },
        { name: "Litchi", desc: "Sweet, floral, and refreshing tropical litchi drink.", img: "litchi.jpg" },
        { name: "Thandai", desc: "Festive blend of nuts, spices, and rich milk.", img: "thandai.jpg" },
        { name: "Rose", desc: "Fragrant and visually stunning pink rose milk shake.", img: "Rose.jpg" },
        { name: "Vanilla", desc: "Simple, elegant, and timeless vanilla bean classic.", img: "vanilla.jpg" },
        { name: "Guava", desc: "Sweet and slightly tart tropical guava delight.", img: "guava.jpg" },
        { name: "Beel", desc: "Cooling wood apple blend, perfect for hot summers.", img: "beel.jpg" },
        { name: "Paan", desc: "Refreshing betel leaf and sweet rose petal fusion.", img: "paan.webp" },
        { name: "Kesar Elaichi", desc: "Aromatic saffron and cardamom infused royal milk.", img: "keshar.jpg" },
        { name: "Oreo", desc: "Cookies and cream wonderland in a glass.", img: "oreo.jpg" },
        { name: "Chiku", desc: "Naturally sweet and malty sapodilla smoothie.", img: "chiku.png" },
        { name: "Brahmi Badaam", desc: "Healthy and brain-boosting almond and herb fusion.", img: "brahmi.jpg" }
    ].map(item => ({
        name: item.name,
        price: 60,
        category: 'Shakes',
        description: item.desc,
        imageUrl: `/asset/${item.img}`,
        hasOptions: true,
        optionDetails: { name: 'Ice Cream', priceIncrease: 20 }
    })),
    // Snacks
    { name: "Aloo Patties", price: 20, category: "Snacks" },
    { name: "Spl. Grilled Patties", price: 30, category: "Snacks" },
    { name: "Gr Corn Cheese Patties", price: 40, category: "Snacks" },
    { name: "Gr Paneer Cheese Patties", price: 50, category: "Snacks" },
    { name: "Gr Mozarella Patties", price: 60, category: "Snacks" },
    // Sandwiches
    { name: "Grilled Sandwich", price: 60, category: "Sandwiches" },
    { name: "Gr Corn Cheese Sandwich", price: 70, category: "Sandwiches" },
    { name: "Gr Paneer Cheese Sandwich", price: 75, category: "Sandwiches" },
    { name: "Veg Cold Sandwich", price: 40, category: "Sandwiches" },
    // Burgers
    { name: "Grilled Burger", price: 50, category: "Burgers", description: "Classic veggie patty with secret herb grill sauce." },
    { name: "Shahi Cheese Burger", price: 70, category: "Burgers", description: "Royal cheese infusion with creamy mayo and fresh greens." },
    { name: "Shahi Paneer Cheese Burger", price: 90, category: "Burgers", description: "The ultimate feast. Marinated paneer chunks with double cheese." },
    // Pizza
    { name: "Onion Plus", price: 120, category: "Pizza" },
    { name: "Corn Cheese", price: 150, category: "Pizza" },
    { name: "Paneer Cheese", price: 160, category: "Pizza" },
    { name: "Double Cheese", price: 180, category: "Pizza" },
    { name: "Margherita", price: 190, category: "Pizza" },
    { name: "Mushroom Cheese", price: 210, category: "Pizza" },
    { name: "Cheese Burst", price: 250, category: "Pizza" }
    
];

async function runSeed() {
    await Product.deleteMany({});
    console.log('Cleared existing products');
    await Product.insertMany(seedData);
    console.log(`Inserted ${seedData.length} products`);
    process.exit();
}

runSeed();
