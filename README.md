# PocketPal

A full-stack personal finance management application built with the MERN stack.

## Features
- Expense tracking
- Budget planning
- Analytics dashboard
- Monthly reports
- AI-powered spending suggestions

## Tech Stack
- **Frontend:** React, Tailwind CSS, Recharts
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT
- **AI:** Claude/OpenAI API

## Project Status
🚧 In active development — built incrementally, day by day.

## Getting Started

### Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Progress Log
- **Day 1:** Project scaffolding, Express server, MongoDB connection setup
- **Day 2:** User model, JWT authentication (register/login), protected routes middleware
- **Day 3:** React frontend with Vite + Tailwind CSS, auth pages (Login/Register), AuthContext, protected routes
- **Day 4:** Expense model + full CRUD API (create, read, update, delete) with user-scoped data access