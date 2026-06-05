<div align="center">

# 🚀 MeetTask AI

### A Modern Meeting & Task Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SendGrid](https://img.shields.io/badge/SendGrid-Email-1A82E2?style=for-the-badge&logo=twilio&logoColor=white)](https://sendgrid.com/)

**MeetTask AI** is a full-stack collaborative workspace management app where teams can manage workspaces, assign tasks, track progress, and get real-time notifications — all in one place.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Project Structure](#-project-structure)

</div>

---

## ✨ Features

### 👥 Workspace Management
- Create and manage multiple collaborative workspaces
- Invite members via email with role assignments
- Role-based access control: **Admin**, **Manager**, **Member**
- Workspace overview with team activity

### ✅ Task Management
- Create, assign, update, and delete tasks
- Task priorities and deadlines
- Task filtering by status, assignee, and workspace
- Real-time task progress tracking

### 🔔 Notification System
- Real-time in-app notifications (polling every 30s)
- Notifications for task assignments, workspace invites, and updates
- Mark as read / clear all functionality

### 🔐 Authentication & Security
- JWT-based authentication with 7-day expiry
- Email verification on registration
- Forgot password / reset password via email
- Protected routes with role-based guards

### 📧 Email Service
- Transactional emails via **SendGrid**
- Account verification email
- Password reset email
- Workspace invitation email

### 🎨 UI/UX
- Beautiful dark/light mode toggle
- Glassmorphism design with animated backgrounds
- Fully responsive layout (desktop + mobile)
- Smooth micro-animations and transitions

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Context API, React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (JSON Web Tokens) |
| **Email** | SendGrid Transactional Email API |
| **Styling** | Vanilla CSS with CSS Variables, Glassmorphism |
| **HTTP Client** | Axios |

---

## 📁 Project Structure

```
MeetTask-main/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register, Login, Verify, Reset
│   │   │   ├── workspaceController.js
│   │   │   ├── taskController.js
│   │   │   └── notificationController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT verification
│   │   │   ├── asyncHandler.js     # Error wrapper
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Workspace.js
│   │   │   ├── Task.js
│   │   │   └── Notification.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── workspaceRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── notificationRoutes.js
│   │   ├── services/
│   │   │   └── emailService.js     # SendGrid integration
│   │   └── server.js
│   ├── .env                        # Environment variables (not committed)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/                    # Axios API clients
    │   ├── components/             # Reusable UI components
    │   ├── context/                # React Context providers
    │   │   ├── AuthContext.jsx
    │   │   ├── WorkspaceContext.jsx
    │   │   ├── NotificationContext.jsx
    │   │   ├── RoleContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── hooks/                  # Custom React hooks
    │   ├── pages/                  # Route-level page components
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Workspace.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Notifications.jsx
    │   │   └── ...
    │   └── routes/
    │       └── AppRoutes.jsx
    ├── .env                        # Frontend env variables
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (free tier works)
- SendGrid account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/Anishbalkhi/Taskmeet.git
cd Taskmeet
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=8080
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
SENDGRID_FROM_NAME=MeetTask
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Backend runs on **http://localhost:8080**

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8080/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🔑 API Reference

### Auth Routes — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register new user |
| `POST` | `/login` | Login & get JWT token |
| `GET` | `/verify-email` | Verify email via token |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password` | Reset password with token |
| `GET` | `/me` | Get current user profile |
| `PUT` | `/me` | Update user profile |

### Workspace Routes — `/api/workspaces`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get all user workspaces |
| `POST` | `/` | Create new workspace |
| `GET` | `/:id` | Get workspace by ID |
| `PUT` | `/:id` | Update workspace |
| `DELETE` | `/:id` | Delete workspace |
| `POST` | `/:id/invite` | Invite member by email |
| `DELETE` | `/:id/members/:userId` | Remove member |

### Task Routes — `/api/tasks`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/workspace/:id` | Get tasks for workspace |
| `POST` | `/` | Create new task |
| `PUT` | `/:id` | Update task |
| `DELETE` | `/:id` | Delete task |

### Notification Routes — `/api/notifications`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get all notifications |
| `PUT` | `/:id/read` | Mark notification as read |
| `PUT` | `/read-all` | Mark all as read |
| `DELETE` | `/:id` | Delete notification |

---

## 🌍 Deployment

### Frontend → Vercel
1. Push code to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` environment variable to your backend URL
4. Deploy!

### Backend → Render
1. Create a new **Web Service** at [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Start Command** to `node src/server.js`
5. Add all environment variables from `.env`
6. Deploy!

---

## 🔒 Security Notes

- `.env` files are **never committed** to this repository
- JWT tokens expire after 7 days
- All API routes are protected by JWT middleware
- Passwords are hashed using **bcrypt**
- Email verification required before full account access

---

## 👤 Author

**Anish Balkhi**

[![GitHub](https://img.shields.io/badge/GitHub-Anishbalkhi-181717?style=for-the-badge&logo=github)](https://github.com/Anishbalkhi)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Made with ❤️ by Anish Balkhi
</div>
