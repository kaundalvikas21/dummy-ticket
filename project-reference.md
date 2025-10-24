# Project Reference Index

## Quick Access Links

### Core Documentation
- **AI Instructions**: `CLAUDE.md` (essential commands and rules)
- **Implementation Plan**: `dummy-ticket-booking-plan.md` (detailed step-by-step)
- **Context Analysis**: `context-optimization-report.md` (optimization details)

### Database Schema Reference
**See**: `dummy-ticket-booking-plan.md` → "Database Schema (Supabase)"
- Tables: profiles, events, bookings
- RLS policies and indexes
- Sample SQL migrations

### Component Examples
**See**: `dummy-ticket-booking-plan.md` → "Component Examples"
- Button, TicketCard, Form components
- Auth hooks and payment flows
- State management patterns

### API Route Templates
**See**: `dummy-ticket-booking-plan.md` → "API Routes Structure"
- Authentication endpoints
- Payment processing
- Webhook handlers

### Environment Setup
**See**: `dummy-ticket-booking-plan.md` → "Environment Variables"
- Supabase configuration
- Stripe keys
- Development settings

## Development Workflow

### 1. Setup Phase
```bash
# Install dependencies
npm install @supabase/supabase-js @stripe/stripe-js react-hook-form zod zustand date-fns lucide-react

# Create env file
cp .env.example .env.local
```

### 2. Core Features Implementation
- Authentication flow (Supabase)
- Ticket listing and search
- Booking form and confirmation
- Stripe payment integration

### 3. Testing & Deployment
- Test all user flows
- Deploy to Vercel + Supabase
- Configure production environment

## Common Tasks

### Add New Component
1. Create in appropriate `components/` subfolder
2. Follow naming convention (kebab-case)
3. Use Tailwind CSS for styling
4. Export from index file if needed

### Create New API Route
1. Add to `app/api/` folder
2. Use Route handler pattern
3. Implement proper error handling
4. Add authentication middleware if needed

### Database Changes
1. Create Supabase migration
2. Update TypeScript types
3. Test in development environment
4. Deploy changes carefully

## Troubleshooting

### Common Issues
- **Auth problems**: Check Supabase configuration and RLS policies
- **Payment issues**: Verify Stripe keys and webhook setup
- **Build errors**: Check environment variables and dependencies
- **Styling issues**: Ensure Tailwind CSS is properly configured

### Debug Commands
```bash
# Check environment
npm run build

# Check styles
npm run lint

# Test specific components
npm run test
```

## External Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)