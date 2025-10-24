# Dummy Ticket Booking - Simple Implementation Plan

## Project Overview
A simple, maintainable ticket booking system using Next.js 15.5.6, Supabase for backend, and Stripe for payments.

## Current Project Setup
- **Next.js**: 15.5.6 with Turbopack
- **React**: 19.1.0
- **Tailwind CSS**: v4
- **Structure**: Using `app` directory (no src folder)

## 1. Required Additional Packages

Install these packages for the complete functionality:

```bash
# Authentication & Database
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Payment Processing
npm install @stripe/stripe-js @stripe/react-stripe-js

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# State Management (Simple)
npm install zustand

# Date Handling
npm install date-fns

# Icons
npm install lucide-react

# HTTP Requests (if needed)
npm install axios

# Environment Variables
npm install dotenv
```

## 2. Simple Folder Structure

```
dummy-ticket/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Dashboard routes group
│   │   ├── profile/
│   │   └── bookings/
│   ├── tickets/                  # Tickets listing and details
│   │   ├── [id]/
│   │   └── book/
│   ├── payment/                  # Payment processing
│   │   └── success/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── tickets/
│   │   └── webhook/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/                   # Reusable components
│   ├── ui/                      # Basic UI components
│   │   ├── button.js
│   │   ├── input.js
│   │   ├── modal.js
│   │   └── card.js
│   ├── forms/                   # Form components
│   │   ├── login-form.js
│   │   ├── booking-form.js
│   │   └── payment-form.js
│   ├── layout/                  # Layout components
│   │   ├── header.js
│   │   ├── footer.js
│   │   └── sidebar.js
│   └── features/                # Feature-specific components
│       ├── ticket-card.js
│       ├── booking-summary.js
│       └── payment-element.js
├── lib/                         # Utilities and configurations
│   ├── supabase.js             # Supabase client
│   ├── stripe.js               # Stripe configuration
│   ├── utils.js                # Helper functions
│   └── validations.js          # Form validations
├── hooks/                       # Custom React hooks
│   ├── useAuth.js
│   ├── useTickets.js
│   └── usePayment.js
├── store/                       # Simple state management
│   └── store.js                # Zustand store
├── middleware.js                # Next.js middleware for auth
└── .env.local                   # Environment variables
```

## 3. Database Schema (Supabase)

### Simple Tables Structure

```sql
-- Users Profile (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events/Tickets
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2) NOT NULL,
  total_tickets INTEGER NOT NULL,
  available_tickets INTEGER NOT NULL,
  event_date DATE NOT NULL,
  venue TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tickets_count INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Core Components Implementation

### 4.1 Authentication Flow

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, metadata) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
  }

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  return { user, loading, signUp, signIn, signOut }
}
```

### 4.2 Ticket Management

```javascript
// hooks/useTickets.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })

    if (error) {
      console.error('Error fetching tickets:', error)
    } else {
      setTickets(data)
    }
    setLoading(false)
  }

  const bookTicket = async (eventId, ticketsCount, totalPrice) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        event_id: eventId,
        tickets_count: ticketsCount,
        total_price: totalPrice,
        status: 'pending'
      }])

    return { data, error }
  }

  return { tickets, loading, fetchTickets, bookTicket }
}
```

### 4.3 Simple State Management

```javascript
// store/store.js
import { create } from 'zustand'

export const useStore = create((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),

  // Cart state
  cart: [],
  addToCart: (ticket) => set((state) => ({
    cart: [...state.cart, ticket]
  })),
  removeFromCart: (ticketId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== ticketId)
  })),
  clearCart: () => set({ cart: [] }),

  // UI state
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open })
}))
```

## 5. Stripe Payment Integration

```javascript
// lib/stripe.js
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
)

export const createPaymentIntent = async (amount, bookingId) => {
  const response = await fetch('/api/payment/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, bookingId })
  })

  return response.json()
}
```

```javascript
// app/api/payment/create-intent/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { amount, bookingId } = await request.json()

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: { bookingId }
    })

    // Update booking with payment intent ID
    await supabase
      .from('bookings')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', bookingId)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

## 6. Key Pages Structure

### 6.1 Home Page (app/page.js)
```javascript
import TicketList from '@/components/features/ticket-list'
import Header from '@/components/layout/header'

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <h1>Available Events</h1>
        <TicketList />
      </main>
    </div>
  )
}
```

### 6.2 Booking Page (app/tickets/book/page.js)
```javascript
import BookingForm from '@/components/forms/booking-form'
import { useAuth } from '@/hooks/useAuth'

export default function BookTicket() {
  const { user } = useAuth()

  if (!user) {
    return <div>Please login to book tickets</div>
  }

  return (
    <div>
      <h1>Book Your Ticket</h1>
      <BookingForm />
    </div>
  )
}
```

## 7. Environment Variables (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 8. Simple Component Examples

### Button Component
```javascript
// components/ui/button.js
export function Button({ children, onClick, variant = 'primary', disabled }) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50'
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

### Ticket Card Component
```javascript
// components/features/ticket-card.js
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export function TicketCard({ ticket, onBook }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <h3 className="text-lg font-semibold">{ticket.title}</h3>
      <p className="text-gray-600">{ticket.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold">${ticket.price}</span>
        <span>{format(new Date(ticket.event_date), 'MMM dd, yyyy')}</span>
      </div>
      <div className="flex justify-between items-center">
        <span>{ticket.available_tickets} tickets left</span>
        <Button onClick={() => onBook(ticket)}>Book Now</Button>
      </div>
    </div>
  )
}
```

## 9. Implementation Steps

### Step 1: Setup (Day 1)
1. Install required packages
2. Setup Supabase project and create tables
3. Setup Stripe account
4. Configure environment variables

### Step 2: Authentication (Day 2)
1. Create authentication pages (login, register)
2. Implement auth hooks and middleware
3. Test user signup/login flow

### Step 3: Ticket Display (Day 3)
1. Create ticket listing page
2. Design ticket card components
3. Add filtering and search functionality

### Step 4: Booking Flow (Day 4)
1. Create booking form
2. Implement booking API
3. Add booking confirmation

### Step 5: Payment Integration (Day 5)
1. Integrate Stripe for payments
2. Create payment form
3. Setup webhooks for payment confirmation

### Step 6: User Dashboard (Day 6)
1. Create user profile page
2. Show user bookings
3. Add booking management features

### Step 7: Polish & Testing (Day 7)
1. Add loading states and error handling
2. Improve responsive design
3. Test complete flow
4. Add basic animations

## 10. Best Practices

1. **Keep it Simple**: Start with essential features only
2. **Component Reusability**: Create reusable UI components
3. **Error Handling**: Add proper error boundaries and messages
4. **Loading States**: Show loading indicators during async operations
5. **Responsive Design**: Ensure mobile-friendly layout
6. **Security**: Validate inputs and use environment variables for secrets
7. **Performance**: Optimize images and use lazy loading where needed

This plan provides a simple, maintainable approach to building a ticket booking system with your existing Next.js 15.5.6 setup.