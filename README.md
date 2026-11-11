# Vision Tech Solutions – Luxury Interior Design Website & Complete CMS

A production-ready, full-stack luxury interior architecture website and Role-Based Content Management System (CMS) built for **Vision Tech Solutions (`DESIGN • BUILD • TRANSFORM`)**.

---

## 1. Architecture & Technology Stack

- **Monorepo Structure**:
  - `apps/frontend` – Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, TanStack Query, TipTap Rich Text Editor, Lucide Icons.
  - `apps/backend` – Node.js, Express.js, TypeScript, Mongoose ODM, JWT + HttpOnly Cookie Authentication, Role-Based Access Control (RBAC), Multer + Cloudinary v2 SDK (with automatic local CDN fallback), Nodemailer, Helmet, Rate Limiting, Pino Logger, Swagger/OpenAPI 3.0.
  - `packages/shared` – Shared TypeScript interfaces, RBAC permission keys, project categories, and multilingual locale definitions.

---

## 2. Quick Start & Running Locally

### Prerequisites
- Node.js `v20+` and `npm`

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` if you wish to connect an external MongoDB Atlas cluster, Cloudinary account, or SMTP server.
> **Zero-Config Local Execution**: If a local `mongod` service is not running on port `27017`, the backend automatically boots an embedded persistent MongoDB instance in `.data/mongodb` and seeds all 8 services, 8 portfolio projects, homepage sections, testimonials, blog posts, and RBAC roles on startup.

### 3. Start Backend API & Frontend Website Together
```bash
npm run dev
```
- **Public Website**: `http://localhost:3000`
- **Admin CMS Portal**: `http://localhost:3000/admin` (Login at `http://localhost:3000/admin/login`)
- **Backend REST API**: `http://localhost:5000/api`
- **Swagger API Documentation**: `http://localhost:5000/api/docs`

---

## 3. Default Admin & RBAC Demo Credentials

All 5 roles are pre-seeded with password **`Admin@123456`**:

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin@visiontechsolutions.co.in` | `Admin@123456` | Full control over users, permissions, global settings, and all CMS modules |
| **Administrator** | `admin.ops@visiontechsolutions.co.in` | `Admin@123456` | Manage all website content, pages, projects, services, enquiries, settings |
| **Content Manager** | `content@visiontechsolutions.co.in` | `Admin@123456` | Manage pages, sections, services, testimonials, blog articles, SEO |
| **Gallery Manager** | `gallery@visiontechsolutions.co.in` | `Admin@123456` | Upload and manage gallery albums and media library assets |
| **Project Manager** | `projects@visiontechsolutions.co.in` | `Admin@123456` | Manage interior design portfolio projects and client enquiries |

---

## 4. Verification & Testing

Run the end-to-end backend & CMS verification suite:
```bash
npm test
```
Re-seed or reset the database at any time:
```bash
npm run seed
```
