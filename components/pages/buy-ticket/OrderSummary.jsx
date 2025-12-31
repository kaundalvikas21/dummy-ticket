"use client"

import { motion } from "framer-motion"
import { loadStripe } from "@stripe/stripe-js"
import { Check, Shield } from "lucide-react"
import { useTranslation } from "@/lib/translations"
import { useCurrency } from "@/contexts/currency-context"
import { Price } from "@/components/ui/price"

export function OrderSummary({ formData, servicePlans }) {
  const { t } = useTranslation()

  const selectedPlan = servicePlans.find((plan) => plan.id === formData.selectedPlan)
  const basePrice = selectedPlan?.price || 0
  const deliveryFee = 0 // User request: remove charge for WhatsApp delivery
  const total = basePrice + deliveryFee

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          formData, // Pass the full form data to be stored in bookings
          amount: selectedPlan.price, // Or calculate total locally if needed
          currency: "USD", // Or dynamic if supported
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment initiation failed")
      }

      // Redirect to Stripe Checkout using the returned session ID
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Payment Error:", error)
      alert("Payment failed: " + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const benefits = t('buyTicket.orderSummary.features')

  return (
    <div className="sticky top-24 self-start">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-200 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-5">
          <img
            src="/airline-ticket-boarding-pass-template.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
            {t('buyTicket.orderSummary.title')}
          </h3>

          {/* Selected Plan Details */}
          <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
            {selectedPlan ? (
              <>
                <div className="pb-3 md:pb-4 border-b border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {selectedPlan.name}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-500">
                    {selectedPlan.currencies}
                  </div>
                </div>

                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Service Plan</span>
                  <span className="font-semibold"><Price amount={selectedPlan.price} /></span>
                </div>
              </>
            ) : (
              <div className="text-xs md:text-sm text-gray-500 italic">
                {t('buyTicket.orderSummary.noPlanSelected')}
              </div>
            )}

            {deliveryFee > 0 && (
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-600">{t('buyTicket.orderSummary.whatsappDelivery')}</span>
                <span className="font-semibold"><Price amount={deliveryFee} /></span>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-gray-200 pt-3 md:pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-sm md:text-base">{t('buyTicket.orderSummary.total')}</span>
                <span className="font-bold text-xl md:text-2xl text-[#0066FF]"><Price amount={total} /></span>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 text-xs md:text-sm text-gray-600">
                <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Money-Back Guarantee */}
          <div className="bg-blue-50 rounded-xl p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-[#0066FF]" />
              <span className="font-semibold text-gray-900 text-sm md:text-base">
                {t('buyTicket.orderSummary.guarantee.title')}
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              {t('buyTicket.orderSummary.guarantee.description')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}