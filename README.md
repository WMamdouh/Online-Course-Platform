# Online Course Platform – Backend API

A fully-featured RESTful backend for an online learning platform built with **Node.js**, **Express**, and **MongoDB (Mongoose)**. Instructors create and manage courses with lessons; students enroll, track progress, comment, and rate courses.


## Setup & Installation

### Prerequisites
- Node.js
- MongoDB (local) **or** a MongoDB Atlas connection string
- npm

### 1 – Clone and Install

```bash
git clone <your-repo-url>
cd online-course-platform
npm install
```

### 2 – Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:


### 3 – Seed the Database (Create Default Users)

Before running the server for the first time, run the seed script to create the default admin, instructor, and student accounts:

```bash
npm run seed
```

You will see:

```
- MongoDB Connected
─────────────────────────────────────
- Created admin:      admin@example.com
- Created instructor: instructor@example.com
- Created student:    student@example.com
─────────────────────────────────────
```


### 4 – Run the Server

```bash
# Development (with nodemon auto-restart)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`.

---

##  Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server in development mode with nodemon |
| `npm start` | Start server in production mode |
| `npm run seed` | Create default admin, instructor, and student in the database |


### Postman Setup for Token Refresh

Add this script to the **Scripts tab** of both your **Login** and **Refresh** requests in Postman so the token is saved automatically:

```javascript
const res = pm.response.json();
if (res.accessToken) {
    pm.collectionVariables.set("accessToken", res.accessToken);
}
```

Also make sure **"Send cookies"** is enabled in Postman Settings so the httpOnly refresh token cookie is handled automatically.


##  Roles & Permissions

| Role | Capabilities |
|------|-------------|
| `student` | Register, enroll in courses, complete lessons, comment, rate |
| `instructor` | Create/update/delete their own courses and lessons, view enrolled students |
| `admin` | Full access to all resources including user management |

> **How to create roles:**
> - `student` — anyone can self-register via `POST /api/auth/register`
> - `instructor` / `admin` — created by an admin via `POST /api/users` with `"role": "instructor"` or `"role": "admin"`
> - **First admin** — created by running `npm run seed`