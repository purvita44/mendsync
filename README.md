# MendSync — Intelligent Patient Care & Appointment Synchronization

![MendSync Banner](https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop)

MendSync is an enterprise-grade Healthcare Patient Retention and Automated Appointment Synchronization platform. Engineered to eliminate missed clinical appointments, enforce HIPAA-compliant patient communication consent, and provide reliable Google Calendar OAuth integration.

---

## 🚀 Key Product Features

1. **Clean Product Identity & Branding**:
   - Original MendSync branding with custom pulse-sync SVG logo and healthcare design system.
   - Clean UI hierarchy optimized for clinical specialists, practice administrators, and patient coordinators.

2. **Google Calendar Bi-Directional Integration**:
   - OAuth integration simulation pushing updated patient follow-up slots directly into doctor Google Workspace calendars.
   - Real-time sync status badges, sync interval controls, and destination calendar selection.

3. **Functional Patient Reminders & Notification Drawer**:
   - Interactive notification slide-over drawer with unread counter.
   - Dispatch SMS & Email patient portal update links with automated 24h cooling windows.

4. **Authentication & Session Persistence**:
   - Client and server session management supporting email/password login and 1-click Demo presets (`Dr. Alex Rivera, MD`).

5. **HIPAA & Audit Trail Compliance**:
   - Append-only event history logging all care diagnoses, policy authorizations, calendar sync attempts, and patient reminder dispatches.

6. **Responsive Mobile & Desktop Experience**:
   - Full support for mobile side drawers, responsive grid collapse, and compact mobile top bar.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript 5.9, Tailwind CSS v4, Framer Motion, Lucide Icons, Shadcn UI
- **Backend / API**: Node.js, Express, tRPC v11, Zod schema validation
- **Database / Storage**: Drizzle ORM, MySQL / SQLite compatibility, local storage session persistence
- **Build System**: Vite 7 (Clean build configuration, zero external runtime lock-ins)

---

## 🌐 Deploying Under Your Own Domain (e.g., `mendsync.in`)

To present MendSync on your resume, portfolio, or during placement interviews, it is recommended to deploy under your own GitHub repository and custom domain rather than temporary generated domains.

Follow this standard pipeline: **MendSync → GitHub → Vercel → Custom Domain**

### Step 1: Push Code to Your Personal GitHub
```bash
# Initialize git (if not already initialized)
git init

# Add all project files
git add .

# Commit your changes
git commit -m "feat: MendSync production ready release"

# Link your personal GitHub repository
git remote add origin https://github.com/your-username/mendsync.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Log in to [Vercel](https://vercel.com) with your GitHub account.
2. Click **"Add New"** → **"Project"**.
3. Import your `mendsync` repository.
4. Configure Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
5. Click **"Deploy"**.

### Step 3: Link Custom Domain (e.g. `mendsync.in`)
1. Go to your project settings in Vercel → **Domains**.
2. Type `mendsync.in` (or your chosen custom domain) and click **Add**.
3. Set your DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
4. Once verified, your application will be live under your own domain!

---

## 💻 Local Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Run type checking
pnpm check

# 3. Run automated tests
pnpm test

# 4. Start local development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view MendSync in your browser.

---

## 📜 License

MIT License © MendSync Inc.
