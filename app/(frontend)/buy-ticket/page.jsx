"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useSearchParams } from "next/navigation"

import { HeroSection } from "@/components/pages/buy-ticket/HeroSection"
import { ProgressSteps } from "@/components/pages/buy-ticket/ProgressSteps"
import { NavigationButtons } from "@/components/pages/buy-ticket/NavigationButtons"
import { OrderSummary } from "@/components/pages/buy-ticket/OrderSummary"
import { ServicePlanSelection } from "@/components/pages//buy-ticket/forms/ServicePlanSelection"
import { PassengerDetailsForm } from "@/components/pages/buy-ticket/forms/PassengerDetailsForm"
import { TravelDetailsForm } from "@/components/pages/buy-ticket/forms/TravelDetailsForm"
import { DeliveryOptionsForm } from "@/components/pages/buy-ticket/forms/DeliveryOptionsForm"
import { BillingPaymentForm } from "@/components/pages/buy-ticket/forms/BillingPaymentForm"

import { steps } from "@/lib/constants/formSteps"
import { servicePlans } from "@/lib/constants/servicePlans"
import { useFormValidation } from "@/lib/hooks/useFormValidation"

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
  billingName: "",
  billingAddress: "",
  billingCity: "",
  billingZip: "",
  billingCountry: "",
  paymentMethod: "card",
}

export default function BuyTicketPage() {
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get("service")

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormData)

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const { isStepValid } = useFormValidation(currentStep, formData)

  useEffect(() => {
    if (serviceParam && servicePlans.find((plan) => plan.id === serviceParam)) {
      setFormData((prev) => ({ ...prev, selectedPlan: serviceParam }))
    }
  }, [serviceParam])

  const nextStep = () => {
    if (currentStep < steps.length && isStepValid()) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServicePlanSelection
            formData={formData}
            updateFormData={updateFormData}
            servicePlans={servicePlans}
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

  return (
    <>
      <HeroSection />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <ProgressSteps steps={steps} currentStep={currentStep} />

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
                  {renderFormStep()}
                </AnimatePresence>

                <NavigationButtons
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  isStepValid={isStepValid()}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <OrderSummary formData={formData} servicePlans={servicePlans} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}