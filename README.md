# DAYFLOW HRMS — Modern Human Resource Management System

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Stack](https://img.shields.io/badge/Stack-MERN--Stack-green.svg)
![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen.svg)
![Build](https://img.shields.io/badge/Build-Passing-success.svg)

**Dayflow HRMS** is an enterprise-grade, full-stack Human Resource Management System engineered to streamline workforce operations, automate monthly payroll calculations, enforce leave policies, and provide real-time HR analytics.

---

## 🚀 Business Impact & Value Proposition

Traditional HR operations suffer from fragmented attendance logs, manual salary calculations, and delayed leave approvals. **Dayflow** solves these operational bottlenecks by providing:

- **Automated Payroll Deductions:** Dynamically calculates unpaid leave deductions `(baseSalary / 30 * unpaidDays)` based on approved leave requests, reducing manual payroll errors to zero.
- **Enforced Leave Policies:** Automatically enforces monthly paid leave quotas (e.g. 3 paid days/month). Excess requests transition into unpaid leaves, giving organization leaders total fiscal control.
- **Real-Time Workforce Visibility:** Provides HR and Administrators with live status indicators (`Present`, `Absent`, `Half-day`, `Leave`) cross-referenced dynamically against attendance and leave logs.
- **Official Paystub Generation:** Empowers employees with one-click, printable salary slips, accelerating administrative transparency.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React
- **HTTP Client:** Axios

### **Backend**
- **Runtime:** Node.js + Express.js
- **Database ORM:** Mongoose (MongoDB Atlas Cloud Cluster)
- **Authentication:** JWT (JSON Web Tokens) + Cookie Sessions
- **OAuth Providers:** Real Google OAuth 2.0 & GitHub OAuth
- **Email Delivery:** Nodemailer (SMTP / Terminal Logging)

---

## 🏗️ System Architecture

```
                       ┌─────────────────────────┐
                       │   React + Vite Client   │
                       │ (Tailwind UI & Modals)  │
                       └────────────┬────────────┘
                                    │
                               REST API (Axios)
                                    │
                       ┌────────────▼────────────┐
                       │   Node.js / Express     │
                       │     Backend Server      │
                       └─────┬──────────────┬────┘
                             │              │
        ┌────────────────────▼──┐        ┌──▼────────────────────┐
        │  OAuth 2.0 Providers  │        │   MongoDB Atlas       │
        │ (Google & GitHub Auth)│        │ (Cloud Source of Truth)│
        └───────────────────────┘        └───────────────────────┘
```

---

## ✨ Core Features & Modules

### 1. **Authentication & Email Verification**
- **Email/Password Signup:** Includes mandatory 6-digit dynamic OTP verification.
- **Social OAuth:** Real Google and GitHub OAuth 2.0 single sign-on without mock credentials.
- **Role-Based Access Control (RBAC):** Strict separation between `Employee`, `HR`, and `Admin` permissions.

### 2. **Dynamic Payroll & Salary Slips**
- **Structure:** Per-employee base salary, allowances, standard deductions, and paid leave limits.
- **Automatic Deductions:** Unpaid leave days automatically deduct from net pay at daily rate `(Base / 30)`.
- **Salary Slips:** One-click official paystub viewer & print dialog for both employees and HR.

### 3. **Smart Leave Management**
- **Leave Types & Durations:** Full-day (1.0d) and Half-day (0.5d) leave options.
- **Live Quota Tracking:** Real-time badge counter showing remaining monthly paid leaves.
- **Calendar Integration:** Interactive graphical date picker with past-date disablement.

### 4. **Real-Time Workforce Attendance**
- **Self Check-In / Check-Out:** Live shift timer calculating exact work duration in hours.
- **Admin Workforce Status:** Displays live employee status (`Present`, `Half-day`, `On Approved Leave`, `Absent`).

### 5. **Profile Self-Service & Directory**
- **Strict Scope Controls:** Employees edit *only* Phone, Address, and Avatar. Administrators manage full profile fields, departments, and designations.
- **Avatar Support:** Support for custom image file uploads and remote image URLs.

### 6. **HR Analytics & Notifications**
- **Live Reports:** Attendance rates, department workforce distributions, and monthly payroll budget calculations.
- **Notifications System:** Real-time bell notifications triggered on leave applications, approvals, and rejections.

---

## 💻 Local Setup & Installation

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/Odoo_Hackathon_2026_PitchPerfect.git
cd Odoo_Hackathon_2026_PitchPerfect
```

### **2. Setup Backend Server**
```bash
cd server
npm install
```

Create a `.env` file inside `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dayflow?retryWrites=true&w=majority
JWT_SECRET=supersecretdayflowkey12345
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=dayflow-session-secret-2026
```

Seed initial development test accounts:
```bash
npm run seed
```

Start backend server:
```bash
npm run dev
```

### **3. Setup Frontend Client**
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```

The application will launch at `http://localhost:5173`.

---


---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
