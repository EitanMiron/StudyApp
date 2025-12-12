# StudyApp - Collaborative Learning Platform

[![Deployed on Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=study-app-g14e)](https://study-app-g14e.vercel.app)

**🔴 Live Demo:** [https://study-app-g14e.vercel.app](https://study-app-g14e.vercel.app)  
**⚙️ Backend API:** [https://study-app-eosin.vercel.app](https://study-app-eosin.vercel.app)

StudyApp is a comprehensive web application designed to enhance the learning experience through collaboration, organization, and AI assistance. It allows users to create and join study groups, manage notes, take quizzes, share resources, and track deadlines, all within a unified dashboard.

## 🚀 Tech Stack

### Frontend
- **Framework**: React (v19) with TypeScript
- **Build Tool**: Vite
- **Styling**: Material UI (MUI) & Custom CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt
- **AI Integration**: OpenAI API (GPT-3.5-turbo)

## ✨ Features

### ✅ Implemented
- **Authentication System**: Secure registration and login for both Users and Admins.
- **Interactive Dashboard**: Personalized dashboard showing study stats, upcoming deadlines, and active groups.
- **Study Groups**: 
  - Create, search, and join study groups based on subjects.
  - Manage group members (Admin roles).
  - "Exited Groups" history for easy re-joining.
- **Quiz System**:
  - Create custom quizzes within study groups.
  - Take quizzes with time limits.
  - View quiz results and scores.
- **Note Taking**: Create, edit, and organize study notes.
- **Resource Sharing**: Share and access learning resources (links, videos, documents) within groups.
- **AI Study Assistant**: 
  - Integrated AI chat assistant.
  - Context-aware help based on your notes and study topics.
- **Deadline Tracking**: Manage assignments and test dates.

### 🚧 To Be Implemented (Roadmap)
- **User Profile Page**: Implementation of `Profile.tsx` to allow users to view and edit their profile details (Avatar, Bio, Password Change).
- **File Upload System**: Integration with cloud storage (e.g., AWS S3, Cloudinary) to allow direct file uploads for Resources instead of just URLs.
- **Real-time Features**: 
  - Live chat within study groups.
  - Real-time notifications for invitations and deadlines using WebSockets (Socket.io).
- **Email Integration**: Automated emails for welcome messages, password resets, and deadline reminders.
- **Advanced AI Capabilities**: 
  - Auto-generate quizzes from study notes.
  - Summarize long resources or documents.
- **Mobile Responsiveness**: Further optimization of the UI for mobile devices.
- **Testing Suite**: Comprehensive Unit and Integration tests for backend API and frontend components.

## 🛠️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd StudyApp
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    - Create a `.env` file in the `backend` directory with the following:
      ```env
      PORT=4000
      MONGO_URI=your_mongodb_connection_string
      JWT_SECRET=your_jwt_secret_key
      OPENAI_API_KEY=your_openai_api_key
      ```
    - Start the server:
      ```bash
      npm start
      # or for development
      npm run dev
      ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```
    - Start the development server:
      ```bash
      npm run dev
      ```

4.  **Access the App**
    - Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## ☁️ Deployment

The application is fully deployed on **Vercel** using a microservices-like architecture where the Frontend and Backend are deployed as separate projects.

### Frontend Deployment
- **Platform**: Vercel
- **URL**: [https://study-app-g14e.vercel.app](https://study-app-g14e.vercel.app)
- **Configuration**: 
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Rewrites: Configured in `vercel.json` to proxy API requests to the backend.

### Backend Deployment
- **Platform**: Vercel (Serverless Functions)
- **URL**: [https://study-app-eosin.vercel.app](https://study-app-eosin.vercel.app)
- **Configuration**:
  - Root Directory: `backend`
  - Environment Variables: `MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY` must be set in Vercel Project Settings.
  - **Important**: MongoDB Atlas Network Access must be set to allow access from anywhere (`0.0.0.0/0`) for Vercel's dynamic IPs.
4.  Vercel should automatically detect Vite.
5.  Add any necessary environment variables in the Vercel dashboard.

### Backend Deployment
Since the backend is a Node.js/Express app, it needs to be deployed separately or as Serverless Functions.
- **Option A (Render/Heroku/Railway)**: Deploy the `backend` folder as a web service. Update the frontend's API URL to point to the deployed backend URL.
- **Option B (Vercel Serverless)**: Refactor the Express app to use Vercel Serverless Functions (requires moving backend code to `api/` directory in the root or configuring `vercel.json`).

## 📂 Project Structure

```
StudyApp/
├── backend/                # Node.js/Express Backend
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth & validation middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── server.js           # Entry point
│
├── frontend/               # React Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context (Auth, Dashboard)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service calls
│   │   ├── styles/         # CSS files
│   │   └── types/          # TypeScript interfaces
│   └── vite.config.ts      # Vite configuration
│
└── package.json            # Root dependencies
```

## 📄 License
[ISC](LICENSE)
