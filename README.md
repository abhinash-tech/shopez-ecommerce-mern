<div align="center">
  <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80" alt="ShopEZ Banner" width="100%" style="border-radius:12px; max-height: 300px; object-fit: cover;" />
  <br/>
  <h1>🛍️ ShopEZ — Premium E-Commerce Platform</h1>
  <p>A modern, full-stack, multi-vendor e-commerce platform built with the MERN stack.</p>

  [![React](https://img.shields.io/badge/React-18-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-20-green.svg?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
</div>

---

## 📖 Project Description

ShopEZ is a robust, production-ready e-commerce solution designed to deliver a premium, seamless shopping experience. Built from the ground up using the MERN stack (MongoDB, Express, React, Node.js), it features a completely decoupled architecture separating the REST API backend from the highly responsive client-side interface. 

The platform supports **Role-Based Access Control (RBAC)**, effortlessly separating the Customer shopping journey from the Administrative management dashboard. Whether you're browsing the latest tech gadgets or managing inventory, ShopEZ provides a lightning-fast and secure environment.

---

## ✨ Features

- **🛍️ Public Storefront**: Modern UI with grid layouts, advanced product filtering, category browsing, and responsive carousels.
- **🔐 Secure Authentication**: Custom JWT (JSON Web Tokens) implementation with automated `httpOnly` cookie refresh cycles for persistent, secure login states.
- **🛒 Persistent Cart & Wishlist**: Global state management via Context API to seamlessly track user selections across sessions.
- **💳 Checkout Flow**: Multi-step checkout process with chronological order timeline tracking and order history dashboard.
- **🎛️ Admin Command Center**: Dedicated dashboard for administrators to manage inventory, track revenue KPIs, and moderate user activity.
- **🛡️ Enterprise Security**: Built-in rate limiting, helmet headers, strict input validation, and NoSQL injection prevention.
- **⚡ Performance Optimized**: React Code-splitting (Lazy loading/Suspense), Vite bundling, and backend compression middleware ensure rapid load times.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Styling**: Vanilla CSS Modules (BEM architecture) + CSS Variables
- **Network**: Axios (with custom interceptors)

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM
- **Security**: bcryptjs, jsonwebtoken, helmet, express-rate-limit
- **Architecture**: MVC (Model-View-Controller)

---

## 🚀 Installation Guide

Follow these steps to get the project running locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas cluster)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/shopez.git
cd shopez
```

### 2. Setup Backend
```bash
cd server
npm install
```
*Create a `.env` file in the `/server` directory (see Environment Variables section below).*
```bash
# Start the backend server in development mode
npm run dev
```

### 3. Setup Frontend
Open a new terminal window:
```bash
cd client
npm install
# Start the Vite development server
npm run dev
```

The application will now be running. The frontend typically runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

---

## 🔐 Environment Variables

To run this project, you will need to add the following environment variables to your `server/.env` file. A template is provided in `server/.env.example`.

**Note:** Never commit your actual `.env` file to version control. The repository's `.gitignore` is already configured to ignore it.

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/shopez?retryWrites=true&w=majority

# JWT Authentication
JWT_ACCESS_SECRET=your_super_secret_access_token_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 📁 Folder Structure

```text
📦 shopez
 ┣ 📂 client                  # React Frontend (Vite)
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 assets            # Static images and icons
 ┃ ┃ ┣ 📂 components        # Reusable UI components (Navbar, ProductCard, etc.)
 ┃ ┃ ┣ 📂 context           # Global state (AuthContext, CartContext)
 ┃ ┃ ┣ 📂 layouts           # Page wrappers (MainLayout, DashboardLayout)
 ┃ ┃ ┣ 📂 pages             # Route components (Home, Cart, Admin)
 ┃ ┃ ┣ 📂 routes            # Route definitions and ProtectedRoute guards
 ┃ ┃ ┗ 📂 services          # Axios API interceptors and fetching logic
 ┃ ┗ 📜 package.json
 ┃
 ┣ 📂 server                  # Node.js / Express Backend
 ┃ ┣ 📂 config              # DB connection and Environment variable validation
 ┃ ┣ 📂 controllers         # Route request handlers
 ┃ ┣ 📂 middlewares         # Auth, Error handling, Rate limiting
 ┃ ┣ 📂 models              # Mongoose database schemas
 ┃ ┣ 📂 routes              # Express API route definitions
 ┃ ┣ 📂 utils               # Helper functions and custom Error classes
 ┃ ┣ 📜 app.js              # Express app configuration
 ┃ ┣ 📜 server.js           # Entry point and server initialization
 ┃ ┗ 📜 package.json
 ┃
 ┗ 📜 README.md
```

---

## 📡 API Documentation

The backend exposes a structured REST API under the `/api/v1` prefix.

### Public Routes
- `GET /api/v1/products` - Retrieve all products (supports pagination & filtering)
- `GET /api/v1/products/:id` - Retrieve a single product by ID
- `POST /api/v1/auth/register` - Create a new user account
- `POST /api/v1/auth/login` - Authenticate user and receive JWT

### Protected Routes (Requires Bearer Token)
- `GET /api/v1/auth/me` - Get current authenticated user profile
- `GET /api/v1/orders/myorders` - Retrieve order history for the logged-in user
- `POST /api/v1/orders` - Create a new order

### Admin Routes (Requires Admin Role)
- `POST /api/v1/products` - Create a new product listing
- `PUT /api/v1/products/:id` - Update an existing product
- `DELETE /api/v1/products/:id` - Delete a product
- `GET /api/v1/users` - List all registered users

---

## 🚀 Future Enhancements

While ShopEZ is fully functional, here are some planned features for future iterations:
- [ ] **Payment Gateway Integration**: Direct integration with Stripe or Razorpay for seamless checkout.
- [ ] **Real-time Order Tracking**: WebSocket implementation to provide live updates on order shipping status.
- [ ] **Product Reviews & Ratings**: Allow verified buyers to leave reviews and rate products.
- [ ] **Advanced Analytics Dashboard**: Visual charts and graphs for the admin panel using libraries like Chart.js.
- [ ] **Social Login**: OAuth2 integration with Google and Facebook for quicker onboarding.

---

<div align="center">
  <p>Built with ❤️ by an enthusiastic developer.</p>
</div>
