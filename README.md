# ShopEZ E-Commerce Platform

ShopEZ is a full-stack, multi-vendor e-commerce platform built using the MERN stack (MongoDB, Express, React, Node.js). 

This project is designed to provide a straightforward and secure online shopping experience. It features two distinct areas: a public storefront for customers to browse and buy products, and a private admin dashboard for managing the store.

---

## Key Features

### For Customers
- **Public Storefront**: Browse products by category, search for specific items, and view detailed product information.
- **Secure Authentication**: Create an account and log in securely.
- **Cart & Checkout**: Add items to a shopping cart, proceed through a multi-step checkout process, and place orders.
- **User Dashboard**: Track past orders and manage your profile settings.

### For Administrators
- **Admin Command Center**: A dedicated portal accessible only to administrators.
- **Dashboard Overview**: View live statistics on total revenue, orders, products, and registered customers.
- **Product Management**: Add new products, update existing ones, and manage inventory stock levels.
- **Order Management**: Track customer orders and update their status (e.g., from Processing to Shipped or Delivered).
- **Customer Management**: View the list of registered users and remove accounts if necessary.

---

## Technologies Used

### Frontend
- **React 18**: Core library for building the user interface.
- **Vite**: Fast frontend build tool.
- **React Router DOM**: Handles navigation between different pages.
- **Context API**: Manages global state for things like the user's cart and authentication status.
- **Vanilla CSS**: Custom styling using CSS modules for scoped, maintainable code.

### Backend
- **Node.js & Express**: Powers the REST API server.
- **MongoDB & Mongoose**: NoSQL database for storing products, users, and orders.
- **JSON Web Tokens (JWT)**: Used for secure user authentication.
- **Bcrypt**: Hashes passwords for database security.

---

## How to Install and Run Locally

Follow these instructions to run the application on your own computer.

### Prerequisites
Make sure you have installed:
- Node.js (version 18 or above)
- MongoDB (Running locally or a cloud instance like MongoDB Atlas)
- Git

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/yourusername/shopez.git
cd shopez
```

### 2. Set Up the Backend
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder and add the following configuration:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database Connection
MONGO_URI=your_mongodb_connection_string

# Authentication Secrets
JWT_ACCESS_SECRET=your_access_token_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Start the backend server:
```bash
npm run dev
```

### 3. Set Up the Frontend
Open a new terminal window, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Start the frontend server:
```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## Project Structure

- `/client` - Contains all the React frontend code (components, pages, services).
- `/server` - Contains the Express backend code (controllers, models, routes).

---

## Future Enhancements
- Integration with payment gateways like Stripe for processing real transactions.
- A review system for customers to rate products.
- Real-time order tracking notifications.
