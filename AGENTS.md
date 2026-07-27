# AGENTS.md — AI Coding Assistant Guidelines & Project Architecture

This document provides system instructions, architectural standards, and operational guidelines for **AI Agents** (Cursor, Windsurf, GitHub Copilot, Claude, ChatGPT, etc.) working on this **Next.js Full-Stack Finance Management System (`fms-Next.js`)**.

---

## 🚀 1. Project Overview & Tech Stack

- **Project Purpose**: Office Finance Management System (Next.js Full-Stack Web App).
- **Domain / Deployment Target**: Hostinger Web Hosting (`https://fms.e-tmd.com/`).
- **Framework**: **Next.js 15+ (App Router)**
- **Language**: **TypeScript 5.x**
- **Styling**: **Tailwind CSS v3** (`@tailwind base; @tailwind components; @tailwind utilities;`)
- **Database & ORM**: **MySQL (Hostinger)** managed via **Prisma ORM**
- **Icons**: **Lucide React**
- **Alerts & Modals**: **SweetAlert2** (`sweetalert2`)
- **Reporting & Print**: **`react-to-print`** with CSS `@media print`
- **Primary Site Font**: **`Noto Sans Lao`** (Google Fonts)
- **Official Print/PDF Font**: **`Phetsarath` / `Phetsarath OT`** (Google Fonts)

---

## 📁 2. Directory & File Structure Conventions

```text
finance-app/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── page.tsx                # Dashboard Home Page
│   ├── expenses/page.tsx       # Expense Management
│   ├── incomes/page.tsx        # Income Management
│   ├── budgets/page.tsx        # Budget Planning
│   ├── assets/page.tsx         # Office Asset Tracking
│   ├── reports/page.tsx        # Financial Reporting & Printing
│   ├── annual-summary/page.tsx # Annual Summary Overview
│   ├── settings/
│   │   ├── page.tsx            # System Settings (Depth: 2)
│   │   ├── categories/page.tsx # Category Management (Depth: 3)
│   │   └── users/page.tsx      # User Management (Depth: 3)
│   ├── api/                    # Backend API Routes
│   │   ├── annual-summary/route.ts # API Route (Depth: 3)
│   │   └── assets/[id]/route.ts    # API Route (Depth: 4)
│   ├── layout.tsx              # Root Layout
│   └── globals.css             # Global Styles & Typography
├── components/                 # Reusable React UI Components
│   ├── Sidebar.tsx             # Main Navigation Sidebar
│   └── Navbar.tsx              # Top Navigation Header
├── lib/                        # Shared Utility Libraries
│   ├── prisma.ts               # Prisma Client Singleton (Named export: { prisma })
│   └── swal.ts                 # SweetAlert2 Helpers
├── prisma/
│   └── schema.prisma           # Prisma Data Model Definitions
├── public/                     # Static Public Assets
├── next.config.js              # Next.js Configuration (Static Export enabled)
├── package.json                # Dependencies & Scripts
├── tsconfig.json               # TypeScript Configuration
└── tailwind.config.js          # Tailwind CSS Configuration

---

## 📊 3. Lao Financial Terminology & Formatting Rules
### 3.1 Standard Translations (English → Lao)
- Incomes → ລາຍຮັບ
- Expense → ລາຍຈ່າຍ
- Budget → ງົບປະມານ
- Asset → ຊັບສີນ
- Balance → ຍອດຄົງເຫຼືອ
- Category → ໝວດໝູ່
- Report → ລາຍງານ
- Total → ລວມທັງໝົດ
- Date → ວັນທີ
- Amount → ຈຳນວນເງິນ

### 3.2 Number & Currency Formatting
- **Currency:** Use Lao Kip (₭) or LAK.
- **Number Format:** Always use comma `,` as thousand separator (e.g., `1,000,000 ₭`).
- **Decimal:** Do NOT show decimals for Lao Kip (e.g., use `50,000` not `50,000.00`).
- **Date Format:** Use `DD/MM/YYYY` format for display (e.g., `27/07/2026`).

## 🗄️ 4. Database & Prisma Rules
- **Money Fields:** MUST use `Decimal` type in Prisma schema. NEVER use `Float` for financial data to avoid precision loss.
  ```prisma
  model Expense {
    amount Decimal @db.Decimal(15, 2)
  }

---

## 🐛 5. Debugging Protocol (IMPORTANT)
When the user asks to debug an error, the AI MUST follow these steps:
- Acknowledge the Error: Read the full error message and stack trace carefully.
- Identify the Root Cause: Explain WHERE the error is happening and WHY (in simple Lao).
- Propose a Solution: Suggest 1-2 possible fixes with pros/cons.
- Provide the Fix: Show the corrected code with comments explaining what changed.
- Verify: Ask the user to test and report back.
- NEVER guess: If unsure about the cause, ask the user for more logs or context.

---

🔒 6. Security Rules
- Never expose database credentials or API keys in client-side code.
- Sanitize all user inputs to prevent SQL injection and XSS.
- Use environment variables (.env) for all sensitive data.