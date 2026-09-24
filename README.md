# ServiceDesk Pro — IT Service Desk & Asset Management

Enterprise-grade IT Service Management (ITSM) and Asset Management web application built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

---

## Features

- **Multi-Role RBAC Support**:
  - **System Admin**: Complete administrative control, taxonomy management (Departments, Categories, SLA Policies), and audit logs.
  - **IT Operations Manager**: SLA tracking, team workload oversight, incident escalations, and performance dashboards.
  - **Technician**: Incident queue, SLA countdowns, priority handling, internal notes, resolution tracking, and work logs.
  - **Asset Manager**: Complete IT asset repository, lifecycle management, assignments, and vendor contracts.
  - **Employee**: Self-service incident submission, personal ticket tracking, hardware custody overview, and knowledge base.
- **SLA Engine**: Real-time response and resolution deadline calculation with breach detection and severity indicators.
- **Ticket Management**: Priority-coded tickets, categorizations, real-time activity timelines, comments, and work logging.
- **Asset Repository**: Hardware tags, specifications, serial numbers, warranty monitoring, and custodian assignments.
- **Knowledge Base**: IT documentation, troubleshooting guides, self-service procedures, and category filtering.
- **Clean Production UI**: Professional engineering design without placeholder or mock data dependencies.

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React, Axios, Recharts
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, bcryptjs
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a cloud URI

### 2. Backend Setup
```bash
cd server
npm install
```

Configure your environment variables in `server/.env` (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/servicedesk_pro
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=http://localhost:5173
```

Initialize baseline taxonomy and test accounts:
```bash
node src/seed.js
```

Start the backend server:
```bash
npm run dev
# or
node src/server.js
```
The backend API runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
The frontend application will be accessible at `http://localhost:5173`.

---

## Demo & Testing Credentials

All test accounts share the common password: `Password123!`

| Role | Email | Purpose |
|------|-------|---------|
| **System Admin** | `admin@servicedesk.local` | Full administrative control & taxonomy |
| **IT Manager** | `manager@servicedesk.local` | Operational dashboards & SLA oversight |
| **Technician** | `technician@servicedesk.local` | Incident troubleshooting & work logs |
| **Asset Manager** | `assetmanager@servicedesk.local` | Hardware inventory & vendor management |
| **Employee** | `employee@servicedesk.local` | Self-service tickets & asset custody |

*Quick autofill buttons for these accounts are available directly on the Sign In page.*

---

## License
MIT
