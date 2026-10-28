# AlumioDTU 🎓

**The Alumni-Student Networking Platform DTU Deserved - But Never Had.**

> _"Your career shouldn't depend on who you happen to know in a WhatsApp group."_

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_ORM-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution--alumiodtu)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [License](#-license)

---

## 🚨 The Problem

Every year, thousands of students enter DTU believing that hard work and good grades will automatically open doors. **They're wrong.** Not because effort doesn't matter - but because the system is fundamentally broken.

### Students Are Left Behind - Not Because They Lack Talent, But Because They Lack Access

The harsh reality of college life in India:

- **🚪 Opportunities are locked inside private circles.** The best internships, referrals, and job openings never make it to public forums. They circulate in closed WhatsApp groups, alumni cliques, and LinkedIn DMs between people who already know each other. If you're not in the loop, you don't even know what you're missing.

- **🧭 Students don't get the right mentorship at the right time.** A second-year student confused about whether to pursue ML or backend development has no structured way to talk to someone who's been through the same decision. By the time they figure things out on their own, they've lost semesters of productive time. **The right guidance at the right moment can change the trajectory of an entire career** - and most students never get it.

- **📩 Cold outreach is broken.** Students resort to sending generic "Hi sir, I'm from DTU" messages on LinkedIn to strangers and getting ignored. There's no trust layer, no shared context, no reason for an alumni to respond to the 50th identical message in their inbox.

- **📊 Information is scattered and chaotic.** Placement experiences, company reviews, interview prep, higher-studies guidance - all of it is fragmented across Telegram channels, WhatsApp forwards, random Google Docs, and spreadsheets that go stale within months.

- **🏗️ Existing alumni portals are dead directories.** Most institutional alumni pages are glorified databases - a list of names nobody visits, with no engagement tools, no reason to come back, and no value for either side.

- **⏳ Senior-junior knowledge transfer barely exists.** The best learnings from a graduating batch - what worked, what didn't, which companies to target, which skills actually matter - die with that batch instead of compounding for the next one.

- **🎓 First-generation students and those without connections suffer the most.** Students whose parents didn't go to engineering college, who come from small towns, who don't have an older sibling in tech - they're starting from zero while others are already plugged into networks.

**The gap between a connected student and a disconnected one isn't just about opportunities - it's about awareness that those opportunities even exist.**

---

## 💡 Our Solution - AlumioDTU

AlumioDTU is a **full-stack, real-time alumni-student networking platform** purpose-built for Delhi Technological University. It's not another dead directory. It's a living ecosystem where students find mentors, alumni give back, and opportunities flow openly instead of staying locked behind closed doors.

### The Core Philosophy

| Principle | What It Means |
|---|---|
| **Open Access** | Every student sees every opportunity - no private circles, no gatekeeping |
| **Structured Mentorship** | 1-on-1 connections with scheduling, goal tracking, and accountability |
| **Two-Way Value** | Alumni aren't just "helping" - they're building reputation, recruiting talent, and staying connected |
| **Trust Layer** | Verified DTU identity means alumni know exactly who they're talking to |
| **Knowledge Compounding** | Community discussions, career threads, and shared experiences create institutional memory |

---

## ✨ Features

### 🔐 Authentication & Identity

- **Role-Based Registration** - Separate flows for Students, Alumni, and Admins with distinct onboarding journeys
- **Email Verification** - Resend-powered verification with secure tokenized links
- **Password Recovery** - Forgot password flow with time-limited reset tokens
- **JWT Authentication** - Secure access + refresh token rotation stored in HTTP-only cookies with automatic token refresh on 401 responses
- **Alumni Verification** - Admin-reviewed verification system to ensure alumni authenticity
- **Guided Onboarding** - Role-specific onboarding that walks users through profile setup step by step

### 🔍 Users Directory

- **Universal Member Search** - Discover both alumni and students in a unified directory with role filter tabs (All / Alumni / Students)
- **Advanced Search & Filtering** - Search by name, batch year, branch (CSE, IT, ECE, EE, ME, CE, and 8 more), company, industry, location, and skills
- **Rich Alumni Profiles** - Full career journey, current designation, mentorship availability, skills, social links (LinkedIn, GitHub, X, Portfolio), and more
- **Student Profiles** - Academic details, skills, career goals, projects portfolio, resume upload, and achievements
- **Social Link Validation** - Platform-specific URL validation ensures only valid LinkedIn, GitHub, X (Twitter), and portfolio links are saved

### 🎯 Mentorship Hub

- **Mentorship Requests** - Students can send personalized mentorship requests to available alumni with a clear message about what they need
- **Capacity Management** - Alumni set their mentoring capacity (default: 3 mentees) so they're never overwhelmed
- **Session Scheduling** - Structured mentorship sessions with date, time, duration, topic, and meeting link
- **Session Tracking** - Complete status management: scheduled → completed/cancelled
- **Feedback & Ratings** - Mentees rate mentors after sessions; alumni build visible mentor ratings
- **Session Notes** - Both sides can document takeaways, action items, and next steps

### 💼 Jobs & Opportunities Board

- **Alumni-Posted Opportunities** - Internships, full-time roles, part-time positions, and contract work posted directly by alumni from their companies
- **Detailed Listings** - Job type, work mode (remote/onsite/hybrid), location, salary/stipend ranges, required skills, experience level, and application deadlines
- **In-Platform Applications** - Students apply with resume and optional cover letter without leaving the platform
- **Referral Tracking** - Alumni can refer applicants, creating a visible referral chain
- **Application Pipeline** - Full status tracking: Applied → Reviewed → Shortlisted → Hired (or Rejected)
- **Save Jobs** - Bookmark interesting opportunities to apply later
- **My Applications** - Dashboard view of all submitted applications and their current status

### 💬 Real-Time Messaging

- **Socket.io-Powered Chat** - Instant messaging with real-time delivery using WebSocket connections
- **Conversation Threading** - Organized conversation list with last message preview and timestamps
- **Unread Counts** - Per-conversation unread message tracking
- **Online Presence** - Real-time online/offline/away status indicators
- **File Attachments** - Share documents, images, and files within conversations
- **Read Receipts** - Track which messages have been read by participants

### 🌐 Community Forums

- **Categorized Discussions** - Posts organized into Placements, Internships, Higher Studies, Startups, and General categories
- **Rich Content** - Full text posts with tags for easy discovery
- **Upvote System** - Community-driven content curation; best advice rises to the top
- **Threaded Comments** - Nested reply system with parent-child comment relationships
- **Comment Upvotes** - Individual comment voting for granular content quality signals
- **Pinned Posts** - Admins can pin important announcements and resources
- **Content Moderation** - Flag and review system to maintain discussion quality

### 📅 Events & Reunions

- **Event Types** - Alumni Talks, Webinars, Networking Sessions, Workshops, and Meetups
- **Event Creation** - Organizers set title, description, date/time, location (online or physical), meeting link, cover image, and attendee cap
- **Registration System** - One-click registration with automatic attendee counting
- **Event Reminders** - Opt-in reminder notifications for registered attendees
- **Registration Status** - Track: Registered → Attended / Cancelled

### 🏆 Achievements & Gamification

- **Badge System** - Earn badges for platform engagement (mentoring, posting, helping others)
- **Points System** - Accumulate points for different activities
- **Achievement Showcase** - Display earned badges and titles on your profile
- **Engagement Incentives** - Gamification that encourages consistent participation

### 🔔 Notifications

- **Real-Time Notifications** - Instant alerts delivered via Socket.io
- **Comprehensive Coverage** - Notifications for mentorship requests/responses, new messages, job postings, application updates, event reminders, community replies & upvotes, achievement unlocks, and system announcements
- **Read/Unread Management** - Mark individual or bulk notifications as read
- **Deep Linking** - Click any notification to jump directly to the relevant content

### 🛡️ Admin Panel

- **User Management** - View, search, filter by role (Students/Alumni/Admins), ban/unban users across all roles
- **Alumni Verification Queue** - Review and approve/reject alumni verification requests
- **Content Moderation** - Review reported content (spam, harassment, inappropriate, misinformation) with status tracking (pending → reviewed → resolved/dismissed)
- **Platform Analytics** - Dashboard with user growth metrics, engagement data, and platform health indicators

### 🎨 UI/UX Highlights

- **Lamp Effect Landing Page** - Stunning animated hero section with Three.js-powered 3D effects
- **3D Marquee** - Immersive visual elements on the landing page
- **Animated Testimonials** - Social proof section with smooth transitions
- **Moving Border Buttons** - Premium micro-interaction effects
- **Shine Buttons** - Polished CTA elements with shimmer animations
- **Responsive Sidebar & Topbar** - Adaptive navigation that works across devices
- **Left Drawer** - Collapsible navigation drawer for mobile
- **Framer Motion Animations** - Smooth page transitions and component animations throughout

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
| **Resend** | Transactional email (verification, password reset) |
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

## 📜 License

**Copyright © 2026 AlumioDTU. All rights reserved.**

The source code and original materials in this repository are proprietary and protected by applicable copyright laws.

No permission is granted to copy, reproduce, modify, redistribute, sublicense, or commercially exploit this code, in whole or in part, without prior written permission from the copyright holder.

This repository is publicly accessible for viewing and evaluation purposes only. Public availability does not grant permission to reuse or incorporate its code into other projects.

For licensing inquiries, please contact the copyright holder.

**Disclaimer:** Third-party libraries, dependencies, and other materials remain subject to their respective licenses.


---

## 🙏 Acknowledgments

Built with ❤️ for the DTU community.

If you've ever felt lost trying to navigate your career without guidance - this platform is for you.  
If you're an alumni who wishes someone had helped you when you were starting out - this platform is your chance to pay it forward.

**AlumioDTU - Because your potential shouldn't be limited by your network.**

---

<p align="center">
  <strong>⭐ Star this repo if you believe every student deserves equal access to opportunities.</strong>
</p>