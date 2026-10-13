# ⚡ SynapseFlow - Personal Operating System & Semi-ERP

> **Next.js 14+ (App Router) · React 18/19 · Tailwind CSS · shadcn/ui · Prisma ORM · PostgreSQL 18**

SynapseFlow adalah personal management web application berbasis **Semi-ERP** yang mengintegrasikan 4 pilar utama produktivitas dan finansial:
1. **🎯 Career**: Pelacakan lamaran kerja (Kanban Funnel Wishlist -> Accepted) & CRM catatan interview.
2. **🏢 Employment**: Kontrak kerja tetap/magang, payday countdown, to-do list harian kantor, dan slip gaji bulanan.
3. **💼 Freelance**: Manajemen proyek klien, milestone deliverable & termin invoicing, piutang, dan penghitungan otomatis Net Profit Margin.
4. **💰 Money Ledger**: Buku kas harian terpadu yang tersinkronisasi otomatis dari Gaji Kantor dan Termin Freelance, dilengkapi modal **Quick-Add 3 Detik** di mobile & desktop.

---

## 🎨 Design System: Cyber-Forest Dual-Theme
- **Dark Mode (Default)**: Kanvas obsidian deep forest (`#081308`), Sidebar organic rich green (`#227C0E`), deep cards (`#112111`), dan pendaran aksen neon hijau (`#3BF029`).
- **Light Mode**: Kanvas soft off-white (`#F5F6F8`), Sidebar jet black obsidian (`#0C0E12`), pure white cards (`#FFFFFF`).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database & Prisma
Pastikan PostgreSQL aktif (lokal port 5432 atau Supabase), lalu sinkronkan skema:
```bash
npx prisma generate
npx prisma db push
```

### 3. Jalankan Server Dev
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 📁 Struktur Direktori
```
code/
├── prisma/
│   └── schema.prisma        # 12 Normalized PostgreSQL Models
├── src/
│   ├── app/                 # Next.js App Router (Layouts & Routes)
│   │   ├── career/          # Modul 1: Career Pipeline
│   │   ├── employment/      # Modul 2: Kerja Kantor & Kontrak
│   │   ├── freelance/       # Modul 3: Freelance & Projects
│   │   ├── money/           # Modul 4: Money & Cashflow
│   │   ├── settings/        # System & Multi-tenant Preferences
│   │   ├── globals.css      # Cyber-Forest Design Tokens
│   │   ├── layout.tsx       # Root ERP Shell Layout
│   │   └── page.tsx         # Executive Bento Grid Canvas
│   ├── components/
│   │   ├── layout/          # Sidebar, Header, RightPanel, MobileNav, Drawer
│   │   ├── money/           # QuickAddModal
│   │   └── ui/              # Button, Card, Badge, Input, dll
│   ├── lib/
│   │   ├── prisma.ts        # Prisma Client Singleton
│   │   └── utils.ts         # formatRupiah, cn, getDaysUntilPayday
│   └── types/               # TypeScript Definitions
```
