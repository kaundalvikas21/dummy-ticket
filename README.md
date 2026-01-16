# VisaFly - Dummy Ticket Booking System

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)

Secure, verifiable flight reservations for visa applications. Trusted by travelers worldwide for reliable dummy tickets and flight itineraries.

## 🚀 Features

- **Next.js 16**: Latest stable release with React Compiler enabled
- **Flight Booking System**: One-way and round-trip reservations
- **Multi-Currency Support**: Automatic currency detection and conversion
- **Secure Payments**: Stripe integration with multiple payment methods
- **WhatsApp Notifications**: Real-time booking confirmations via Twilio
- **User Dashboard**: Track bookings, payment history, and manage profile
- **Multi-Language**: Support for multiple locales
- **Admin Panel**: Content management and user management
- **Rate Limiting**: Built-in protection against brute force attacks
- **Responsive Design**: Mobile-first UI with Tailwind CSS v4

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Payment** | Stripe |
| **Notifications** | Twilio WhatsApp |
| **State** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Icons** | Lucide React |

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account
- Twilio account (for WhatsApp notifications)

## 🚦 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd dummy-ticket
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Install Supabase CLI (if not installed)
npm install -D supabase

# Run migrations
supabase db push
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
dummy-ticket/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Protected dashboards
│   ├── (frontend)/          # Public pages
│   └── api/                 # API endpoints (~40 routes)
│       ├── auth/            # Authentication
│       ├── admin/           # Admin operations
│       └── webhooks/        # Stripe webhooks
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard components
│   ├── layout/             # Layout components
│   └── ui/                 # UI components (shadcn/ui)
├── contexts/               # React contexts
│   ├── auth-context.jsx    # Authentication state
│   ├── currency-context.jsx # Currency conversion
│   └── locale-context.jsx  # Language/locale
├── lib/                    # Utilities
│   ├── supabase/           # Supabase clients
│   ├── auth-helper.js      # Auth helpers
│   ├── rate-limit.js       # Rate limiting
│   └── whatsapp.js         # Twilio integration
├── hooks/                  # Custom React hooks
├── store/                  # Zustand stores
└── middleware.js           # Next.js middleware
```

## 🔑 Key Features Explained

### Authentication Flow
- **Server Components**: Use `@/lib/supabase/server` (cookies-based)
- **Client Components**: Use `@/lib/supabase/client` (browser-based)
- **API Routes**: Use `createSupabaseClientWithAuth()` helper
- **Automatic Token Refresh**: Handled by Supabase SSR

### Rate Limiting
Protected endpoints use built-in rate limiting:
- **Login**: 5 attempts per minute per IP
- **Register**: 3 attempts per hour per IP

See [lib/rate-limit.js](lib/rate-limit.js) for configuration.

### Payment Flow
1. User selects flight options
2. Stripe Checkout session created
3. Payment processed via Stripe
4. Webhook confirms payment
5. WhatsApp notification sent
6. Booking record created

### Currency Conversion
- Auto-detects user location via IP
- Supports 50+ currencies
- Real-time exchange rates
- Client-side caching with Next.js revalidation

## 🗄️ Database Schema

Key tables (managed via Supabase):
- `auth.users` - Supabase Auth (user accounts)
- `user_profiles` - Extended user information
- `bookings` - Flight bookings
- `payments` - Payment records
- `faqs` - FAQ content (with translations)
- `homepage_news_blog` - Blog content
- `contact_submissions` - Contact form submissions

**Row Level Security (RLS)** enabled on all tables.

## 🔐 Security Features

- ✅ Supabase RLS policies
- ✅ Rate limiting on auth endpoints
- ✅ Input validation with Zod schemas
- ✅ CSRF protection (Next.js built-in)
- ✅ Environment-based secrets
- ✅ Stripe webhook signature verification
- ✅ No SQL injection risk (parameterized queries)

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Required Environment Variables** (set in Vercel dashboard):
- All variables from `.env.local` above

### Environment-Specific URLs
```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Build for production with Turbopack |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test auth flow
npm run test:auth

# Test payment flow
npm run test:payment
```

## 📖 Documentation

- [Project Reference](project-reference.md) - Detailed technical reference
- [Architecture Analysis](ARCHITECTURE_ANALYSIS_AND_IMPLEMENTATION_PLAN.md) - System design
- [Optimization Report](context-optimization-report.md) - Performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
- Check existing GitHub Issues
- Review documentation in `/docs` folder
- Contact support team

## 🙏 Acknowledgments

- [Supabase](https://supabase.io) - Backend infrastructure
- [Stripe](https://stripe.com) - Payment processing
- [Twilio](https://twilio.com) - WhatsApp notifications
- [Vercel](https://vercel.com) - Deployment platform
- [shadcn/ui](https://ui.shadcn.com) - UI components

---

**Built with ❤️ for travelers worldwide**

