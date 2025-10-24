# AI Instructions - Dummy Ticket Booking

## Project Overview
Next.js 15.5.6 ticket booking system with Supabase backend + Stripe payments.

## Tech Stack
- **Frontend**: Next.js 15.5.6, React 19.1.0, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Payment**: Stripe
- **State**: Zustand
- **Forms**: React Hook Form + Zod

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
- Required env vars: Supabase URL/keys, Stripe keys
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