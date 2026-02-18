# Shiftely - AI-Powered Shift Scheduling SaaS

A modern, full-stack SaaS application for small businesses to manage employee shift scheduling with AI assistance.

## Features

- **Drag-and-Drop Scheduling**: Intuitive calendar interface for creating and managing shifts
- **AI-Powered Optimization**: AI suggestions for optimal schedule creation
- **Employee Management**: Complete CRUD operations for employees with availability tracking
- **Shift Swaps**: Request and approve shift swaps between employees
- **Compliance Tracking**: Automatic overtime detection and hours tracking
- **Payroll Export**: CSV export for payroll integration
- **Notifications**: Email notifications for schedule changes
- **Multi-Tenant Architecture**: Secure organization-based data isolation
- **Subscription Management**: Stripe integration for tier-based pricing
- **Analytics Dashboard**: Track key metrics and performance

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js v5
- **AI**: Google Gemini API
- **Email**: Resend
- **Payments**: Stripe
- **Deployment**: Vercel + Railway/Supabase

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables (see `.env.example`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your database URL and API keys.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
shiftoo/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── schedule/         # Scheduling components
│   ├── employees/        # Employee management
│   └── ...
├── lib/                   # Utilities and helpers
├── prisma/                # Database schema
└── server/                # Server-side services
    ├── auth/             # Authentication config
    └── services/         # Business logic
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `RESEND_API_KEY`: Resend API key for emails
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

**Note**: Analytics are handled by Vercel Analytics when deployed to Vercel.

## Features in Detail

### Scheduling
- Weekly schedule view with drag-and-drop
- Auto-fill shifts based on availability
- AI-powered schedule optimization
- Schedule publishing workflow

### Employee Management
- Employee profiles with roles and rates
- Availability calendar
- Skills tracking

### Compliance
- Weekly hours calculation
- Overtime detection (40+ hours)
- Overtime alerts
- Payroll CSV export

### Notifications
- Email notifications for schedule changes
- Daily schedule emails
- Shift swap notifications

## Subscription Tiers

- **Starter** ($19/month): Up to 10 employees
- **Growth** ($39/month): Up to 25 employees
- **Pro** ($69/month): Up to 50 employees

## License

ISC
