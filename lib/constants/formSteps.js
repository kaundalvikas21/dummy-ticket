// This file defines the steps for a multi-step form, typically used in a "buy-ticket" page.
// Each step includes an ID, a display name, and an icon for visual representation.

import { Ticket, User, Plane, Mail, CreditCard } from "lucide-react"

export const steps = [
  { id: 1, name: "Select Plan", icon: Ticket },
  { id: 2, name: "Passenger Details", icon: User },
  { id: 3, name: "Travel Details", icon: Plane },
  { id: 4, name: "Delivery Options", icon: Mail },
  { id: 5, name: "Billing & Payment", icon: CreditCard },
]