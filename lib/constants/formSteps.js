// This file defines the steps for a multi-step form, typically used in a "buy-ticket" page.
// Each step includes an ID, a translation key, and an icon for visual representation.
// The translation keys correspond to entries in the buy-ticket.json translation files.

import { Ticket, User, Plane, Mail, CreditCard } from "lucide-react"

export const steps = [
  { id: 1, translationKey: "formSteps.selectPlan", icon: Ticket },
  { id: 2, translationKey: "formSteps.passengerDetails", icon: User },
  { id: 3, translationKey: "formSteps.travelDetails", icon: Plane },
  { id: 4, translationKey: "formSteps.deliveryOptions", icon: Mail },
  { id: 5, translationKey: "formSteps.billingPayment", icon: CreditCard },
]