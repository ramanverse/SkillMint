# 💎 SkillMint: Technical & Product Report
### **The Elite Student Freelance Marketplace**

---

## 📖 1. Project Introduction
**SkillMint** is a full-stack, "student-first" freelance marketplace. It provides a professional ecosystem where university students can showcase their technical and creative skills (coding, design, content creation, etc.) to a global audience.

Unlike generic freelance platforms, SkillMint focuses on a **premium student experience**, helping them build a professional brand from scratch while balancing their academic life.

---

## 🎯 2. Product Vision & Problem Statement
*   **The Problem**: Many students have top-tier skills but face a "cold-start" problem on mainstream platforms (Upwork, Fiverr) where competition from established professionals is overwhelming.
*   **The Solution**: A curated space for students to offer services, secure orders, and communicate in real-time. SkillMint serves as both a **marketplace** and a **professional portfolio builder**.

---

## 💻 3. Technology Stack Breakdown

| Layer | Technology | Engineering Rationale |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Chosen for its component-based architecture and highly efficient rendering with the Vite build tool. |
| **Styling** | Tailwind CSS & Framer Motion | Tailwind allows for rapid, utility-first UI development. Framer Motion handles the complex orchestration of premium animations. |
| **Backend** | Node.js (Express) | Asynchronous, event-driven architecture that scales well for I/O intensive tasks like real-time communication. |
| **Real-time** | Socket.io | Enables low-latency, bi-directional communication between the client and server for instant messaging. |
| **Database** | PostgreSQL (on Supabase) | A robust relational database for handling complex relationships between Users, Gigs, and Orders. |
| **ORM** | Prisma | Provides type-safe database queries, automated migrations, and reduces SQL boilerplate. |
| **Auth** | Google OAuth (@react-oauth/google) | Reduces friction for the user by enabling secure, one-click social authentication. |
| **Hosting** | Vercel (FE) & Render (BE) | Leveraging Vercel's Edge network for fast static delivery and Render's managed instances for the Node.js server. |

---

## 🏗️ 4. System Architecture

The project is structured as a **Monorepo**, separating the codebase into `frontend` and `backend` workspaces while sharing a single `package.json` for dependency management.

### **A. Core Frontend Architecture**
*   **Context API**: Used for Global State Management (Auth, Theme).
*   **Protected Routes**: Advanced routing middleware that prevents unauthenticated users from accessing the Dashboard or Chat.
*   **Axios Interceptors**: Used for centralizing API calls and handling Bearer Token injection for secure requests.

### **B. Core Backend Architecture**
*   **Modular Routes**: Separated logic for `auth`, `gigs`, `orders`, and `messages` for clean maintainability.
*   **JWT Authentication**: Utilizing JSON Web Tokens for stateless session management.
*   **Global Exception Handling**: A centralized middleware to catch and process errors across all API endpoints.

---

## 🔥 5. Key Features & Modules

### **🚀 The Multi-Step Gig Creator**
Students can create services through a structured, 5-step flow. This ensures high-quality listings and guides the student through the process of defining their value proposition.
*   *Key Logic*: Uses React local state to track progress and final validation before the `POST` request to the backend.

### **💬 Real-time Messaging System**
The chat system is the heart of collaboration on SkillMint.
*   *Implementation*: Integrated **Socket.io**. When a message is sent, it is persisted in the PostgreSQL database and simultaneously "emitted" to the recipient's active socket room for instant delivery.

### **🛠️ Intelligent Dashboard**
Role-based dashboards change their layout and functionality depending on whether the user is logged in as a **Buyer** (Management) or a **Seller** (Work Tracking).

---

## 📊 6. Data Modeling (Prisma Schema)

We designed a relational schema that prioritizes data integrity.
*   **User ↔ Gig**: One-to-Many (One student can have many listings).
*   **User ↔ Order**: One-to-Many (Tracking both purchases and sales).
*   **Message ↔ Room**: Messages are grouped into rooms for efficient query indexing.

```prisma
// Example Snippet: The core relation
model Gig {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Float
  category    String
  sellerId    String
  seller      User     @relation(fields: [sellerId], references: [id])
}
```

---

## 🛡️ 7. Security & Best Practices
*   **CORS Policy**: Configured to only allow requests from the specific Vercel frontend URL.
*   **Security Headers**: Implementation of `Helmet` (optional) and standard security headers.
*   **Environment variable isolation**: Ensuring that sensitive keys (Supabase URLs, JWT Secrets) never leave the production environment.

---

## 🧩 8. Technical Challenges Overcome (Critical for Interviews)

### **I. SQLite to PostgreSQL Migration**
*   *Problem*: Local development used SQLite, but production required the scalability of PostgreSQL via Supabase.
*   *Solution*: I performed a full migration of the Prisma migration history, cleared legacy SQLite locks, and re-initialized the provider for a seamless production sync.

### **II. Folder Structure Refactoring (Project Re-org)**
*   *Problem*: Directories were renamed from `client/server` to `frontend/backend`.
*   *Solution*: I manually updated all workspace linkages, fixed script paths in `package.json`, and updated deployment settings on Render/Vercel (Root Directory) to ensure zero downtime during the transition.

---

## 🚀 9. Future Roadmap & Scalability
1.  **Payment Gateway Integration**: Integrating Stripe for secure transaction handling.
2.  **Notification Engine**: Adding email and push notifications using AWS SES or SendGrid.
3.  **Media Storage**: Moving from simple image links to AWS S3 or Supabase Storage for high-res portfolio images.

---

### **💡 Summary for Interviewers**
"SkillMint demonstrates a strong understanding of **Full-Stack JavaScript development**, focusing on **type-safety** (Prisma), **real-time communication** (Socket.io), and **modern deployment lifecycles**. It’s built with scalability and premium user experience at the core of every architectural decision."

---
*Report Generated: April 2026*
