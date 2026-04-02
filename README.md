# 💎 SkillMint

The **Elite Student Freelance Marketplace** — a premium platform designed specifically for students to showcase their skills, build a professional brand, and connect with global opportunities.

---

## 📌 Problem

For many students, their academic skills (coding, design, writing, etc.) often remain untapped potential. Traditional freelance platforms are overcrowded, competitive for beginners, and don't cater specifically to the student-hustle culture.
At the same time, clients and startups are constantly looking for fresh, affordable student talent but lack a dedicated space to find and manage them effectively.

---

## 🚀 Solution

**SkillMint** bridges this gap by providing a high-end, efficient, and student-focused marketplace that:

*   Empowers **students to monetize** their university skills
*   Allows **clients to discover and hire** top-tier student talent
*   Facilitates **real-time collaboration** through integrated chat
*   Ensures a **secure and structured workflow** from gig creation to order completion
*   Features **Google Authentication** for seamless and secure access
*   Provides **dedicated dashboards** for both freelancers and buyers

---

## 🔥 Key Features

### 👨‍🎓 Freelancers (Students)

*   ✅ **Google Auth Integration**: Quick and secure sign-in
*   🎨 **Professional Profiles**: Showcase your skills, bio, and stats
*   💼 **Gig Management**: Create, edit, and manage your service listings
*   💬 **Real-Time Chat**: Direct communication with potential clients via Socket.io
*   📊 **Freelancer Dashboard**: Track your orders, active gigs, and earnings
*   ✨ **Premium UI**: Sleek, modern interface built for a premium feel

---

### 🏛️ Buyers (Clients)

*   🔍 **Browse Marketplace**: Discover high-quality gigs across various categories
*   📝 **Post Requests**: Call for specific services and let students find you
*   🛒 **Order Management**: Securely place and track your orders
*   👥 **Direct Messaging**: Chat with freelancers before and after placing an order
*   📂 **Buyer Dashboard**: Manage all your active and past requests/orders

---

## 💻 Tech Stack

| Layer        | Technology                                                   |
| ------------ | ------------------------------------------------------------ |
| **Frontend** | React (Vite), Tailwind CSS, Framer Motion, Lucide React      |
| **Backend**  | Node.js, Express.js, Socket.io (Real-time)                   |
| **Auth**     | Google OAuth (@react-oauth/google)                           |
| **Database** | Supabase (PostgreSQL), Prisma ORM                            |
| **Hosting**  | Vercel (Frontend), Render (Backend)                          |
| **Dev Tools**| ESLint, npm Workspaces (Monorepo)                            |

---

## 🔧 Getting Started

To run the project locally, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramanverse/SkillMint.git
   cd SkillMint
   ```

2. **Install all dependencies** (from the root)
   ```bash
   npm run install-all
   ```

3. **Setup Environment Variables**
   Create a `.env` file in the `backend/` directory with the following:
   ```env
   DATABASE_URL="your_supabase_postgresql_url"
   JWT_SECRET="your_secret_key"
   CLIENT_URL="http://localhost:5173"
   NODE_ENV=development
   ```

4. **Initialize Database** (Prisma)
   ```bash
   cd backend
   npx prisma generate
   ```

5. **Start Development**
   Return to the root and run:
   ```bash
   npm run dev
   ```
   *The project will start both the frontend (Port 5173) and backend (Port 5000) concurrently.*

---

## 🛠️ Project Objectives

*   Create a dedicated economy for student-led services
*   Provide a premium, high-trust environment for freelancers and clients
*   Simplify the transition from classroom skills to professional work
*   Leverage modern real-time technology for seamless collaboration

---

> Elevate your academic hustle with SkillMint. 🚀
