# ShopEZ API Documentation

Base URL: `http://localhost:5000/api/v1`

---

## Authentication (`/auth`)

### `POST /auth/register`
Creates a new user account.
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response** `201 Created`: Returns user object and sets `httpOnly` refresh cookie.

### `POST /auth/login`
Authenticates a user.
- **Body**: `{ "email": "...", "password": "..." }`
- **Response** `200 OK`: Returns JWT `accessToken` and user object.

### `POST /auth/refresh`
Refreshes an expired access token using the `httpOnly` cookie.
- **Headers**: Automatically sends Cookies.
- **Response** `200 OK`: Returns new JWT `accessToken`.

---

## Products (`/products`)

### `GET /products`
Retrieves a paginated list of active products. Supports text search and filtering.
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Full-text search string
  - `category`: Filter by category slug
  - `minPrice` / `maxPrice`: Filter by price range
- **Response** `200 OK`: Returns array of products and pagination metadata.

### `GET /products/:slug`
Retrieves detailed information for a single product.

---

## Orders (`/orders`)
*Requires Bearer Token Authorization*

### `POST /orders`
Creates a new order based on the user's cart.
- **Body**:
  ```json
  {
    "items": [{ "productId": "...", "quantity": 1 }],
    "shippingAddress": {
      "fullName": "John Doe",
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "MH",
      "pinCode": "400001"
    },
    "paymentMethod": "card"
  }
  ```
- **Response** `201 Created`: Returns created order details.

### `GET /orders`
Retrieves the logged-in user's order history.

### `GET /orders/:id`
Retrieves details of a specific order (only if it belongs to the user or if requester is Admin).

---

## Admin (`/admin`)
*Requires Bearer Token Authorization + `admin` or `vendor` role*

### `GET /admin/stats`
Retrieves KPI statistics (total revenue, active users, total orders) for the dashboard.

### `PATCH /admin/orders/:id/status`
Updates the fulfillment status of an order.
- **Body**: `{ "status": "shipped" }`

### `PATCH /admin/products/:id/approve`
Approves a vendor-submitted product to go live on the public storefront.
