# 🚀 FocusBeats Backend API

This is a high-performance, secure Express-based REST API for [FocusBeats](https://github.com/TrishaMohanty/FocusBeats). It provides robust authentication, task management, focus tracking, and visual analytics.

---

## 🛠️ Tech Stack & Security

- **Core**: [Express.js](https://expressjs.com/) & [Node.js](https://nodejs.org/) (ES Modules)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Security**: 
    - **Helmet**: Secures HTTP headers to prevent common vulnerabilities.
    - **Rate Limiting**: Protects against brute-force and DDoS attacks.
    - **Zod**: Strict type-safe request validation.
- **Authentication**: JWT (JSON Web Tokens) & BcryptJS
- **DX (DevExp)**: 
    - **Morgan**: Detailed HTTP request logging.
    - **Async Handler**: Centralized error management to remove 90% of boilerplate `try/catch`.

---

## 📂 Folder Structure

- `server.js`: Clean entry point utilizing modular middleware and config.
- `config/`: 
    - `db.js`: Centralized database connection logic with robust error handling.
- `middleware/`:
    - `authMiddleware.js`: JWT verification.
    - `validationMiddleware.js`: Zod-based request pre-validation.
    - `errorMiddleware.js`: Standardized global JSON error responses.
- `models/`: Mongoose schemas (User, Task, Session, etc.).
- `routes/`: Feature-extracted API endpoints.
- `seed.js`: Script for database initialization.

---

## 🔌 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Create a new user account (Validated by Zod).
- `POST /api/auth/login` - Authenticate user and receive JWT (Validated by Zod).
- `GET /api/auth/me` - Get current user profile (Private).

### 📋 Tasks
- `GET /api/tasks` - Fetch all user tasks.
- `POST /api/tasks` - Create a new task.
- `PUT /api/tasks/:id` - Update an existing task.
- `DELETE /api/tasks/:id` - Remove a task.

[... other endpoints remain consistent with the root documentation ...]

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community)

### 2. Environment Variables
Create a `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### 3. Installation & Usage
```bash
# Install optimized dependencies
npm install

# Start development server with Morgan logging
npm run dev
```

---

## 📄 License
This backend is part of the FocusBeats project and is licensed under the [MIT License](../LICENSE).
