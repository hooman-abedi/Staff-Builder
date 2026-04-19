# Staff Builder – Custom Training Platform for Businesses

## 📌 Overview
Staff Builder is a full-stack web application that allows businesses and franchises to create, manage, and track customized employee training.

Unlike generic training platforms, Staff Builder enables each business location to design training that reflects its own workflows, equipment, and operational needs.

---

## 🎯 Problem
Franchises often rely on standardized training systems provided by a central organization. However, individual locations differ significantly based on facilities, staff roles, and resources.

This leads to:
- Inconsistent training
- Poor employee onboarding
- Lack of progress tracking
- Inefficient manual processes

---

## 💡 Solution
Staff Builder provides a flexible platform where employers can:
- Create role-based training categories
- Build folders and training materials (documents, videos, quizzes)
- Assign training to employees
- Track completion and performance in real time

---

## 🧩 Features

### 👨‍💼 Employer
- Create and manage staff categories
- Add employees and assign training
- Upload training materials (files, videos)
- Track employee progress and completions

### 👨‍🔧 Employee
- View assigned categories
- Access training content
- Complete training items and quizzes
- Track personal progress

### 🛠️ Admin (Internal)
- Manage users and businesses
- System-level access for support and testing

---

## 🏗️ Architecture

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **API:** RESTful endpoints
- **Authentication:** Token-based (JWT-style)

---

## 🔄 Core Workflow

1. Employer creates training content
2. Data is sent via API to backend
3. Backend validates and stores data in PostgreSQL
4. Employees access assigned training
5. Completion data is recorded and tracked
6. Employer views updated progress

---

## 🧪 Testing

The system includes:

- Unit Testing (frontend + backend)
- Integration Testing (API + UI)
- End-to-End Workflow Testing
- Role-Based Access Testing
- Error Handling Testing
- Manual Acceptance Testing

Example:
- Login validation
- Dashboard rendering
- Employee training flow
- Protected route access

---
## 🔗 Demo Video

Watch the full system demonstration:
👉 https://youtu.be/E0OyoJqZLdw

---
## 💻 GitHub Repository
https://github.com/hooman-abedi/Staff-Builder

---
## 👥 Team Members
•	Hooman Abedi
•	Amir Ghaffari

---
## 🔮 Future Improvements
•	Payment system integration for subscriptions
•	Email notification system
•	Load and performance testing
•	Real-time notifications
•	Advanced analytics dashboard

---
## 🚀 How to Run

```bash
Backend
cd server
npm install
npm run dev
---
FrontEnd
```bash
cd client
npm install
npm run dev
