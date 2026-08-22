# Dayflow HRMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Human Resource Management System (HRMS) called Dayflow with authentication, role-based access, employee management, attendance tracking, leave management, payroll, and analytics.

**Architecture:** Three-tier web application with React frontend, Node.js/Express backend, and PostgreSQL database. RESTful API for frontend-backend communication. JWT-based authentication with role-based authorization.

**Tech Stack:**
- Frontend: React 18, React Router, Axios, Tailwind CSS
- Backend: Node.js 18+, Express.js, JWT, bcrypt, PostgreSQL
- Database: PostgreSQL 14+
- Testing: Jest, React Testing Library, Supertest
- Dev Tools: ESLint, Prettier, Nodemon

## Global Constraints

- Must support role-based access control (Admin/HR vs Employee)
- Passwords must follow security rules (min 8 chars, uppercase, lowercase, number, special char)
- Email verification required for registration
- Attendance tracking must support check-in/check-out functionality
- Leave management must support multiple leave types (Paid, Sick, Unpaid)
- Payroll data must be read-only for employees
- System must generate reports for salary slips and attendance
- All API endpoints must be secured with JWT authentication
- Frontend must be responsive and accessible
-
---
## Task Analysis & File Structure

Before defining tasks, here's the file structure we'll work with:

```
src/
├── client/                 # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API service calls
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React Context providers
│   ├── utils/              # Utility functions
│   ├── styles/             # CSS/Tailwind configurations
│   ├── App.js
│   └── index.js
├── server/                 # Backend Node.js/Express app
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware (auth, validation)
│   ├── models/             # Database models
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions
│   ├── validators/         # Input validation schemas
│   ├── config/             # Configuration files
│   ├── seeds/              # Database seed data
│   ├── .env.example
│   └── server.js
├── database/               # Database migrations and seeds
│   ├── migrations/
│   └── seeds/
├── tests/                  # Test files
│   ├── frontend/
│   └── backend/
├── docs/
├── package.json
└README.md
```

## Database Entities

Based on requirements, we need these core tables:
1. `users` - Employee and Admin/HR accounts
2. `employee_profiles` - Detailed employee information
3. `attendance` - Daily attendance records
4. `leave_requests` - Leave applications and approvals
5. `payroll` - Salary and payment information
6. `notifications` - System alerts and emails
7. `audit_logs` - Security and activity tracking

## API Endpoints

RESTful API structure:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/employees` - List employees (Admin only)
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee (Admin only)
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check-in
- `POST /api/attendance/checkout` - Check-out
- `GET /api/leave-requests` - Get leave requests
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id` - Update leave request (approve/reject)
- `GET /api/payroll` - Get payroll information
- `PUT /api/payroll/:id` - Update payroll (Admin only)
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/reports/*` - Generate reports

## Mandatory Requirements vs Enhancements

### Mandatory (Must-have for MVP):
1. User authentication (register/login/logout)
2. Role-based access control (Admin/Employee)
3. Employee profile viewing
4. Attendance tracking (check-in/check-out)
5. Leave request submission
6. Basic approval workflow (Admin can approve/reject)
7. Payroll viewing (read-only for employees)
8. Dashboard with key metrics
9. Email notifications for key events

### Enhancements (Future iterations):
1. Advanced analytics and reporting
2. Document management in profiles
3. Advanced payroll processing (tax calculations, deductions)
4. Mobile-responsive design (beyond basic responsiveness)
5. Integration with external calendars (Google/Outlook)
6. Multi-language support
7. Advanced notification preferences
8. Audit trail compliance reporting
9. Self-service HR workflows
10. Performance review system

## Implementation Plan

### Phase 1: Foundation & Authentication
### Phase 2: Core HR Functionality
### Phase 3: Attendance & Leave Management
### Phase 4: Payroll & Analytics
### Phase 5: Polish & Testing

Now let's break this down into specific tasks:

## Detailed Task Breakdown

### Phase 1: Foundation & Authentication

#### Task 1: Project Setup & Configuration

**Files:**
- Create: `package.json`
- Create: `server/.env.example`
- Create: `server/config/database.js`
- Create: `server/config/jwt.js`
- Create: `server/server.js`
- Create: `client/package.json`
- Create: `client/src/index.js`
- Create: `client/src/App.js`
- Modify: `README.md` (add project description)

**Interfaces:**
- Consumes: None (initial setup)
- Produces: Configured development environment with Express server and React app scaffolding

- [ ] **Step 1: Initialize backend project**

```bash
mkdir -p server && cd server && npm init -y
```

- [ ] **Step 2: Initialize frontend project**

```bash
mkdir -p client && cd client && npm init -y
```

- [ ] **Step 3: Install backend dependencies**

```bash
cd server && npm install express pg pg-hstore sequelize dotenv jsonwebtoken bcryptjs cors helmet morgan
```

- [ ] **Step 4: Install frontend dependencies**

```bash
cd client && npm install react react-dom react-router-dom react-router-dom axios
```

- [ ] **Step 5: Install dev dependencies**

```bash
# Backend dev deps
cd server && npm install --save-dev nodemon eslint jest supertest

# Frontend dev deps
cd client && npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

- [ ] **Step 6: Create basic server.js**

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Dayflow HRMS API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

- [ ] **Step 7: Create basic client App.js**

```javascript
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>Dayflow HRMS</h1>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 8: Configure npm scripts**

```bash
# In server/package.json, add:
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest"
}

# In client/package.json, add:
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
}
```

- [ ] **Step 9: Commit initial setup**

```bash
git add .
git commit -m "feat: initialize project structure and dependencies"
```

#### Task 2: Database Configuration & User Model

**Files:**
- Create: `server/models/User.js`
- Create: `server/models/EmployeeProfile.js`
- Create: `database/migrations/01-create-users-table.js`
- Create: `database/migrations/02-create-employee-profiles-table.js`
- Modify: `server/config/database.js`

**Interfaces:**
- Consumes: Database configuration from config files
- Produces: Sequelize models for Users and EmployeeProfiles with associations

- [ ] **Step 1: Configure Sequelize database connection**

```javascript
// server/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'dayflow_hrms',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };
```

- [ ] **Step 2: Create User model**

```javascript
// server/models/User.js
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [8, 100],
    },
  },
  role: {
    type: DataTypes.ENUM('employee', 'admin', 'hr'),
    allowNull: false,
    defaultValue: 'employee',
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
```

- [ ] **Step 3: Create EmployeeProfile model**

```javascript
// server/models/EmployeeProfile.js
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const EmployeeProfile = sequelize.define('EmployeeProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'USA',
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  employmentStatus: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'intern'),
    allowNull: true,
    defaultValue: 'full-time',
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  emergencyContactName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emergencyContactPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profilePictureUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
});

// Define associations
EmployeeProfile.associate = (models) => {
  EmployeeProfile.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
  
  EmployeeProfile.belongsTo(models.User, {
    foreignKey: 'managerId',
    as: 'manager',
  });
};

module.exports = EmployeeProfile;
```

- [ ] **Step 4: Update User model to include association**

```javascript
// Add to the end of server/models/User.js
User.associate = (models) => {
  User.hasOne(models.EmployeeProfile, {
    foreignKey: 'userId',
    as: 'employeeProfile',
  });
};

module.exports = User;
```

- [ ] **Step 5: Create migration files**

```javascript
// database/migrations/01-create-users-table.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      employeeId: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      role: {
        allowNull: false,
        type: Sequelize.ENUM('employee', 'admin', 'hr')
      },
      isEmailVerified: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      emailVerificationToken: {
        allowNull: true,
        type: Sequelize.STRING
      },
      emailVerificationExpires: {
        allowNull: true,
        type: Sequelize.DATE
      },
      passwordResetToken: {
        allowNull: true,
        type: Sequelize.STRING
      },
      passwordResetExpires: {
        allowNull: true,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
```

```javascript
// database/migrations/02-create-employee-profiles-table.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EmployeeProfiles', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      firstName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      lastName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      dateOfBirth: {
        allowNull: true,
        type: Sequelize.DATEONLY
      },
      gender: {
        allowNull: true,
        type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say')
      },
      phoneNumber: {
        allowNull: true,
        type: Sequelize.STRING
      },
      address: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      city: {
        allowNull: true,
        type: Sequelize.STRING
      },
      state: {
        allowNull: true,
        type: Sequelize.STRING
      },
      postalCode: {
        allowNull: true,
        type: Sequelize.STRING
      },
      country: {
        allowNull: true,
        type: Sequelize.STRING
      },
      hireDate: {
        allowNull: true,
        type: Sequelize.DATEONLY
      },
      jobTitle: {
        allowNull: true,
        type: Sequelize.STRING
      },
      department: {
        allowNull: true,
        type: Sequelize.STRING
      },
      employmentStatus: {
        allowNull: true,
        type: Sequelize.ENUM('full-time', 'part-time', 'contract', 'intern')
      },
      salary: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 2)
      },
      managerId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      emergencyContactName: {
        allowNull: true,
        type: Sequelize.STRING
      },
      emergencyContactPhone: {
        allowNull: true,
        type: Sequelize.STRING
      },
      profilePictureUrl: {
        allowNull: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('EmployeeProfiles');
  }
};
```

- [ ] **Step 6: Create database seed for admin user**

```javascript
// database/seeds/admin-user.js
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    await queryInterface.bulkInsert('Users', [{
      employeeId: 'EMP001',
      email: 'admin@dayflow.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
```

- [ ] **Step 7: Commit database models and migrations**

```bash
git add server/models/ server/config/database.js database/
git commit -m "feat: implement User and EmployeeProfile models with associations"
```

#### Task 3: Authentication Middleware and Utils

**Files:**
- Create: `server/middleware/auth.js`
- Create: `server/middleware/role.js`
- Create: `server/utils/password.js`
- Create: `server/utils/email.js`
- Create: `server/utils/token.js`
- Modify: `server/config/jwt.js`

**Interfaces:**
- Consumes: JWT secret from config, user model
- Produces: Authentication middleware, role checking utilities, password hashing, email sending, token generation

- [ ] **Step 1: Configure JWT settings**

```javascript
// server/config/jwt.js
require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'your_refresh_token_secret_here',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d'
};
```

- [ ] **Step 2: Create password utility functions**

```javascript
// server/utils/password.js
const bcrypt = require('bcryptjs');

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
const validatePasswordStrength = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one digit' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
```

- [ ] **Step 3: Create token utility functions**

```javascript
// server/utils/token.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Generate access token
 * @param {Object} payload - Token payload (usually user info)
 * @returns {string} - Signed JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} - Signed refresh JWT token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, { expiresIn: jwtConfig.refreshTokenExpiresIn });
};

/**
 * Verify access token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded payload or null if invalid
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object|null} - Decoded payload or null if invalid
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshTokenSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
```

- [ ] **Step 4: Create authentication middleware**

```javascript
// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const tokenUtils = require('../utils/token');

/**
 * Authentication middleware
 * Protects routes by verifying JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is missing or malformed'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = tokenUtils.verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Check if user exists and is active
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

module.exports = authenticate;
```

- [ ] **Step 5: Create role-based authorization middleware**

```javascript
// server/middleware/role.js
/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to access this resource'
        });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization'
      });
    }
  };
};

module.exports = authorize;
```

- [ ] **Step 6: Create email utility (mock implementation)**

```javascript
// server/utils/email.js
/**
 * Send email (mock implementation for development)
 * In production, integrate with email service like SendGrid, Mailgun, etc.
 * @param {Object} emailData - Email data
 * @returns {Promise<Object>} - Send result
 */
const sendEmail = async (emailData) => {
  // Mock implementation - in production, replace with actual email service
  console.log('Mock Email Sent:', {
    to: emailData.to,
    subject: emailData.subject,
    text: emailData.text,
    html: emailData.html
  });
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    messageId: `mock-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
};

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @returns {Promise<Object>} - Send result
 */
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${token}`;
  
  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Dayflow HRMS',
    text: `Please verify your email by clicking this link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Dayflow HRMS!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Verify Email
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #7f8c8d;">If you didn't create an account, please ignore this email.</p>
      </div>
    `
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 * @returns {Promise<Object>} - Send result
 */
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;
  
  return sendEmail({
    to: email,
    subject: 'Password Reset Request - Dayflow HRMS',
    text: `You requested a password reset. Please click this link to reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>We received a request to reset your password for your Dayflow HRMS account.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #7f8c8d;">If you have any questions, contact our support team.</p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};
```

- [ ] **Step 7: Commit authentication utilities and middleware**

```bash
git add server/middleware/ server/utils/ server/config/jwt.js
git commit -m "feat: implement authentication middleware, role authorization, and utility functions"
```

#### Task 4: Authentication API Endpoints

**Files:**
- Create: `server/controllers/authController.js`
- Create: `server/routes/auth.js`
- Modify: `server/server.js` (to register auth routes)
- Create: `server/validators/authValidator.js`

**Interfaces:**
- Consumes: Auth middleware, user model, token/email utilities
- Produces: Registration, login, logout, email verification, password reset endpoints

- [ ] **Step 1: Create authentication validators**

```javascript
// server/validators/authValidator.js
const { body, validationResult } = require('express-validator');
const passwordUtils = require('../utils/password');

/**
 * Validation rules for user registration
 */
const registerValidator = [
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .custom((value) => {
      const result = passwordUtils.validatePasswordStrength(value);
      if (!result.isValid) {
        throw new Error(result.message);
      }
      return true;
    }),
  
  body('role')
    .optional()
    .isIn(['employee', 'admin', 'hr'])
    .withMessage('Role must be either employee, admin, or hr'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation rules for user login
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation rules for email verification
 */
const emailVerificationValidator = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Verification token is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation rules for password reset request
 */
const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation rules for password reset
 */
const resetPasswordValidator = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .custom((value) => {
      const result = passwordUtils.validatePasswordStrength(value);
      if (!result.isValid) {
        throw new Error(result.message);
      }
      return true;
    }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  registerValidator,
  loginValidator,
  emailVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
```

- [ ] **Step 2: Create authentication controller**

```javascript
// server/controllers/authController.js
const { User } = require('../models');
const tokenUtils = require('../utils/token');
const emailUtils = require('../utils/email');
const { generateAccessToken, generateRefreshToken } = tokenUtils;

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { employeeId, email, password, role = 'employee' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [sequelize.Op.or]: [{ email }, { employeeId }]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }
    
    // Create new user
    const user = await User.create({
      employeeId,
      email,
      password,
      role
    });
    
    // Generate email verification token
    const emailVerificationToken = tokenUtils.generateAccessToken({
      id: user.id,
      purpose: 'email_verification'
    });
    
    // Set token expiration (24 hours from now)
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);
    
    // Save token to user
    await user.update({
      emailVerificationToken,
      emailVerificationExpires
    });
    
    // Send verification email
    await emailUtils.sendVerificationEmail(email, emailVerificationToken);
    
    // Remove sensitive data from response
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.resetPasswordToken;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }
    
    // Generate tokens
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });
    
    // Remove sensitive data from response
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.resetPasswordToken;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Logout user (invalidate tokens on client side)
 */
const logout = (req, res) => {
  try {
    // In a more sophisticated implementation, we would add tokens to a blacklist
    // For now, we'll just return success - client should remove tokens
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    // Remove sensitive data from response
    const userResponse = req.user.toJSON();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.resetPasswordToken;
    
    res.status(200).json({
      success: true,
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching profile'
    });
  }
};

/**
 * Verify email
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify token
    const decoded = tokenUtils.verifyAccessToken(token);
    
    if (!decoded || decoded.purpose !== 'email_verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    // Find user
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if token matches
    if (user.emailVerificationToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }
    
    // Check if token expired
    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired'
      });
    }
    
    // Update user as verified
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during email verification'
    });
  }
};

/**
 * Request password reset
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // Always return same message to prevent email enumeration
    if (user) {
      // Generate reset token
      const resetToken = tokenUtils.generateAccessToken({
        id: user.id,
        purpose: 'password_reset'
      });
      
      // Set token expiration (1 hour from now)
      const passwordResetExpires = new Date();
      passwordResetExpires.setHours(passwordResetExpires.getHours() + 1);
      
      // Save token to user
      await user.update({
        passwordResetToken: resetToken,
        passwordResetExpires
      });
      
      // Send reset email
      await emailUtils.sendPasswordResetEmail(email, resetToken);
    }
    
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during forgot password request'
    });
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Verify token
    const decoded = tokenUtils.verifyAccessToken(token);
    
    if (!decoded || decoded.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Find user
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if token matches
    if (user.passwordResetToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }
    
    // Check if token expired
    if (user.passwordResetExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }
    
    // Update password
    await user.update({
      password,
      passwordResetToken: null,
      passwordResetExpires: null
    });
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset'
    });
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = tokenUtils.verifyRefreshToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    
    // Find user
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate new access token
    const accessToken = tokenUtils.generateAccessToken({ id: user.id, role: user.role });
    
    res.status(200).json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken
};
```

- [ ] **Step 3: Create authentication routes**

```javascript
// server/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator, emailVerificationValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/authValidator');
const authenticate = require('../middleware/auth');

// Public routes
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/verify-email', emailVerificationValidator, authController.verifyEmail);
router.post('/forgot-password', forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getProfile);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
```

- [ ] **Step 4: Register auth routes in server.js**

```javascript
// Add to server/server.js after middleware setup
const authRoutes = require('./routes/auth');
// ... other middlewares
app.use('/api/auth', authRoutes);
// ... rest of server setup
```

- [ ] **Step 5: Commit authentication API implementation**

```bash
git add server/controllers/authController.js server/routes/auth.js server/validators/authValidator.js server/server.js
git commit -m "feat: implement authentication API endpoints with validation"
```

Now let's move to Phase 2: Core HR Functionality

### Phase 2: Core HR Functionality

#### Task 5: Employee Profile Model and API

**Files:**
- Create: `server/controllers/employeeController.js`
- Create: `server/routes/employees.js`
- Create: `server/validators/employeeValidator.js`
- Modify: `server/server.js` (to register employee routes)

**Interfaces:**
- Consumes: Auth middleware, role middleware, User and EmployeeProfile models
- Produces: Employee profile CRUD endpoints (Admin/HR can manage all, Employees can view/update own)

- [ ] **Step 1: Update EmployeeProfile model to include User association**

```javascript
// In server/models/EmployeeProfile.js, add the inverse association
EmployeeProfile.associate = (models) => {
  EmployeeProfile.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
  
  EmployeeProfile.belongsTo(models.User, {
    foreignKey: 'managerId',
    as: 'manager',
  });
  
  // Inverse association
  EmployeeProfile.belongsToMany(models.User, {
    through: 'UserSubordinates', // Join table for managing subordinates
    foreignKey: 'managerId',
    as: 'subordinates'
  });
};

module.exports = EmployeeProfile;
```

- [ ] **Step 2: Create employee validators**

```javascript
// server/validators/employeeValidator.js
const { body, validationResult } = require('express-validator');

/**
 * Validation rules for creating/updating employee profile
 */
const employeeProfileValidator = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  
  body('dateOfBirth')
    .optional()
    .isDate()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be male, female, other, or prefer_not_to_say'),
  
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City must be less than 50 characters'),
  
  body('state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State must be less than 50 characters'),
  
  body('postalCode')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Postal code must be less than 20 characters'),
  
  body('country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Country must be less than 50 characters'),
  
  body('jobTitle')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Job title must be less than 100 characters'),
  
  body('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),
  
  body('employmentStatus')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'intern'])
    .withMessage('Employment status must be full-time, part-time, contract, or intern'),
  
  body('salary')
    .optional()
    .isDecimal()
    .withMessage('Salary must be a valid number')
    .custom((value) => {
      if (value && parseFloat(value) < 0) {
        throw new Error('Salary cannot be negative');
      }
      return true;
    }),
  
  body('managerId')
    .optional()
    .isUUID()
    .withMessage('Manager ID must be a valid UUID'),
  
  body('emergencyContactName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name must be less than 100 characters'),
  
  body('emergencyContactPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid emergency contact phone number'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  employeeProfileValidator
};
```

- [ ] **Step 3: Create employee controller**

```javascript
// server/controllers/employeeController.js
const { User, EmployeeProfile } = require('../models');
const authorize = require('../middleware/role');

/**
 * Get all employees (Admin/HR only)
 */
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.findAll({
      attributes: { exclude: ['password', 'emailVerificationToken', 'resetPasswordToken'] },
      include: [{
        model: EmployeeProfile,
        as: 'employeeProfile'
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: {
        employees
      }
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching employees'
    });
  }
};

/**
 * Get employee by ID (Admin/HR can view any, Employee can view own)
 */
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Employees can only view their own profile unless they're Admin/HR
    if (req.user.role === 'employee' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view this employee'
      });
    }
    
    const employee = await User.findByPk(id, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'resetPasswordToken'] },
      include: [{
        model: EmployeeProfile,
        as: 'employeeProfile'
      }]
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
      }
    
    res.status(200).json({
      success: true,
      data: {
        employee
      }
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching employee'
    });
  }
};

/**
 * Update employee profile (Admin/HR can update any, Employee can update own limited fields)
 */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Employees can only update their own profile
    if (req.user.role === 'employee' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update this employee'
      });
    }
    
    // For employees, restrict which fields they can update
    if (req.user.role === 'employee') {
      // Employees can only update: address, phoneNumber, emergencyContactName, emergencyContactPhone
      const allowedFields = ['address', 'phoneNumber', 'emergencyContactName', 'emergencyContactPhone'];
      const filteredData = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }
      
      updateData = filteredData;
    }
    
    // Find the employee profile
    const employeeProfile = await EmployeeProfile.findOne({
      where: { userId: id }
    });
    
    if (!employeeProfile) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }
    
    // Update the profile
    await employeeProfile.update(updateData);
    
    // Get updated employee data
    const updatedEmployee = await User.findByPk(id, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'resetPasswordToken'] },
      include: [{
        model: EmployeeProfile,
        as: 'employeeProfile'
      }]
    });
    
    res.status(200).json({
      success: true,
      message: 'Employee profile updated successfully',
      data: {
        employee: updatedEmployee
      }
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error updating employee'
    });
  }
};

/**
 * Delete employee (Admin only)
 */
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Find user
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Delete user (cascade will delete employee profile)
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error deleting employee'
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};
```

- [ ] **Step 4: Create employee routes**

```javascript
// server/routes/employees.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { employeeProfileValidator } = require('../validators/employeeValidator');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// All routes require authentication
router.use(authenticate);

// Get all employees (Admin/HR only)
router.get('/', authorize('admin', 'hr'), employeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Update employee profile
router.put('/:id', employeeProfileValidator, employeeController.updateEmployee);

// Delete employee (Admin only)
router.delete('/:id', authorize('admin'), employeeController.deleteEmployee);

module.exports = router;
```

- [ ] **Step 5: Register employee routes in server.js**

```javascript
// Add to server/server.js after auth routes
const employeeRoutes = require('./routes/employees');
// ... other middlewares
app.use('/api/employees', employeeRoutes);
// ... rest of server setup
```

- [ ] **Step 6: Commit employee profile implementation**

```bash
git add server/controllers/employeeController.js server/routes/employees.js server/validators/employeeValidator.js server/server.js
git commit -m "feat: implement employee profile CRUD endpoints with role-based access"
```

#### Task 6: Employee Profile Frontend Components

**Files:**
- Create: `client/src/components/EmployeeProfile.js`
- Create: `client/src/components/EmployeeList.js`
- Create: `client/src/components/EditEmployeeProfileForm.js`
- Create: `client/src/services/employeeService.js`
- Create: `client/src/pages/EmployeesPage.js`
- Create: `client/src/pages/EmployeeProfilePage.js`
- Modify: `client/src/App.js` (to add routes)

**Interfaces:**
- Consumes: Employee service functions, auth context
- Produces: UI components for viewing and managing employee profiles

- [ ] **Step 1: Create employee service**

```javascript
// client/src/services/employeeService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const employeeService = {
  // Get all employees (Admin/HR)
  getAllEmployees: async () => {
    const response = await axios.get(`${API_BASE_URL}/employees`);
    return response.data;
  },
  
  // Get employee by ID
  getEmployeeById: async (employeeId) => {
    const response = await axios.get(`${API_BASE_URL}/employees/${employeeId}`);
    return response.data;
  },
  
  // Update employee profile
  updateEmployee: async (employeeId, employeeData) => {
    const response = await axios.put(`${API_BASE_URL}/employees/${employeeId}`, employeeData);
    return response.data;
  },
  
  // Delete employee (Admin)
  deleteEmployee: async (employeeId) => {
    const response = await axios.delete(`${API_BASE_URL}/employees/${employeeId}`);
    return response.data;
  }
};

export default employeeService;
```

- [ ] **Step 2: Create EmployeeProfile component (view mode)**

```javascript
// client/src/components/EmployeeProfile.js
import React from 'react';
import PropTypes from 'prop-types';

const EmployeeProfile = ({ employee, onEdit, onDelete }) => {
  if (!employee || !employee.employeeProfile) {
    return <div>Loading employee profile...</div>;
  }

  const { employeeProfile } = employee;
  
  return (
    <div className="employee-profile">
      <div className="profile-header">
        <h2>{`${employeeProfile.firstName} ${employeeProfile.lastName}`}</h2>
        <p className="employee-id">Employee ID: {employee.employeeId}</p>
        <p className="employee-role">Role: {employee.role}</p>
        <p className="job-title">Job Title: {employeeProfile.jobTitle || 'Not specified'}</p>
        <p className="department">Department: {employeeProfile.department || 'Not specified'}</p>
      </div>
      
      <div className="profile-details">
        <div className="detail-section">
          <h3>Personal Information</h3>
          <p><strong>Date of Birth:</strong> {employeeProfile.dateOfBirth ? new Date(employeeProfile.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
          <p><strong>Gender:</strong> {employeeProfile.gender || 'Not specified'}</p>
          <p><strong>Phone:</strong> {employeeProfile.phoneNumber || 'Not specified'}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Address:</strong> {employeeProfile.address || 'Not specified'}</p>
          <p><strong>City, State:</strong> 
            {employeeProfile.city || ''} {employeeProfile.state || ''}{','.repeat(Boolean(employeeProfile.city || employeeProfile.state))}
            {employeeProfile.postalCode || ''}
          </p>
          <p><strong>Country:</strong> {employeeProfile.country || 'USA'}</p>
        </div>
        
        <div className="detail-section">
          <h3>Employment Information</h3>
          <p><strong>Hire Date:</strong> {employeeProfile.hireDate ? new Date(employeeProfile.hireDate).toLocaleDateString() : 'Not specified'}</p>
          <p><strong>Employment Status:</strong> {employeeProfile.employmentStatus || 'Not specified'}</p>
          <p><strong>Salary:</strong> ${employeeProfile.salary ? parseFloat(employeeProfile.salary).toLocaleString() : 'Not specified'}</p>
          <p><strong>Manager:</strong> {/* Would fetch manager name in real implementation */} {employeeProfile.managerId ? 'Assigned' : 'Not specified'}</p>
        </div>
        
        <div className="detail-section">
          <h3>Emergency Contact</h3>
          <p><strong>Name:</strong> {employeeProfile.emergencyContactName || 'Not specified'}</p>
          <p><strong>Phone:</strong> {employeeProfile.emergencyContactPhone || 'Not specified'}</p>
        </div>
      </div>
      
      <div className="profile-actions">
        {onEdit && (
          <button 
            className="btn btn-edit"
            onClick={() => onEdit(employee.id)}
          >
            Edit Profile
          </button>
        )}
        {onDelete && (
          <button 
            className="btn btn-delete"
            onClick={() => onDelete(employee.id)}
          >
            Delete Employee
          </button>
        )}
      </div>
    </div>
  );
};

EmployeeProfile.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.string.isRequired,
    employeeId: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['employee', 'admin', 'hr']).isRequired,
    employeeProfile: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      dateOfBirth: PropTypes.instanceOf(Date),
      gender: PropTypes.oneOf(['male', 'female', 'other', 'prefer_not_to_say']),
      phoneNumber: PropTypes.string,
      address: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      postalCode: PropTypes.string,
      country: PropTypes.string,
      hireDate: PropTypes.instanceOf(Date),
      jobTitle: PropTypes.string,
      department: PropTypes.string,
      employmentStatus: PropTypes.oneOf(['full-time', 'part-time', 'contract', 'intern']),
      salary: PropTypes.number,
      managerId: PropTypes.string,
      emergencyContactName: PropTypes.string,
      emergencyContactPhone: PropTypes.string
    })
  }),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default EmployeeProfile;
```

- [ ] **Step 3: Create EditEmployeeProfileForm component**

```javascript
// client/src/components/EditEmployeeProfileForm.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import employeeService from '../services/employeeService';

const EditEmployeeProfileForm = ({ employeeId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    hireDate: '',
    jobTitle: '',
    department: '',
    employmentStatus: 'full-time',
    salary: '',
    managerId: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Fetch employee data when component mounts or employeeId changes
  // In a real implementation, we'd use useEffect to fetch initial data
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Filter out empty fields for PATCH-like behavior
      const updateData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '' && value !== null)
      );
      
      const response = await employeeService.updateEmployee(employeeId, updateData);
      setSuccess(true);
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Close form after delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee profile');
      setLoading(false);
    }
  };
  
  if (loading && !success) {
    return <div className="edit-form-loading">Saving changes...</div>;
  }
  
  return (
    <div className="edit-employee-form">
      <h2>Edit Employee Profile</h2>
      {success && (
        <div className="form-success-message">
          Employee profile updated successfully!
        </div>
      )}
      {error && (
        <div className="form-error-message">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Employment Information */}
          <div className="form-section">
            <h3>Employment Information</h3>
            <div className="form-group">
              <label htmlFor="hireDate">Hire Date</label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="jobTitle">Job Title</label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="employmentStatus">Employment Status</label>
              <select
                id="employmentStatus"
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="salary">Salary ($)</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="managerId">Manager ID</label>
              <input
                type="text"
                id="managerId"
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Emergency Contact */}
          <div className="form-section">
            <h3>Emergency Contact</h3>
            <div className="form-group">
              <label htmlFor="emergencyContactName">Name</label>
              <input
                type="text"
                id="emergencyContactName"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="emergencyContactPhone">Phone Number</label>
              <input
                type="tel"
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

EditEmployeeProfileForm.propTypes = {
  employeeId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default EditEmployeeProfileForm;
```

- [ ] **Step 4: Create EmployeeList component**

```javascript
// client/src/components/EmployeeList.js
import React from 'react';
import PropTypes from 'prop-types';
import EmployeeProfile from './EmployeeProfile';
import { Link } from 'react-router-dom';

const EmployeeList = ({ employees, onDelete }) => {
  if (!employees || employees.length === 0) {
    return (
      <div className="employee-list-empty">
        <p>No employees found.</p>
        {/* Show add button only for Admin/HR in real implementation */}
      </div>
    );
  }
  
  return (
    <div className="employee-list">
      <div className="list-header">
        <h2>Employee Directory</h2>
        <div className="list-actions">
          <Link to="/employees/new" className="btn btn-primary">
            Add New Employee
          </Link>
        </div>
      </div>
      
      <div className="list-container">
        {employees.map((employee) => (
          <div 
            key={employee.id} 
            className="employee-card"
          >
            <EmployeeProfile
              employee={employee}
              onEdit={(id) => {
                // Navigate to edit page
                // In real implementation: navigate(`/employees/${id}/edit`)
              }}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

EmployeeList.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      employeeId: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.oneOf(['employee', 'admin', 'hr']).isRequired,
      employeeProfile: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired
      })
    })
  ),
  onDelete: PropTypes.func
};

export default EmployeeList;
```

- [ ] **Step 5: Create EmployeesPage component**

```javascript
// client/src/pages/EmployeesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeList from '../components/EmployeeList';
import employeeService from '../services/employeeService';
import { useAuth } from '../contexts/AuthContext'; // Assuming we have auth context

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is authorized (Admin/HR)
  const isAuthorized = user && (user.role === 'admin' || user.role === 'hr');
  
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeService.getAllEmployees();
        setEmployees(response.data.employees || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employees');
        setLoading(false);
      }
    };
    
    // Only load if authorized
    if (isAuthorized) {
      loadEmployees();
    } else {
      setLoading(false);
      setError('You are not authorized to view employee data');
    }
  }, [isAuthorized]);
  
  const handleDelete = async (employeeId) => {
    if (window.Are you sure you want to delete this employee? This action cannot be undone.') {
      try {
        await employeeService.deleteEmployee(employeeId);
        // Remove deleted employee from list
        setEmployees(employees.filter(emp => emp.id !== employeeId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete employee');
      }
    }
  };
  
  if (loading) {
    return <div className="page-loading">Loading employees...</div>;
  }
  
  if (error) {
    return (
      <div className="page-error">
        <p>{error}</p>
        {isAuthorized && (
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="employees-page">
      <EmployeeList 
        employees={employees} 
        onDelete={handleDelete}
      />
    </div>
  );
};

export default EmployeesPage;
```

- [ ] **Step 6: Create EmployeeProfilePage component**

```javascript
// client/src/pages/EmployeeProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeProfile from '../components/EmployeeProfile';
import EditEmployeeProfileForm from '../components/EditEmployeeProfileForm';
import employeeService from '../services/employeeService';
import { useAuth } from '../contexts/AuthContext';

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // Check if user can view this profile
  const canView = user && 
    (user.role === 'admin' || user.role === 'hr' || user.id === id);
  
  // Check if user can edit this profile
  const canEdit = user && 
    ((user.role === 'admin' || user.role === 'hr') || user.id === id);
  
  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setLoading(true);
        const response = await employeeService.getEmployeeById(id);
        setEmployee(response.data.employee);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employee profile');
        setLoading(false);
        
        // Redirect if employee not found or unauthorized
        if (err.response?.status === 404 || err.response?.status === 403) {
          navigate('/employees');
        }
      }
    };
    
    if (canView) {
      loadEmployee();
    } else {
      setLoading(false);
      setError('You are not authorized to view this employee profile');
    }
  }, [id, canView, navigate]);
  
  const handleEdit = () => {
    setEditMode(true);
  };
  
  const handleEditClose = () => {
    setEditMode(false);
  };
  
  const handleEditSuccess = (updatedEmployee) => {
    setEmployee(updatedEmployee.data.employee);
    setEditMode(false);
  };
  
  if (loading) {
    return <div className="page-loading">Loading employee profile...</div>;
  }
  
  if (error) {
    return (
      <div className="page-error">
        <p>{error}</p>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/employees')}
        >
          Back to Employees
        </button>
      </div>
    );
  }
  
  if (!employee) {
    return <div className="page-loading">Employee not found...</div>;
  }
  
  return (
    <div className="employee-profile-page">
      <div className="page-header">
        <h1>Employee Profile</h1>
        <div className="page-actions">
          {canEdit && (
            <button 
              className="btn btn-primary" 
              onClick={handleEdit}
            >
              Edit Profile
            </button>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/employees')}
          >
            Back to Employees
          </button>
        </div>
      </div>
      
      {editMode && canEdit ? (
        <EditEmployeeProfileForm
          employeeId={id}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
        )
      ) : (
        <EmployeeProfile
          employee={employee}
          onEdit={handleEdit}
          onDelete={canEdit ? handleDelete : null} // Implement handleDelete if needed
        />
      )}
    </div>
  );
};

export default EmployeeProfilePage;
```

- [ ] **Step 7: Update App.js to include employee routes**

```javascript
// In client/src/App.js, add imports and routes
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';

// In the Routes component:
<Route path="/employees" element={<EmployeesPage />} />
<Route path="/employees/:id" element={<EmployeeProfilePage />} />
<Route path="/employees/new" element={<AddEmployeePage />} /> // Would need to create
<Route path="/employees/:id/edit" element={<EditEmployeeProfilePage />} /> // Would need to create
```

- [ ] **Step 8: Commit employee frontend components**

```bash
git add client/src/components/EmployeeProfile.js client/src/components/EditEmployeeProfileForm.js client/src/components/EmployeeList.js client/src/pages/EmployeesPage.js client/src/pages/EmployeeProfilePage.js client/src/services/employeeService.js client/src/App.js
git commit -m "feat: implement employee profile frontend components and pages"
```

#### Task 7: Update User Model with EmployeeProfile Association (Complete)

Let me double-check the association is properly set up in both directions:

```javascript
// In server/models/User.js, ensure the association is complete
User.associate = (models) => {
  User.hasOne(models.EmployeeProfile, {
    foreignKey: 'userId',
    as: 'employeeProfile',
  });
  
  // Inverse association for manager-subordinate relationships
  User.belongsToMany(models.User, {
    through: 'UserSubordinates',
    as: 'subordinates',
    foreignKey: 'managerId'
  });
  
  User.belongsToMany(models.User, {
    through: 'UserSubordinates',
    as: 'managers',
    foreignKey: 'subordinateId'
  });
};

module.exports = User;
```

- [ ] **Step 8: Commit completed association updates**

```bash
git add server/models/User.js server/models/EmployeeProfile.js
git commit -m "feat: complete bidirectional associations between User and EmployeeProfile models"
```

### Phase 2: Core HR Functionality (Continued)

#### Task 8: Department and Job Title Management

**Files:**
- Create: `server/models/Department.js`
- Create: `server/models/JobTitle.js`
- Create: `server/controllers/departmentController.js`
- Create: `server/controllers/jobTitleController.js`
- Create: `server/routes/departments.js`
- Create: `server/routes/jobTitles.js`
- Create: `server/validators/departmentValidator.js`
- Create: `server/validators/jobTitleValidator.js`

**Interfaces:**
- Consumes: Auth middleware, role middleware, Department and JobTitle models
- Produces: CRUD endpoints for departments and job titles (Admin/HR only)

- [ ] **Step 1: Create Department model**

```javascript
// server/models/Department.js
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

// Define associations
Department.associate = (models) => {
  Department.hasMany(models.EmployeeProfile, {
    foreignKey: 'departmentId',
    as: 'employees'
  });
};

module.exports = Department;
```

- [ ] **Step 2: Create JobTitle model**

```javascript
// server/models/JobTitle.js
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobTitle = sequelize.define('JobTitle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

// Define associations
JobTitle.associate = (models) => {
  JobTitle.hasMany(models.EmployeeProfile, {
    foreignKey: 'jobTitleId',
    as: 'employees'
  });
};

module.exports = JobTitle;
```

- [ ] **Step 3: Create department and job title validators**

```javascript
// server/validators/departmentValidator.js
const { body, validationResult } = require('express-validator');

const departmentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean value'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  departmentValidator
};
```

```javascript
// server/validators/jobTitleValidator.js
const { body, validationResult } = require('express-validator');

const jobTitleValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('level')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Level must be an integer between 1 and 10'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean value'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  jobTitleValidator
};
```

- [ ] **Step 4: Create department and job title controllers**

```javascript
// server/controllers/departmentController.js
const { Department } = require('../models');
const authorize = require('../middleware/role');

/**
 * Get all departments
 */
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: {
        departments
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching departments'
    });
  }
};

/**
 * Get department by ID
 */
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        department
      }
    });
  } catch (error) {
    console.error('Get department by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching department'
    });
  }
};

/**
 * Create department (Admin/HR only)
 */
const createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: {
        department
      }
    });
  } catch (error) {
    console.error('Create department error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error creating department'
    });
  }
};

/**
 * Update department (Admin/HR only)
 */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    await department.update(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: {
        department
      }
    });
  } catch (error) {
    console.error('Update department error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error updating department'
    });
  }
};

/**
 * Delete department (Admin/HR only) - soft delete
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Check if department has employees
    const employeeCount = await department.countEmployees();
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with assigned employees'
      });
    }
    
    await department.update({ isActive: false });
    
    res.status(200).json({
      success: true,
      message: 'Department deactivated successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error deleting department'
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
```

```javascript
// server/controllers/jobTitleController.js
const { JobTitle } = require('../models');
const authorize = require('../middleware/role');

/**
 * Get all job titles
 */
const getAllJobTitles = async (req, res) => {
  try {
    const jobTitles = await JobTitle.findAll({
      where: { isActive: true },
      order: [['title', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: {
        jobTitles
      }
    });
  } catch (error) {
    console.error('Get job titles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching job titles'
    });
  }
};

/**
 * Get job title by ID
 */
const getJobTitleById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobTitle = await JobTitle.findByPk(id);
    
    if (!jobTitle) {
      return res.status(404).json({
        success: false,
        message: 'Job title not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        jobTitle
      }
    });
  } catch (error) {
    console.error('Get job title by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching job title'
    });
  }
};

/**
 * Create job title (Admin/HR only)
 */
const createJobTitle = async (req, res) => {
  try {
    const jobTitle = await JobTitle.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Job title created successfully',
      data: {
        jobTitle
      }
    });
  } catch (error) {
    console.error('Create job title error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Job title with this title already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error creating job title'
    });
  }
};

/**
 * Update job title (Admin/HR only)
 */
const updateJobTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const jobTitle = await JobTitle.findByPk(id);
    
    if (!jobTitle) {
      return res.status(404).json({
        success: false,
        message: 'Job title not found'
      });
    }
    
    await jobTitle.update(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Job title updated successfully',
      data: {
        jobTitle
      }
    });
  } catch (error) {
    console.error('Update job title error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Job title with this title already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error updating job title'
    });
  }
};

/**
 * Delete job title (Admin/HR only) - soft delete
 */
const deleteJobTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const jobTitle = await JobTitle.findByPk(id);
    
    if (!jobTitle) {
      return res.status(404).json({
        success: false,
        message: 'Job title not found'
      });
    }
    
    // Check if job title has employees
    const employeeCount = await jobTitle.countEmployees();
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete job title with assigned employees'
      });
    }
    
    await jobTitle.update({ isActive: false });
    
    res.status(200).json({
      success: true,
      message: 'Job title deactivated successfully'
    });
  } catch (error) {
    console.error('Delete job title error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error deleting job title'
    });
  }
};

module.exports = {
  getAllJobTitles,
  getJobTitleById,
  createJobTitle,
  updateJobTitle,
  deleteJobTitle
};
```

- [ ] **Step 5: Create department and job title routes**

```javascript
// server/routes/departments.js
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { departmentValidator } = require('../validators/departmentValidator');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// All routes require authentication
router.use(authenticate);

// Get all departments (public for authenticated users)
router.get('/', departmentController.getAllDepartments);

// Get department by ID
router.get('/:id', departmentController.getDepartmentById);

// Create department (Admin/HR only)
router.post('/', authorize('admin', 'hr'), departmentValidator, departmentController.createDepartment);

// Update department (Admin/HR only)
router.put('/:id', authorize('admin', 'hr'), departmentValidator, departmentController.updateDepartment);

// Delete department (Admin/HR only)
router.delete('/:id', authorize('admin', 'hr'), departmentController.deleteDepartment);

module.exports = router;
```

```javascript
// server/routes/jobTitles.js
const express = require('express');
const router = express.Router();
const jobTitleController = require('../controllers/jobTitleController');
const { jobTitleValidator } = require('../validators/jobTitleValidator');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// All routes require authentication
router.use(authenticate);

// Get all job titles (public for authenticated users)
router.get('/', jobTitleController.getAllJobTitles);

// Get job title by ID
router.get('/:id', jobTitleController.getJobTitleById);

// Create job title (Admin/HR only)
router.post('/', authorize('admin', 'hr'), jobTitleValidator, jobTitleController.createJobTitle);

// Update job title (Admin/HR only)
router.put('/:id', authorize('admin', 'hr'), jobTitleValidator, jobTitleController.updateJobTitle);

// Delete job title (Admin/HR only)
router.delete('/:id', authorize('admin', 'hr'), jobTitleController.deleteJobTitle);

module.exports = router;
```

- [ ] **Step 6: Register department and job title routes in server.js**

```javascript
// Add to server/server.js after employee routes
const departmentRoutes = require('./routes/departments');
const jobTitleRoutes = require('./routes/jobTitles');
// ... other middlewares
app.use('/api/departments', departmentRoutes);
app.use('/api/job-titles', jobTitleRoutes);
// ... rest of server setup
```

- [ ] **Step 7: Update EmployeeProfile model to include department and job title associations**

```javascript
// In server/models/EmployeeProfile.js, update associations
EmployeeProfile.associate = (models) => {
  EmployeeProfile.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
  
  EmployeeProfile.belongsTo(models.User, {
    foreignKey: 'managerId',
    as: 'manager',
  });
  
  EmployeeProfile.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });
  
  EmployeeProfile.belongsTo(models.JobTitle, {
    foreignKey: 'jobTitleId',
    as: 'jobTitle'
  });
  
  // Inverse associations
  EmployeeProfile.belongsToMany(models.User, {
    through: 'UserSubordinates',
    foreignKey: 'managerId',
    as: 'subordinates'
  });
};

module.exports = EmployeeProfile;
```

- [ ] **Step 8: Create migration files for departments and job titles**

```javascript
// database/migrations/03-create-departments-table.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Departments', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      isActive: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Departments');
  }
};
```

```javascript
// database/migrations/04-create-job-titles-table.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('JobTitles', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      title: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      level: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      isActive: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('JobTitles');
  }
};
```

- [ ] **Step 9: Commit department and job title implementation**

```bash
git add server/models/Department.js server/models/JobTitle.js server/controllers/departmentController.js server/controllers/jobTitleController.js server/routes/departments.js server/routes/jobTitles.js server/validators/departmentValidator.js server/validators/jobTitleValidator.js server/server.js database/migrations/
git commit -m "feat: implement department and job title management with CRUD endpoints"
```

### Phase 3: Attendance & Leave Management

Now let's move to Phase 3: Attendance & Leave Management