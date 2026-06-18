# Installation & Setup Guide

This guide will walk you through setting up the ShopEZ platform on your local machine for development and testing.

## Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Git**

---

## 1. Clone the Repository
```bash
git clone https://github.com/yourusername/shopez.git
cd shopez
```

## 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

### Environment Variables
Create a `.env` file in the `server/` directory and populate it with the following configuration:

```env
# Server Config
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://127.0.0.1:27017/shopez

# JWT Authentication Secrets
# (Use at least 32-character random strings)
JWT_ACCESS_SECRET=your_super_secret_access_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```
*Note: The backend runs a strict startup validation script. If any required variables are missing, the server will immediately throw an error and exit.*

### Start the Server
```bash
npm run dev
```
The backend should now be running on `http://localhost:5000`.

---

## 3. Frontend Setup
Open a new terminal window, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

### Environment Variables
Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Start the Client
```bash
npm run dev
```
The React frontend should now be running on `http://localhost:5173`.

---

## 4. Default Admin Credentials
To access the Admin Dashboard, register a normal user via the UI, then manually update their role to `admin` directly inside your MongoDB database:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
);
```
Log out and log back in to see the new Admin navigation links.
