"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getExchangeRates, formatConvertedPrices } from '@/lib/exchange-rate'
import { Check, Shield, Loader2, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

import { HeroSection } from "@/components/pages/buy-ticket/HeroSection"
import { ProgressSteps } from "@/components/pages/buy-ticket/ProgressSteps"
import { NavigationButtons } from "@/components/pages/buy-ticket/NavigationButtons"
import { OrderSummary } from "@/components/pages/buy-ticket/OrderSummary"
import { ServicePlanSelection } from "@/components/pages/buy-ticket/forms/ServicePlanSelection"
import { PassengerDetailsForm } from "@/components/pages/buy-ticket/forms/PassengerDetailsForm"
import { TravelDetailsForm } from "@/components/pages/buy-ticket/forms/TravelDetailsForm"
import { DeliveryOptionsForm } from "@/components/pages/buy-ticket/forms/DeliveryOptionsForm"
import { BillingPaymentForm } from "@/components/pages/buy-ticket/forms/BillingPaymentForm"

import { steps } from "@/lib/constants/formSteps"
import { useFormValidation } from "@/lib/hooks/useFormValidation"
import { Button } from "@/components/ui/button"

const initialFormData = {
  selectedPlan: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  passportNumber: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  departureCity: "",
  arrivalCity: "",
  departureDate: "",
  returnDate: "",
  travelClass: "economy",
  tripType: "round-trip",
  deliveryMethod: "email",
  deliveryEmail: "",
  whatsappNumber: "",
  billingName: "",
  billingAddress: "",
  billingCity: "",
  billingZip: "",
  billingCountry: "",
  paymentMethod: "card",
}

export default function BuyTicketPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Support both planId and service (legacy)
  const planIdParam = searchParams.get("planId") || searchParams.get("service")

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormData)
  const [availablePlans, setAvailablePlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [exchangeRates, setExchangeRates] = useState(null)

  // New state for pagination
  const [otherServicesPage, setOtherServicesPage] = useState(1)
  const OTHER_SERVICES_PER_PAGE = 6

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const { isStepValid } = useFormValidation(currentStep, formData)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      try {
        const [plansResponse, rates, { data: { user } }] = await Promise.all([
          supabase
            .from("service_plans")
            .select("*")
            .eq("active", true)
            .order("display_order", { ascending: true }),
          getExchangeRates('USD'),
          supabase.auth.getUser()
        ])

        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('auth_user_id', user.id)
            .single()

          if (profile) {
            setFormData(prev => ({
              ...prev,
              firstName: profile.first_name || prev.firstName,
              lastName: profile.last_name || prev.lastName,
              email: profile.email || prev.email,
              phone: profile.phone_number || prev.phone,
              passportNumber: profile.passport_number || prev.passportNumber,
              dateOfBirth: profile.date_of_birth || prev.dateOfBirth,
              nationality: profile.nationality || prev.nationality,
              // Map address fields to Billing if available
              billingName: `${profile.first_name} ${profile.last_name}`.trim() || prev.billingName,
              billingAddress: profile.address || prev.billingAddress,
              billingCity: profile.city || prev.billingCity,
              billingZip: profile.postal_code || prev.billingZip,
              billingCountry: profile.nationality || prev.billingCountry // Assuming nationality matches country for billing default
            }))
          }
        }

        if (rates) setExchangeRates(rates)

        if (plansResponse.data) {
          // Process plans to add 'currencies' string compatibility
          const processedPlans = plansResponse.data.map(plan => ({
            ...plan,
            currencies: rates
              ? `${plan.price} USD | ${formatConvertedPrices(plan.price, rates)}`
              : `${plan.price} USD`
          }))
          setAvailablePlans(processedPlans)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!loading && planIdParam && availablePlans.length > 0) {
      const planExists = availablePlans.find((plan) => plan.id === planIdParam)
      if (planExists) {
        setFormData((prev) => ({ ...prev, selectedPlan: planIdParam }))
        // If plan is pre-selected, start at Step 2 (Passenger Details)
        setCurrentStep(2)
      }
    }
  }, [loading, planIdParam, availablePlans])

  const nextStep = () => {
    if (currentStep < steps.length && isStepValid()) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // ... existing code ...

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePayment = async () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setLoading(true) // Re-use loading state or create a specific processing state
    try {
      const selectedPlanData = availablePlans.find(p => p.id === formData.selectedPlan)

      // Sanitize data before sending
      const sanitizedFormData = {
        ...formData,
        returnDate: formData.tripType === "one-way" ? "" : formData.returnDate
      }

      const response = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: formData.selectedPlan,
          formData: sanitizedFormData, // Pass the sanitized form data
          amount: selectedPlanData?.price,
          currency: "USD",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment initiation failed")
      }

      // Redirect to Stripe Checkout using the returned URL
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Payment Error:", error)
      alert("Payment failed: " + error.message)
      setLoading(false)
    }
  }

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServicePlanSelection
            formData={formData}
            updateFormData={updateFormData}
            servicePlans={availablePlans}
          />
        )
      case 2:
        return <PassengerDetailsForm formData={formData} updateFormData={updateFormData} />
      case 3:
        return <TravelDetailsForm formData={formData} updateFormData={updateFormData} />
      case 4:
        return <DeliveryOptionsForm formData={formData} updateFormData={updateFormData} />
      case 5:
        return <BillingPaymentForm formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  // Derived state for UI
  const selectedPlanData = availablePlans.find(p => p.id === formData.selectedPlan)
  const isPreSelected = !!planIdParam && !!selectedPlanData

  const otherPlans = availablePlans.filter(p => p.id !== formData.selectedPlan)
  const totalOtherPages = Math.ceil(otherPlans.length / OTHER_SERVICES_PER_PAGE)
  const paginatedOtherPlans = otherPlans.slice(
    (otherServicesPage - 1) * OTHER_SERVICES_PER_PAGE,
    otherServicesPage * OTHER_SERVICES_PER_PAGE
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-[#0066FF] animate-spin" />
      </div>
    )
  }

  return (
    <>
      <HeroSection />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">

          {/* Selected Plan Banner - Only show if plan was pre-selected via URL and we are NOT on step 1 (user might have gone back) */}
          {/* Actually, if user goes back to step 1, they see the list. If they are on step 2+, show this banner? */}
          {/* User request: "But not again ask to select plan ... User selected plan only first appear" */}
          {/* We will show this banner if plan is selected. The Step 1 form (ServicePlanSelection) handles the "selection" part. */}
          {/* If I am on Step 2+, I want to see what I bought. That's mainly OrderSummary job. */}
          {/* BUT user specifically asked for "User selected plan only first appear". This likely means BEFORE the form/wizard starts or AT THE TOP. */}

          {/* Selected Plan Banner - Only show if pre-selected AND we are past the selection step */}
          {isPreSelected && currentStep > 1 && (
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-6xl mx-auto mb-8 bg-white rounded-3xl p-6 md:p-8 border shadow-xl relative overflow-hidden ${selectedPlanData.popular_label
                  ? "border-blue-200 shadow-blue-500/10"
                  : "border-gray-100 shadow-gray-200/50"
                  }`}
              >
                {selectedPlanData.popular_label && (
                  <div className="absolute top-0 left-0 z-20">
                    <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white px-4 py-1.5 rounded-br-2xl text-xs font-bold uppercase shadow-sm">
                      {selectedPlanData.popular_label}
                    </span>
                  </div>
                )}

                <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                  <Shield className="w-64 h-64 text-[#0066FF]" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center pt-4 md:pt-0">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                      <Check className="w-3 h-3" /> Selected Plan
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{selectedPlanData.name}</h2>
                    <p className="text-gray-600 max-w-2xl text-base mb-6 leading-relaxed">{selectedPlanData.description}</p>

                    <div className="flex flex-wrap gap-x-8 gap-y-3">
                      {selectedPlanData.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0 bg-gray-50/80 backdrop-blur-sm px-8 py-6 rounded-2xl border border-gray-100 min-w-[200px] text-center self-stretch flex flex-col justify-center">
                    <div className="flex items-baseline justify-center gap-1 text-[#0066FF]">
                      <span className="text-lg font-semibold">$</span>
                      <span className="text-5xl font-bold tracking-tight">{selectedPlanData.price}</span>
                      <span className="text-sm text-gray-400 font-medium">/ person</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Scroll Indicator */}
              {otherPlans.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 text-sm font-medium"
                >
                  <span>More Services Below</span>
                  <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center bg-white shadow-sm">
                    <ChevronLeft className="w-4 h-4 -rotate-90 text-gray-400" />
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <div className={(isPreSelected && currentStep > 1) ? "mt-24" : ""}>
            <ProgressSteps steps={steps} currentStep={currentStep} />
          </div>

          {/* Form Content */}
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm border border-gray-200"
              >
                <AnimatePresence mode="wait">
                  {currentStep === 1 ? (
                    <ServicePlanSelection
                      formData={formData}
                      updateFormData={updateFormData}
                      servicePlans={formData.selectedPlan ? (selectedPlanData ? [selectedPlanData] : availablePlans) : availablePlans}
                    />
                  ) : (
                    renderFormStep()
                  )}
                </AnimatePresence>

                <NavigationButtons
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  isStepValid={isStepValid()}
                  onNext={nextStep}
                  onPrevious={prevStep}
                  onComplete={handlePayment}
                  loading={loading}
                />
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <OrderSummary formData={formData} servicePlans={availablePlans} />
            </div>
          </div>

          {/* Other Services Section - Only if plan is selected */}
          {formData.selectedPlan && otherPlans.length > 0 && (
            <div className="max-w-6xl mx-auto mt-20 md:mt-28">
              <div className="text-center mb-12 md:mb-16">
                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">Other Services You Might Like</h3>
                <p className="text-gray-500 text-lg">Explore our range of travel documentation services</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {paginatedOtherPlans.map(plan => (
                  <div key={plan.id} className={`bg-white rounded-3xl p-6 md:p-8 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden ${plan.popular_label
                    ? "border-blue-200"
                    : "border-gray-100 hover:border-blue-100"
                    }`}>
                    {plan.popular_label && (
                      <div className="absolute top-0 right-0 z-10">
                        <span className="bg-gradient-to-l from-[#0066FF] to-[#00D4AA] text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase shadow-sm">
                          {plan.popular_label}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-xl text-gray-900 group-hover:text-[#0066FF] transition-colors line-clamp-2 pr-8">{plan.name}</h4>
                      <span className="font-bold text-xl text-[#0066FF] flex-shrink-0 ml-4">${plan.price}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-6 leading-relaxed line-clamp-3">{plan.description}</p>

                    <div className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-200 mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600 leading-snug">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto space-y-4">
                      {plan.currencies && (
                        <div className="text-[10px] text-blue-400 text-center font-medium uppercase tracking-wide border-t border-gray-100 pt-3">
                          {plan.currencies}
                        </div>
                      )}

                      <Button
                        onClick={() => router.push(`/buy-ticket?planId=${plan.id}`)}
                        variant="outline"
                        className={`w-full h-12 rounded-xl font-semibold transition-all ${plan.popular_label
                          ? "border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white"
                          : "border-gray-200 text-gray-900 hover:text-[#0066FF] hover:border-[#0066FF] hover:bg-blue-50"
                          }`}
                      >
                        Select Plan
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalOtherPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOtherServicesPage(p => Math.max(1, p - 1))}
                    disabled={otherServicesPage === 1}
                    className="rounded-full w-10 h-10 border-gray-200 hover:border-[#0066FF] hover:text-[#0066FF]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="text-sm font-medium text-gray-600">Page {otherServicesPage} of {totalOtherPages}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOtherServicesPage(p => Math.min(totalOtherPages, p + 1))}
                    disabled={otherServicesPage === totalOtherPages}
                    className="rounded-full w-10 h-10 border-gray-200 hover:border-[#0066FF] hover:text-[#0066FF]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}