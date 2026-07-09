# AlumioDTU 🎓

**The Alumni-Student Networking Platform DTU Deserved — But Never Had.**

> _"Your career shouldn't depend on who you happen to know in a WhatsApp group."_

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_ORM-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution--alumiodtu)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚨 The Problem

Every year, thousands of students enter DTU believing that hard work and good grades will automatically open doors. **They're wrong.** Not because effort doesn't matter — but because the system is fundamentally broken.

### Students Are Left Behind — Not Because They Lack Talent, But Because They Lack Access

The harsh reality of college life in India:

- **🚪 Opportunities are locked inside private circles.** The best internships, referrals, and job openings never make it to public forums. They circulate in closed WhatsApp groups, alumni cliques, and LinkedIn DMs between people who already know each other. If you're not in the loop, you don't even know what you're missing.

- **🧭 Students don't get the right mentorship at the right time.** A second-year student confused about whether to pursue ML or backend development has no structured way to talk to someone who's been through the same decision. By the time they figure things out on their own, they've lost semesters of productive time. **The right guidance at the right moment can change the trajectory of an entire career** — and most students never get it.

- **📩 Cold outreach is broken.** Students resort to sending generic "Hi sir, I'm from DTU" messages on LinkedIn to strangers and getting ignored. There's no trust layer, no shared context, no reason for an alumni to respond to the 50th identical message in their inbox.

- **📊 Information is scattered and chaotic.** Placement experiences, company reviews, interview prep, higher-studies guidance — all of it is fragmented across Telegram channels, WhatsApp forwards, random Google Docs, and spreadsheets that go stale within months.

- **🏗️ Existing alumni portals are dead directories.** Most institutional alumni pages are glorified databases — a list of names nobody visits, with no engagement tools, no reason to come back, and no value for either side.

- **⏳ Senior-junior knowledge transfer barely exists.** The best learnings from a graduating batch — what worked, what didn't, which companies to target, which skills actually matter — die with that batch instead of compounding for the next one.

- **🎓 First-generation students and those without connections suffer the most.** Students whose parents didn't go to engineering college, who come from small towns, who don't have an older sibling in tech — they're starting from zero while others are already plugged into networks.

**The gap between a connected student and a disconnected one isn't just about opportunities — it's about awareness that those opportunities even exist.**

---

## 💡 Our Solution — AlumioDTU

AlumioDTU is a **full-stack, real-time alumni-student networking platform** purpose-built for Delhi Technological University. It's not another dead directory. It's a living ecosystem where students find mentors, alumni give back, and opportunities flow openly instead of staying locked behind closed doors.

### The Core Philosophy

| Principle | What It Means |
|---|---|
| **Open Access** | Every student sees every opportunity — no private circles, no gatekeeping |
| **Structured Mentorship** | 1-on-1 connections with scheduling, goal tracking, and accountability |
| **Two-Way Value** | Alumni aren't just "helping" — they're building reputation, recruiting talent, and staying connected |
| **Trust Layer** | Verified DTU identity means alumni know exactly who they're talking to |
| **Knowledge Compounding** | Community discussions, career threads, and shared experiences create institutional memory |

---

## ✨ Features

### 🔐 Authentication & Identity

- **Role-Based Registration** — Separate flows for Students, Alumni, and Admins with distinct onboarding journeys
- **Email Verification** — Nodemailer-powered verification with secure tokenized links
- **Password Recovery** — Forgot password flow with time-limited reset tokens
- **JWT Authentication** — Secure access + refresh token rotation stored in HTTP-only cookies
- **Alumni Verification** — Admin-reviewed verification system to ensure alumni authenticity
- **Guided Onboarding** — Role-specific onboarding that walks users through profile setup step by step

### 🔍 Smart Alumni Directory

- **Advanced Search & Filtering** — Search alumni by name, batch year, branch (CSE, IT, ECE, EE, ME, CE, and 8 more), company, industry, location, and skills
- **Rich Alumni Profiles** — Full career journey, current designation, mentorship availability, skills, social links, and LinkedIn integration
- **Student Profiles** — Academic details, skills, career goals, projects portfolio, resume upload, and achievements
- **Profile Completion Score** — Gamified progress tracking that encourages users to build complete profiles

### 🎯 Mentorship Hub

- **Mentorship Requests** — Students can send personalized mentorship requests to available alumni with a clear message about what they need
- **Capacity Management** — Alumni set their mentoring capacity (default: 3 mentees) so they're never overwhelmed
- **Session Scheduling** — Structured mentorship sessions with date, time, duration, topic, and meeting link
- **Session Tracking** — Complete status management: scheduled → completed/cancelled
- **Feedback & Ratings** — Mentees rate mentors after sessions; alumni build visible mentor ratings
- **Session Notes** — Both sides can document takeaways, action items, and next steps

### 💼 Jobs & Opportunities Board

- **Alumni-Posted Opportunities** — Internships, full-time roles, part-time positions, and contract work posted directly by alumni from their companies
- **Detailed Listings** — Job type, work mode (remote/onsite/hybrid), location, salary/stipend ranges, required skills, experience level, and application deadlines
- **In-Platform Applications** — Students apply with resume and optional cover letter without leaving the platform
- **Referral Tracking** — Alumni can refer applicants, creating a visible referral chain
- **Application Pipeline** — Full status tracking: Applied → Reviewed → Shortlisted → Hired (or Rejected)
- **Save Jobs** — Bookmark interesting opportunities to apply later
- **My Applications** — Dashboard view of all submitted applications and their current status

### 💬 Real-Time Messaging

- **Socket.io-Powered Chat** — Instant messaging with real-time delivery using WebSocket connections
- **Conversation Threading** — Organized conversation list with last message preview and timestamps
- **Unread Counts** — Per-conversation unread message tracking
- **Online Presence** — Real-time online/offline/away status indicators
- **File Attachments** — Share documents, images, and files within conversations
- **Read Receipts** — Track which messages have been read by participants

### 🌐 Community Forums

- **Categorized Discussions** — Posts organized into Placements, Internships, Higher Studies, Startups, and General categories
- **Rich Content** — Full text posts with tags for easy discovery
- **Upvote System** — Community-driven content curation; best advice rises to the top
- **Threaded Comments** — Nested reply system with parent-child comment relationships
- **Comment Upvotes** — Individual comment voting for granular content quality signals
- **Pinned Posts** — Admins can pin important announcements and resources
- **Content Moderation** — Flag and review system to maintain discussion quality

### 📅 Events & Reunions

- **Event Types** — Alumni Talks, Webinars, Networking Sessions, Workshops, and Meetups
- **Event Creation** — Organizers set title, description, date/time, location (online or physical), meeting link, cover image, and attendee cap
- **Registration System** — One-click registration with automatic attendee counting
- **Event Reminders** — Opt-in reminder notifications for registered attendees
- **Registration Status** — Track: Registered → Attended / Cancelled

### 🏆 Achievements & Gamification

- **Badge System** — Earn badges for platform engagement (mentoring, posting, helping others)
- **Points System** — Accumulate points for different activities
- **Achievement Showcase** — Display earned badges and titles on your profile
- **Engagement Incentives** — Gamification that encourages consistent participation

### 🔔 Notifications

- **Real-Time Notifications** — Instant alerts delivered via Socket.io
- **Comprehensive Coverage** — Notifications for mentorship requests/responses, new messages, job postings, application updates, event reminders, community replies & upvotes, achievement unlocks, and system announcements
- **Read/Unread Management** — Mark individual or bulk notifications as read
- **Deep Linking** — Click any notification to jump directly to the relevant content

### 🛡️ Admin Panel

- **User Management** — View, search, ban/unban users across all roles
- **Alumni Verification Queue** — Review and approve/reject alumni verification requests
- **Content Moderation** — Review reported content (spam, harassment, inappropriate, misinformation) with status tracking (pending → reviewed → resolved/dismissed)
- **Platform Analytics** — Dashboard with user growth metrics, engagement data, and platform health indicators

### 🎨 UI/UX Highlights

- **Lamp Effect Landing Page** — Stunning animated hero section with Three.js-powered 3D effects
- **3D Marquee** — Immersive visual elements on the landing page
- **Animated Testimonials** — Social proof section with smooth transitions
- **Moving Border Buttons** — Premium micro-interaction effects
- **Shine Buttons** — Polished CTA elements with shimmer animations
- **Responsive Sidebar & Topbar** — Adaptive navigation that works across devices
- **Left Drawer** — Collapsible navigation drawer for mobile
- **Framer Motion Animations** — Smooth page transitions and component animations throughout

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework with the latest concurrent features |
| **Vite 8** | Lightning-fast build tool and dev server |
| **React Router v7** | Client-side routing with nested layouts |
| **Redux Toolkit** | Global state management (auth, UI state) |
| **RTK Query** | Server-state management and API caching |
| **Framer Motion** | Declarative animations and page transitions |
| **Three.js** | 3D visual effects on the landing page |
| **Socket.io Client** | Real-time messaging and notifications |
| **Axios** | HTTP client for API requests |
| **React Hot Toast** | Toast notification system |
| **React Icons** | Icon library |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **date-fns** | Date formatting and manipulation |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web server framework |
| **Prisma ORM** | Type-safe database client and schema management |
| **PostgreSQL** | Primary relational database |
| **Socket.io** | WebSocket server for real-time features |
| **JWT** | Access + refresh token authentication |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Transactional email (verification, password reset) |
| **Cloudinary** | Cloud-based image/file storage |
| **Multer** | File upload handling middleware |
| **Joi** | Request validation schemas |
| **Helmet** | HTTP security headers |
| **Express Rate Limit** | API rate limiting and abuse prevention |
| **Morgan** | HTTP request logging |
| **Cookie Parser** | Secure cookie handling |
| **CORS** | Cross-origin request configuration |

### DevOps & Tooling

| Technology | Purpose |
|---|---|
| **Vercel** | Frontend deployment |
| **Prisma Migrate** | Database schema migrations |
| **Prisma Studio** | Visual database browser |
| **ESLint** | Code linting |
| **React Compiler (Babel)** | Automatic React optimizations |
| **Git & GitHub** | Version control |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React 19 + Vite)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Auth    │ │Dashboard │ │Directory │ │ Jobs     │ │Community │ │
│  │  Pages   │ │  Router  │ │  Page    │ │  Board   │ │  Forum   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │             │            │             │            │       │
│  ┌────┴─────────────┴────────────┴─────────────┴────────────┴────┐ │
│  │              Redux Toolkit + RTK Query (State Layer)          │ │
│  └──────────────────────┬───────────────────────────────────────┘ │
│                         │ HTTP (Axios) + WebSocket (Socket.io)     │
└─────────────────────────┼──────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SERVER (Express 5 + Node.js)                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Middleware: Helmet │ CORS │ Rate Limiter │ Auth │ Validator │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────────┐  │
│  │  Auth   │ │  Users  │ │  Jobs   │ │ Events  │ │  Admin     │  │
│  │ Routes  │ │ Routes  │ │ Routes  │ │ Routes  │ │  Routes    │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └─────┬──────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────────┐  │
│  │Mentors  │ │  Chat   │ │Communit│ │ Notifs  │ │  Services  │  │
│  │ Routes  │ │ Routes  │ │ Routes  │ │ Routes  │ │Email/Token │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └─────┬──────┘  │
│       └────────────┴──────────┴────────────┴────────────┘          │
│                              │                                     │
│  ┌───────────────────────────┼──────────────────────────────────┐  │
│  │                    Prisma ORM (Data Layer)                   │  │
│  └───────────────────────────┼──────────────────────────────────┘  │
│                              │                                     │
│  ┌───────────────┐   ┌──────┴──────┐   ┌──────────────────────┐   │
│  │  Socket.io    │   │ PostgreSQL  │   │     Cloudinary       │   │
│  │  (Realtime)   │   │ (Database)  │   │  (File Storage)      │   │
│  └───────────────┘   └─────────────┘   └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

The platform uses **PostgreSQL** with **Prisma ORM** and includes **14 models**:

| Model | Purpose |
|---|---|
| `User` | Core identity — email, role (student/alumni/admin), auth tokens, online status, social links |
| `StudentProfile` | Branch, year, skills, interests, career goals, resume, projects, achievements |
| `AlumniProfile` | Company, designation, industry, location, experience, mentorship availability & ratings |
| `MentorshipRequest` | Mentee → Mentor connection with status tracking and feedback |
| `MentorshipSession` | Scheduled sessions with topic, duration, meeting link, and notes |
| `Conversation` | Chat conversation container with last message metadata |
| `ConversationParticipant` | Links users to conversations with unread counts |
| `Message` | Individual messages with content, attachments, and read tracking |
| `Job` | Job/internship listings with type, work mode, salary, skills, deadline |
| `JobApplication` | Application records with resume, cover letter, status, and referral tracking |
| `Post` | Community forum posts with categories, tags, upvotes, and moderation flags |
| `Comment` | Threaded comments with nested reply support |
| `Event` | Platform events with type, scheduling, capacity, and registration |
| `Notification` | In-app notification system with type-based categorization |
| `Achievement` | Gamification badges with points and descriptions |
| `Report` | Content/user moderation reports with admin resolution tracking |

---

## 📡 API Endpoints

### Authentication — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user (student/alumni) |
| POST | `/login` | Login with email and password |
| POST | `/forgot-password` | Request password reset email |
| POST | `/reset-password/:token` | Reset password with token |
| GET | `/verify-email/:token` | Verify email address |

### Users — `/api/users`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/me` | Get current user profile |
| GET | `/:id` | Get user profile by ID |
| PUT | `/profile` | Update user profile |
| GET | `/directory` | Browse alumni/student directory with filters |
| PUT | `/settings` | Update account settings |

### Mentorship — `/api/mentorship`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/request` | Send mentorship request |
| GET | `/requests` | Get mentorship requests (sent/received) |
| PUT | `/request/:id` | Accept/reject mentorship request |
| POST | `/session` | Schedule mentorship session |
| PUT | `/session/:id` | Update session status |
| POST | `/feedback` | Submit mentor feedback and rating |

### Chat — `/api/chat`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/conversations` | List user conversations |
| POST | `/conversations` | Create new conversation |
| GET | `/conversations/:id/messages` | Get conversation messages |
| POST | `/conversations/:id/messages` | Send a message |

### Jobs — `/api/jobs`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all active jobs with filters |
| POST | `/` | Post a new job (alumni only) |
| GET | `/:id` | Get job details |
| POST | `/:id/apply` | Apply to a job |
| GET | `/my-applications` | View submitted applications |
| POST | `/:id/save` | Save/unsave a job |

### Community — `/api/community`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/posts` | List community posts with category filter |
| POST | `/posts` | Create a new post |
| GET | `/posts/:id` | Get post with comments |
| POST | `/posts/:id/upvote` | Upvote a post |
| POST | `/posts/:id/comments` | Add a comment |
| POST | `/comments/:id/upvote` | Upvote a comment |

### Events — `/api/events`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List upcoming events |
| POST | `/` | Create a new event |
| GET | `/:id` | Get event details |
| POST | `/:id/register` | Register for an event |
| PUT | `/:id` | Update event details |

### Notifications — `/api/notifications`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get user notifications |
| PUT | `/:id/read` | Mark notification as read |
| PUT | `/read-all` | Mark all as read |

### Admin — `/api/admin`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users with filters |
| PUT | `/users/:id/ban` | Ban/unban a user |
| GET | `/verifications` | Pending verification requests |
| PUT | `/verifications/:id` | Approve/reject verification |
| GET | `/reports` | View content reports |
| PUT | `/reports/:id` | Resolve/dismiss a report |
| GET | `/analytics` | Platform analytics dashboard |

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **PostgreSQL** database (local or hosted — e.g., Supabase, Neon, Railway)
- **Cloudinary** account (for file uploads)
- **SMTP credentials** (for email — e.g., Gmail App Password, Resend, SendGrid)

### 1. Clone the Repository

```bash
git clone https://github.com/thatGuy4u/AlumioDTU.git
cd AlumioDTU
```

### 2. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
```

### 3. Configure Environment Variables

Create `.env` files in both root and `server/` directories (see [Environment Variables](#-environment-variables) below).

### 4. Set Up the Database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed admin user
npm run seed

# (Optional) Open Prisma Studio to browse data
npx prisma studio
```

### 5. Start Development Servers

```bash
# Terminal 1 — Frontend (from project root)
npm run dev

# Terminal 2 — Backend (from server/)
cd server
npm run dev
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:5000`.

---

## 🔑 Environment Variables

### Frontend (`.env` in project root)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (`server/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/alumiodtu

# Auth
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Client
CLIENT_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@alumiodtu.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=development
```

---

## 📂 Project Structure

```
AlumioDTU/
├── index.html                   # HTML entry point
├── package.json                 # Frontend dependencies
├── vite.config.js               # Vite configuration
├── vercel.json                  # Vercel deployment config
├── eslint.config.js             # ESLint configuration
│
├── src/                         # ── Frontend Source ──
│   ├── main.jsx                 # React entry point (Router + Redux Provider)
│   ├── App.jsx                  # Route definitions & layout structure
│   ├── App.css                  # Global styles
│   ├── index.css                # Base CSS reset
│   │
│   ├── components/              # Landing page components
│   │   ├── Navbar.jsx           # Top navigation bar
│   │   ├── Hero.jsx             # Hero section with CTA
│   │   ├── LampEffect.jsx      # Animated lamp visual effect
│   │   ├── Features.jsx         # Feature cards grid
│   │   ├── HowItWorks.jsx      # Step-by-step guide
│   │   ├── Testimonials.jsx     # User testimonials carousel
│   │   ├── Footer.jsx          # Site footer
│   │   ├── ThreeDMarquee.jsx   # 3D marquee animation
│   │   ├── MovingBorderButton.jsx  # Animated border button
│   │   └── ShineButton.jsx     # Shimmer effect button
│   │
│   ├── layouts/                 # Layout wrappers
│   │   ├── AuthLayout.jsx       # Auth pages layout
│   │   └── AppLayout.jsx       # Authenticated app layout
│   │
│   ├── pages/                   # Route-level page components
│   │   ├── auth/                # Login, Signup, Forgot/Reset Password, Verify Email
│   │   ├── onboarding/          # Student & Alumni onboarding flows
│   │   ├── dashboard/           # Role-based dashboard router
│   │   ├── profile/             # View & edit profile
│   │   ├── directory/           # Alumni/student directory search
│   │   ├── mentorship/          # Mentorship requests & sessions
│   │   ├── messages/            # Real-time chat interface
│   │   ├── jobs/                # Job board, details, posting, applications
│   │   ├── community/           # Forum posts & discussions
│   │   ├── events/              # Events listing, details, creation
│   │   ├── achievements/        # Badges & gamification
│   │   ├── notifications/       # Notification center
│   │   ├── settings/            # Account settings
│   │   └── admin/               # Admin panel (users, verifications, moderation, analytics)
│   │
│   ├── ui/                      # Shared UI components
│   │   ├── Sidebar.jsx          # App sidebar navigation
│   │   ├── Topbar.jsx           # App top bar with search & notifications
│   │   └── LeftDrawer.jsx       # Mobile navigation drawer
│   │
│   ├── store/                   # Redux state management
│   │   ├── index.js             # Store configuration
│   │   ├── slices/
│   │   │   ├── authSlice.js     # Authentication state
│   │   │   └── uiSlice.js       # UI state (sidebar, modals)
│   │   └── api/                 # RTK Query API definitions
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useMediaQuery.js     # Responsive breakpoint hook
│   │
│   ├── utils/                   # Utility functions & constants
│   ├── styles/                  # Additional stylesheets
│   └── assets/                  # Static assets (images, icons)
│
└── server/                      # ── Backend Source ──
    ├── server.js                # Express app + Socket.io setup
    ├── package.json             # Backend dependencies
    │
    ├── config/                  # Configuration
    │   ├── db.js                # Prisma client instance
    │   └── socket.js            # Socket.io initialization
    │
    ├── prisma/                  # Database
    │   └── schema.prisma        # Full database schema (14 models, 17 enums)
    │
    ├── routes/                  # API route definitions
    │   ├── auth.routes.js       # Authentication endpoints
    │   ├── users.routes.js      # User & profile endpoints
    │   ├── mentorship.routes.js # Mentorship endpoints
    │   ├── chat.routes.js       # Chat & messaging endpoints
    │   ├── jobs.routes.js       # Job board endpoints
    │   ├── community.routes.js  # Community forum endpoints
    │   ├── events.routes.js     # Events endpoints
    │   ├── notifications.routes.js  # Notification endpoints
    │   └── admin.routes.js      # Admin panel endpoints
    │
    ├── controllers/             # Request handlers
    │   └── auth.controller.js   # Auth business logic
    │
    ├── middleware/               # Express middleware
    │   ├── auth.js              # JWT verification & user extraction
    │   ├── roleGuard.js         # Role-based access control
    │   ├── rateLimiter.js       # API rate limiting
    │   ├── errorHandler.js      # Global error handling
    │   ├── upload.js            # Cloudinary file upload
    │   └── validate.js          # Joi validation middleware
    │
    ├── services/                # Business logic services
    │   ├── email.service.js     # Email templates & sending
    │   ├── token.service.js     # JWT token generation
    │   └── notification.service.js  # In-app notification creation
    │
    ├── socket/                  # WebSocket handlers
    │   ├── chatHandler.js       # Real-time messaging logic
    │   ├── presenceHandler.js   # Online/offline status tracking
    │   └── notificationHandler.js  # Real-time notification delivery
    │
    ├── validators/              # Request validation schemas
    │   └── auth.validator.js    # Auth input validation (Joi)
    │
    └── utils/                   # Utilities
        └── seedAdmin.js         # Admin user seeder script
```

---

## 🤝 Contributing

Contributions are welcome! Whether it's fixing a bug, adding a feature, improving documentation, or suggesting an idea — all contributions are appreciated.

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to your fork: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style and project structure
- Write meaningful commit messages (use [Conventional Commits](https://www.conventionalcommits.org/))
- Test your changes before submitting a PR
- Update documentation if your changes affect the README or API

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ for the DTU community.

If you've ever felt lost trying to navigate your career without guidance — this platform is for you.  
If you're an alumni who wishes someone had helped you when you were starting out — this platform is your chance to pay it forward.

**AlumioDTU — Because your potential shouldn't be limited by your network.**

---

<p align="center">
  <strong>⭐ Star this repo if you believe every student deserves equal access to opportunities.</strong>
</p>

