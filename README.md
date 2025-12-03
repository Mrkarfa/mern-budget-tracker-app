# 💰 BudgetFlow - Personal Finance Tracker

<div align="center">
  
  ![BudgetFlow Logo](https://img.shields.io/badge/BudgetFlow-Financial%20Tracker-00d4aa?style=for-the-badge&logo=cashapp&logoColor=white)
  
  **Take Control of Your Financial Future**
  
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
  [![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
  
  [Live Demo](https://mern-budget-tracker-app-nvez.vercel.app/) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Demo Screenshots](#demo-screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About the Project

**BudgetFlow** is a modern, full-stack personal finance management application built with the MERN stack. It provides users with an intuitive interface to track expenses, visualize spending patterns, and achieve their financial goals. With beautiful charts, real-time analytics, and secure cloud sync, BudgetFlow makes budget tracking simple and effective.

### Why BudgetFlow?

- ✅ **Free Forever** - No credit card required, unlimited transactions
- 📊 **Visual Analytics** - Beautiful charts and graphs to understand your spending
- 🔒 **Secure & Private** - Your data is encrypted and synced securely across devices
- 💡 **Smart Insights** - Get personalized recommendations to improve your financial health
- 🎨 **Beautiful UI** - Modern, intuitive interface with dark mode support
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

---

## ✨ Features

### Core Functionality

- **📈 Track Income & Expenses**
  - Easily categorize and monitor all financial transactions in one place
  - Quick add transaction functionality
  - Edit and delete transactions with ease

- **📊 Visual Analytics**
  - Interactive line charts showing income vs expenses over time
  - Donut charts for expense breakdown by category
  - 30-day trend analysis

- **🔐 Secure Cloud Sync**
  - End-to-end encrypted data storage
  - Automatic sync across all your devices
  - Secure authentication and authorization

- **💡 Budget Insights**
  - Smart financial recommendations
  - Spending pattern analysis
  - Category-wise expense tracking

### Additional Features

- Multiple spending categories (Food & Dining, Healthcare, Shopping, etc.)
- Real-time balance calculation
- Transaction history with date stamps
- User-friendly dashboard with key metrics
- Dark mode interface for comfortable viewing
- Responsive design for all screen sizes

---

## 📸 Demo Screenshots

### Landing Page
![Landing Page](path/to/image1.png)
*Modern landing page with clear call-to-action and feature highlights*

### Dashboard
![Dashboard](path/to/image2.png)
*Comprehensive dashboard showing balance, income, expenses, and visual analytics*

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library for building interactive interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Recharts** - Composable charting library for data visualization
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

### DevOps & Tools
- **Vercel** - Frontend deployment
- **MongoDB Atlas** - Cloud database hosting
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Make sure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/budgetflow.git
   cd budgetflow
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Start the development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/budgetflow` |
| `JWT_SECRET` | Secret key for JWT token generation | `your_super_secret_key_here` |
| `JWT_EXPIRE` | JWT token expiration time | `30d` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 💻 Usage

### Creating an Account

1. Click "Get Started" or "Create Free Account" on the landing page
2. Fill in your registration details
3. Verify your email (if email verification is enabled)
4. Start tracking your finances!

### Adding Transactions

1. Navigate to the dashboard
2. Click the "Add Transaction" button
3. Fill in the transaction details:
   - Transaction name
   - Amount
   - Category
   - Date
   - Type (Income/Expense)
4. Click "Save" to add the transaction

### Viewing Analytics

- **Income vs Expenses Chart**: View your 30-day financial trend
- **Expense Breakdown**: See which categories consume most of your budget
- **Balance Overview**: Monitor your current balance in real-time

### Managing Transactions

- **Edit**: Click the edit icon next to any transaction
- **Delete**: Click the delete icon to remove a transaction
- Transactions update your balance automatically

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Transaction Endpoints

#### Get All Transactions
```http
GET /api/transactions
Authorization: Bearer {token}
```

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Grocery Shopping",
  "amount": 45.50,
  "category": "Food & Dining",
  "date": "2025-12-03",
  "type": "expense"
}
```

#### Update Transaction
```http
PUT /api/transactions/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Transaction",
  "amount": 50.00
}
```

#### Delete Transaction
```http
DELETE /api/transactions/:id
Authorization: Bearer {token}
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}
```

#### Get Financial Summary
```http
GET /api/users/summary
Authorization: Bearer {token}
```

---

## 🏗️ Project Structure

```
budgetflow/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   ├── Landing/
│   │   │   ├── Auth/
│   │   │   └── Common/
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Update documentation for any new features
- Add tests for new functionality
- Ensure all tests pass before submitting PR

---

## 🐛 Known Issues

- [ ] Email verification system pending implementation
- [ ] Export transactions to CSV feature in development
- [ ] Budget limit alerts coming soon

---

## 🗺️ Roadmap

- [ ] Budget setting and tracking
- [ ] Recurring transactions
- [ ] Multiple currency support
- [ ] Bill reminders and notifications
- [ ] Receipt upload and scanning
- [ ] Financial goals tracking
- [ ] Export data to PDF/CSV
- [ ] Integration with banking APIs
- [ ] Mobile app (React Native)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Contact

Your Name - [@mytwitter](https://twitter.com/Mrkarfa) - souvikkarfa40227@gmail.com

Project Link: [https://github.com/yourusername/budgetflow](https://github.com/yourusername/budgetflow)

Live Demo: [https://mern-budget-tracker-app-nvez.vercel.app/](https://mern-budget-tracker-app-nvez.vercel.app/)

---

## 🙏 Acknowledgments

- [React Documentation](https://reactjs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Font Awesome](https://fontawesome.com/)
- [Vercel](https://vercel.com/)

---

<div align="center">
  
  **Made with ❤️ and JavaScript**
  
  ⭐ Star this repository if you find it helpful!
  
</div>
