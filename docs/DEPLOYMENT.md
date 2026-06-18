# Deployment Guide

This guide outlines the recommended approach for deploying ShopEZ to a production environment using modern hosting platforms.

---

## 1. Database: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, whitelist your backend IP address (or `0.0.0.0/0` if your backend uses dynamic IPs).
3. Under **Database Access**, create a user and generate a secure password.
4. Copy the Connection String. It will look like:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopez?retryWrites=true&w=majority`

---

## 2. Backend: Render (or Heroku)
The Node.js Express server should be deployed as a Web Service.

1. Create a new "Web Service" on [Render](https://render.com/).
2. Connect your GitHub repository and set the Root Directory to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. **Environment Variables**: Add all the variables from your local `.env`, ensuring you generate strong, random strings for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
   - `MONGO_URI` = *Your Atlas Connection String*
   - `NODE_ENV` = `production`
6. Deploy the service. Once live, copy the Render URL (e.g., `https://shopez-api.onrender.com`).

---

## 3. Frontend: Vercel (or Netlify)
The React/Vite client should be deployed as a static site.

1. Log into [Vercel](https://vercel.com/) and Import your GitHub repository.
2. Set the Root Directory to `client`.
3. Vercel will automatically detect the Vite framework.
4. **Environment Variables**:
   - `VITE_API_URL` = `https://shopez-api.onrender.com/api/v1` *(The Render URL from Step 2)*
5. Deploy.

### ⚠️ Important Note regarding Cookies
Because JWT Refresh Tokens are sent via `httpOnly` cookies, the Frontend and Backend **must** share the same top-level domain in production to avoid cross-site cookie blocking by modern browsers (like Safari's ITP).

**Correct Setup:**
- Frontend: `https://shopez.com`
- Backend: `https://api.shopez.com`

If deploying to different domains (e.g., `vercel.app` and `onrender.com`), you must configure the backend's `CORS` settings strictly to allow credentials, and set cookie `SameSite=None; Secure=true`.
