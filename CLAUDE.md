# AI Instructions - Dummy Ticket Booking

## Project Overview
Next.js 16.1.2 ticket booking system with Supabase backend + Stripe payments.
Role-based system with User, Vendor, and Admin dashboards.

## Tech Stack (Jan 2026)
- **Frontend**: Next.js 16.1.2, React 19.2.3, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage) - @supabase/ssr v0.7.0
- **Payment**: Stripe v20.0.0 (Node), @stripe/stripe-js v8.1.0
- **State Management**: Zustand v5.0.8
- **Forms**: React Hook Form v7.65.0 + Zod v4.1.12
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Notifications**: Twilio v5.11.2 (WhatsApp), Resend v4.1.2 (Email)
- **PDF Generation**: @react-pdf/renderer v4.1.6
- **Animations**: framer-motion v12.23.24
- **Charts**: recharts v2.15.4
- **Build**: Turbopack + React Compiler (babel-plugin-react-compiler v1.0.0)
- **Language**: JavaScript (intentional choice, not TypeScript)

## Core Commands
```bash
npm run dev     # Start dev server with Turbopack
npm run build   # Build with Turbopack
npm run start   # Start production server
npm run lint    # Run ESLint
```

## File Structure
```
app/                 # Next.js App Router
components/          # Reusable components
lib/                 # Utilities, Supabase/Stripe clients
hooks/               # Custom React hooks
store/               # Zustand store
```

## Development Rules

### Code Style
- Functional components with hooks
- Keep components small and focused
- Use Tailwind CSS for styling
- Implement error boundaries
- Add loading states for async operations

### Database
- Use Supabase client from `lib/supabase.js`
- Implement proper error handling
- Use RLS policies for security
- Validate all inputs

### Authentication
- Use Supabase Auth helpers
- Protect routes with middleware
- Handle session management properly

### Payment
- Use Stripe Elements for PCI compliance
- Never handle raw card data
- Implement webhook verification

## File Naming Conventions
- Components: kebab-case (`ticket-card.js`)
- Hooks: camelCase with use prefix (`useAuth.js`)
- Pages: kebab-case (`book-ticket.js`)
- Utils: camelCase (`formatDate.js`)

## Security Checklist
- Validate all user inputs
- Use environment variables for secrets
- Implement rate limiting
- Enable CORS properly
- Secure file uploads

## Deployment
- Environment: Vercel (frontend) + Supabase (backend)
- Required env vars: Supabase URL/keys, Stripe keys, RESEND_API_KEY, EMAIL_FROM, APP_NAME, HEXARATE_URL, CRON_SECRET

## AI Workflow Guidelines (MANDATORY)

1. **Prompt Enhancement** - Use `prompt-engineering-patterns` skill before execution
2. **Code Standards** - Use `karpathy-guidelines` skill before writing/editing code
3. **Next.js Code** - Use `next-best-practices`, `vercel-composition-patterns`, `vercel-react-best-practices` skills
4. **Code Search** - Use LSP JS (Serena MCP) for symbol-based searches
5. **Error Handling** - Use `error-handling-patterns` skill after code changes
6. **Verification** - Run type-check and lint after all code changes
7. **Supabase** - Use `supabase-postgres-best-practices` skill with Supabase MCP
8. **Documentation** - Use `ref` MCP and `exa` MCP together for latest information
9. **Browser Testing** - Use `agent-browser` skill for end-to-end testing

## Architecture Notes
- **App Router**: (dashboard), (frontend), (auth) route groups
- **Middleware**: proxy.js handles auth and role-based redirects
- **Supabase Clients**: Separate client.js, server.js, admin.js
- **Form Handling**: React Hook Form + Zod validation
- **State**: React Context + local state; Zustand for complex state
