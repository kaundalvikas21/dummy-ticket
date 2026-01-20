# AI Instructions - Dummy Ticket Booking

## Project Overview
Next.js 16.1.2 ticket booking system with Supabase backend + Stripe payments.
Role-based system with User, Vendor, and Admin dashboards.

## Tech Stack (Current Versions - Jan 2026)
- **Frontend**: Next.js 16.1.2, React 19.2.3, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage) - @supabase/ssr v0.7.0
- **Payment**: Stripe v20.0.0 (Node), @stripe/stripe-js v8.1.0
- **State Management**: Zustand v5.0.8 (installed, implementation needed)
- **Forms**: React Hook Form v7.65.0 + Zod v4.1.12
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Notifications**: Twilio v5.11.2 (WhatsApp), Resend v4.1.2 (Email)
- **PDF Generation**: @react-pdf/renderer v4.1.6 (Server-side receipts)
- **Animations**: framer-motion v12.23.24
- **Charts**: recharts v2.15.4
- **Build Tool**: Turbopack (enabled)
- **React Compiler**: Enabled (babel-plugin-react-compiler v1.0.0)

### Key Configuration
- **React Compiler**: ✅ Enabled in next.config.mjs
- **Turbopack**: ✅ Enabled for dev and build
- **Language**: JavaScript (intentional choice, not TypeScript)

## Core Commands

### Development
```bash
npm run dev     # Start dev server with Turbopack
npm run build   # Build with Turbopack
npm run start   # Start production server
npm run lint    # Run ESLint
```

### File Structure (No src folder)
```
app/                 # Next.js App Router
components/          # Reusable components
lib/                # Utilities, Supabase/Stripe clients
hooks/              # Custom React hooks
store/              # Zustand store
```

## Development Rules

### Code Style
- Use functional components with hooks
- Keep components small and focused
- Use Tailwind CSS for styling
- Implement proper error boundaries
- Add loading states for async operations

### Database Operations
- Use Supabase client from `lib/supabase.js`
- Implement proper error handling
- Use RLS policies for security
- Validate all inputs on client and server

### Authentication
- Use Supabase Auth helpers
- Protect routes with middleware
- Handle session management properly
- Implement proper logout flow

### Payment Processing
- Use Stripe Elements for PCI compliance
- Never handle raw card data
- Implement webhook verification
- Handle payment states properly

## File Naming Conventions
- Components: kebab-case (ticket-card.js)
- Hooks: camelCase with use prefix (useAuth.js)
- Pages: kebab-case (book-ticket.js)
- Utils: camelCase (formatDate.js)

## API Routes Structure
- `/api/auth/*` - Authentication endpoints
- `/api/tickets/*` - Ticket CRUD operations
- `/api/payment/*` - Stripe payment processing
- `/api/webhook/*` - External webhook handlers

## Testing Requirements
- Test all user flows
- Mock external services (Stripe, Supabase)
- Test error states and edge cases
- Verify responsive design

## Security Checklist
- Validate all user inputs
- Use environment variables for secrets
- Implement rate limiting
- Enable CORS properly
- Secure file uploads

## Deployment
- Environment: Vercel (frontend) + Supabase (backend)
- Required env vars: Supabase URL/keys, Stripe keys, RESEND_API_KEY, EMAIL_FROM, APP_NAME
- Build with Turbopack enabled
- Enable production optimizations

## Quick Start Implementation
1. Setup Supabase project and tables
2. Configure Stripe and webhooks
3. Install dependencies: `@supabase/supabase-js @stripe/stripe-js react-hook-form zod zustand`
4. Create auth flow (login/register)
5. Build ticket listing and booking
6. Integrate Stripe payments
7. Add user dashboard

## Reference Files
- Detailed implementation: `dummy-ticket-booking-plan.md`
- Context analysis: `context-optimization-report.md`

## Production Readiness Status (Updated Jan 2026)

### ✅ Implemented Features
- WhatsApp notifications via Twilio (Sandbox configuration)
- Email notifications with PDF receipt attachments via Resend
- Server-side PDF generation using @react-pdf/renderer
- Role-based authentication (User, Vendor, Admin)
- Stripe payment integration with webhook verification
- Supabase RLS policies for data security
- Multi-step booking form with session persistence

### ⚠️ Critical Issues Before Production
1. **Security Headers Missing** - No CSP, X-Frame-Options, HSTS in next.config.mjs
2. **Rate Limiting** - In-memory implementation won't scale (needs Vercel KV/Redis)
3. **Error Boundaries** - No React error boundaries implemented
4. **React 19 Features** - Not using useOptimistic, useActionState, useFormStatus

### 🔄 Recommended Upgrades (Priority Order)

#### 🔴 CRITICAL (Do Before Production)
1. **Add Security Headers** to next.config.mjs
2. **Migrate Rate Limiting** to Vercel KV or Upstash Redis
3. **Implement Error Boundaries** (app/error.jsx, component-level)
4. **Remove Console.logs** from production code

#### 🟡 HIGH PRIORITY (Performance & UX)
5. **Adopt React 19 Patterns** - useOptimistic for bookings, useActionState for forms
6. **Server Component Migration** - Convert static pages to Server Components
7. **Add Idempotency** to Stripe webhook handler
8. **Implement Proper Logging** (replace console.log with structured logging)

#### 🟢 MEDIUM PRIORITY (Best Practices)
9. **Image Optimization** - Configure next/image with WebP/AVIF
10. **Code Splitting** - Dynamic imports for heavy components (recharts, framer-motion)
11. **Add Monitoring** - Vercel Analytics, Sentry for errors
12. **Testing Setup** - Jest + Playwright for critical flows

### Known Technical Debt
- Large components (800+ lines) need splitting
- Zustand installed but not utilized for global state
- Some pages are client components when Server Components would be better
- No API response caching strategy

## Architecture Notes
- **App Router Structure**: (dashboard), (frontend), (auth) route groups
- **Middleware**: proxy.js handles auth and role-based redirects
- **Supabase Clients**: Separate client.js, server.js, and admin.js
- **Form Handling**: React Hook Form with Zod validation
- **State**: Currently using React Context + local state; consider Zustand for complex state