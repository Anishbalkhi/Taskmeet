# TaskMeetAI

A modern, full-stack project management and team collaboration platform inspired by ClickUp. TaskMeetAI combines powerful task management capabilities with an intuitive, aesthetically pleasing user interface featuring dark themes, smooth animations, and glassmorphism effects.

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login** with email verification
- **JWT-based authentication** for secure API access
- **Password reset** functionality via email
- **Spring Security** integration for backend protection
- **Protected routes** and role-based access control

### 📋 Task Management
- **Create, update, and delete tasks** with ease
- **Interactive status management** - click status badges to update task states
- **Task assignment** to team members with search functionality
- **List and grid views** for flexible task visualization
- **Priority levels** and due date tracking
- **Rich task descriptions** and metadata

### 👥 Team Collaboration
- **Workspace creation and management**
- **Team member invitations** and workspace sharing
- **Team-based task organization**
- **Collaborative task assignment**
- **Real-time workspace updates**

### 🎨 Modern UI/UX
- **ClickUp-inspired design** with a premium, professional aesthetic
- **Dark theme** with sophisticated color palettes
- **Glassmorphism effects** and smooth animations
- **Responsive design** for all device sizes
- **Interactive components** with hover effects and micro-animations
- **Framer Motion** animations for enhanced user experience

### 📧 Email Integration
- **SendGrid integration** for transactional emails
- **Email verification** for new user registrations
- **Password reset emails** with secure tokens
- **Console logging** for local development

## 🛠️ Tech Stack

### Backend
- **Java 21** - Modern Java runtime
- **Spring Boot 3.2.5** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data MongoDB** - Database integration
- **MongoDB** - NoSQL database
- **JWT (JJWT 0.11.5)** - Token-based authentication
- **SendGrid** - Email service
- **Lombok** - Reduce boilerplate code
- **Maven** - Dependency management

### Frontend
- **React 19.2.0** - UI library
- **Vite 7.2.4** - Build tool and dev server
- **React Router DOM 7.10.1** - Client-side routing
- **Axios 1.13.2** - HTTP client
- **Framer Motion 12.23.26** - Animation library
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Icons** - Additional icon sets

## 📁 Project Structure

```
project_manager/
├── TaskMeetAI/              # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/example/TaskMeetAI/
│   │       │       ├── Model/          # Domain models
│   │       │       ├── Repository/     # Data access layer
│   │       │       ├── controller/     # REST controllers
│   │       │       ├── service/        # Business logic
│   │       │       ├── security/       # Security configuration
│   │       │       ├── dto/            # Data transfer objects
│   │       │       ├── util/           # Utility classes
│   │       │       └── config/         # Application configuration
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
└── frontend/                # React frontend
    ├── src/
    │   ├── api/            # API client configuration
    │   ├── components/     # Reusable UI components
    │   ├── context/        # React context providers
    │   ├── hooks/          # Custom React hooks
    │   ├── pages/          # Page components
    │   ├── routes/         # Routing configuration
    │   ├── styles/         # Global styles
    │   ├── data/           # Static data
    │   └── assets/         # Images and static assets
    ├── package.json
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- **Java 21** or higher
- **Node.js 18+** and npm/yarn
- **MongoDB** (local or cloud instance)
- **Maven 3.9+**
- **SendGrid API key** (for email functionality)

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd project_manager
```

2. **Configure MongoDB and SendGrid**

Create or update `TaskMeetAI/src/main/resources/application.properties`:

```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/taskmeetai

# JWT Configuration
jwt.secret=your-secret-key-here
jwt.expiration=86400000

# SendGrid Configuration
sendgrid.api.key=your-sendgrid-api-key
sendgrid.from.email=noreply@yourdomain.com

# Frontend URL (for email verification links)
frontend.url=http://localhost:5173

# CORS Configuration
allowed.origins=http://localhost:5173
```

3. **Run the backend**
```bash
cd TaskMeetAI
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API endpoint**

Update `frontend/src/api/axiosClient.js` if needed to point to your backend URL:
```javascript
const BASE_URL = 'http://localhost:8080/api';
```

4. **Run the development server**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

#### Backend (application.properties)
- `spring.data.mongodb.uri` - MongoDB connection string
- `jwt.secret` - Secret key for JWT signing
- `jwt.expiration` - JWT token expiration time (in milliseconds)
- `sendgrid.api.key` - SendGrid API key
- `sendgrid.from.email` - Email address for sending emails
- `frontend.url` - Frontend URL for CORS and email links
- `allowed.origins` - CORS allowed origins

#### Frontend
- API base URL is configured in `src/api/axiosClient.js`

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Endpoints
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Workspace Endpoints
- `GET /api/workspaces` - List user workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/{id}` - Get workspace details
- `PUT /api/workspaces/{id}` - Update workspace
- `DELETE /api/workspaces/{id}` - Delete workspace

### Task Endpoints
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

## 🎨 Design System

The application uses a carefully crafted design system with:
- **Premium color palettes** using HSL-based color schemes
- **Glassmorphism effects** with backdrop blur and transparency
- **Smooth animations** using Framer Motion
- **Consistent spacing** and typography
- **Modern Google Fonts** (Inter, Roboto, Outfit)
- **Interactive hover states** and micro-animations

## 🧪 Testing

### Backend Tests
```bash
cd TaskMeetAI
mvn test
```

### Frontend Tests
```bash
cd frontend
npm run lint
```

## 🏗️ Building for Production

### Backend
```bash
cd TaskMeetAI
mvn clean package
java -jar target/TaskMeetAI-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from **ClickUp**
- Icons from **Lucide React** and **React Icons**
- Email service by **SendGrid**
- Animations powered by **Framer Motion**

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Spring Boot and React**
