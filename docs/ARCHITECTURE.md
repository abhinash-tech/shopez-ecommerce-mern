# System Architecture & Database Design

ShopEZ is built on a scalable, monolithic MERN stack architecture with clear separation of concerns.

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    Client[React SPA Client]
    Client -->|Axios HTTP Requests| API_Gateway(Express API Gateway / Router)
    
    subgraph Node.js Backend
        API_Gateway --> Middleware[Security & Auth Middleware]
        Middleware --> Controllers[Controllers]
        Controllers --> Services[Business Logic Services]
        Services --> Models[Mongoose Models]
    end
    
    Models -->|Mongoose Queries| Database[(MongoDB)]
    
    Client -.->|State Management| Context(React Context API)
    Client -.->|Persists Cart| LocalStorage[(Browser LocalStorage)]
```

## 2. Security Flow (JWT Authentication)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: Enters Credentials
    Frontend->>Backend: POST /auth/login
    Backend->>DB: Validate Hash
    Backend-->>Frontend: Returns AccessToken (JSON) + sets httpOnly RefreshToken Cookie
    
    User->>Frontend: Browses App
    Frontend->>Backend: GET /orders (Bearer AccessToken)
    
    alt Token Expired
        Backend-->>Frontend: 401 Unauthorized
        Frontend->>Backend: POST /auth/refresh (auto-sends Cookie)
        Backend-->>Frontend: 200 OK (New AccessToken)
        Frontend->>Backend: Retry GET /orders
    end
```

## 3. Database Entity Relationship Diagram (ERD)

The database schema is designed to ensure historical immutability. When an order is placed, product prices and names are "frozen" in the Order document so that future price changes do not alter historical receipts.

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email
        String passwordHash
        String role "customer|vendor|admin"
        Date createdAt
    }

    PRODUCT {
        ObjectId _id PK
        ObjectId vendorId FK
        String name
        String slug
        String description
        Number price "Stored in paise/cents"
        Number stock
        String category
        Boolean isApproved
    }

    ORDER {
        ObjectId _id PK
        ObjectId userId FK
        Number totalAmount
        String status "pending|shipped|delivered|cancelled"
        Object shippingAddress
        Date createdAt
    }

    ORDER_ITEM {
        ObjectId productId FK
        String name "Snapshot name"
        Number price "Snapshot price"
        Number quantity
    }

    USER ||--o{ ORDER : places
    USER ||--o{ PRODUCT : "vendors (creates)"
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : references
```
