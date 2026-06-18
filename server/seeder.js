require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables config
require('./config/env');
const connectDB = require('./config/db');

// Load Models
const User = require('./models/user.model');
const Category = require('./models/Category.model');
const Product = require('./models/product.model');
const Order = require('./models/order.model');

// Load Data
const users = require('./data/users');
const categories = require('./data/categories');
const products = require('./data/products');

const seedDatabase = async () => {
  try {
    // 1. Connect to DB
    await connectDB();
    console.log('📦 Connected to MongoDB. Starting database seed...');

    // 2. Drop the entire database to clear existing data and indexes
    await mongoose.connection.dropDatabase();
    console.log('🧹 Dropped existing database and indexes.');

    // 3. Hash passwords and insert Users
    const hashedUsers = await Promise.all(
      users.map(async (u) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        return { ...u, password: hashedPassword };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`👤 Inserted ${createdUsers.length} users.`);

    const adminUser = createdUsers.find(u => u.role === 'admin');
    const vendors = createdUsers.filter(u => u.role === 'vendor');
    const customers = createdUsers.filter(u => u.role === 'customer');

    // 4. Insert Categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`📂 Inserted ${createdCategories.length} categories.`);

    // Map categories by slug for easy lookup
    const categoryMap = createdCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat._id;
      return acc;
    }, {});

    // 5. Insert Products
    // Assign a vendor and category ObjectId to each product
    const productPromises = products.map((product) => {
      // Find matching category by lowercase name
      const category = createdCategories.find((c) => c.name.toLowerCase() === product.category.toLowerCase()) || createdCategories[0];

      return Product.create({
        ...product,
        vendor: vendors[Math.floor(Math.random() * vendors.length)]._id,
        category: category._id,
        status: 'active', // Products must be active to show on the frontend
        isApproved: true,
      });
    });

    const createdProducts = await Promise.all(productPromises);
    console.log(`🛍️ Inserted ${createdProducts.length} products.`);

    // 6. Generate and Insert 15 Orders
    const orders = [];
    const statuses = ['pending', 'shipped', 'delivered'];

    for (let i = 0; i < 15; i++) {
      // Pick a random customer
      const customer = customers[Math.floor(Math.random() * customers.length)];
      
      // Pick 1 to 3 random products
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        
        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.basePrice, // Snapshot price based on basePrice
          quantity: quantity,
          image: product.images[0],
          vendor: product.vendor
        });

        totalAmount += product.basePrice * quantity;
      }

      orders.push({
        user: customer._id,
        orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        items: orderItems,
        shippingAddress: {
          fullName: customer.name,
          phone: '555-0198',
          line1: `${Math.floor(Math.random() * 900) + 100} Main St`,
          city: 'Metropolis',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        },
        paymentMethod: 'card',
        subtotal: totalAmount,
        totalAmount: totalAmount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random date in the past
      });
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`📦 Inserted ${createdOrders.length} orders.`);

    console.log('✅ Database Seeding Completed Successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

const destroyDatabase = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB.');

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    
    console.log('🧹 All data destroyed.');
    process.exit();
  } catch (error) {
    console.error('❌ Error destroying data:', error);
    process.exit(1);
  }
};

// Check CLI arguments
if (process.argv[2] === '-d') {
  destroyDatabase();
} else {
  seedDatabase();
}
