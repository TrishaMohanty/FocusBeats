# 🚀 FocusBeats Backend API

This is the Express-based REST API for [FocusBeats](https://github.com/TrishaMohanty/FocusBeats), providing authentication, task management, focus tracking, and analytics.

---

## 🛠️ Tech Stack

- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) & BcryptJS
- **Runtime**: Node.js (ES Modules)

---

## 📂 Folder Structure

- `server.js`: The main entry point for the application.
- `models/`: Mongoose schemas for data persistence.
- `routes/`: API endpoint handlers organized by feature.
- `middleware/`: Custom Express middleware (e.g., JWT authentication).
- `config/`: Configuration settings (DB connection, etc.).
- `seed.js`: Script for initializing the database with sample data.

---

## 🔌 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate user and receive JWT.
- `GET /api/auth/user` - Get current user profile (Requires token).

### 📋 Tasks
- `GET /api/tasks` - Fetch all tasks for the logged-in user.
- `POST /api/tasks` - Create a new task.
- `PUT /api/tasks/:id` - Update an existing task.
- `DELETE /api/tasks/:id` - Remove a task.

### ⏱️ Sessions
- `GET /api/sessions` - Retrieve all study sessions.
- `POST /api/sessions` - Log a new study session.

### 📝 Planner
- `GET /api/planner` - Get all planner entries.
- `POST /api/planner` - Add a new entry to the planner.

### 🎵 Music
- `GET /api/music` - Fetch available music tracks/playlists.

### 📊 Dashboard & Analytics
- `GET /api/dashboard` - Get summarized data for the main dashboard.
- `GET /api/analytics` - Fetch detailed focus trends and metrics.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Cloud Instance)

### 2. Environment Variables
Create a `.env` file in this directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 3. Installation & Usage
```bash
# Install dependencies
npm install

# Run the seeding script (optional)
node seed.js

# Start development server
npm run dev

# Start production server
npm start
```

---

## 📄 License
This backend is part of the FocusBeats project and is licensed under the [MIT License](../LICENSE).
