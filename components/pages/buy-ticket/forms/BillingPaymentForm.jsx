"use client"

import { motion } from "framer-motion"
import { CreditCard, Lock } from "lucide-react"
import { TextInput } from "@/components/ui/input/TextInput"
import { SelectInput } from "@/components/ui/input/SelectInput"
import { InfoCard } from "@/components/ui/input/InfoCard"


const countryOptions = [
{ value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "SG", label: "Singapore" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "NZ", label: "New Zealand" },
  { value: "KR", label: "South Korea" },
  { value: "BR", label: "Brazil" },
  { value: "ZA", label: "South Africa" },
  { value: "MX", label: "Mexico" },
  { value: "TH", label: "Thailand" },
]

export function BillingPaymentForm({ formData, updateFormData }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-4 md:space-y-6"
    >
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
          Billing & Payment
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Enter your billing information and payment details
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Billing Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="md:col-span-2">
              <TextInput
                label="Full Name"
                value={formData.billingName}
                onChange={(value) => updateFormData("billingName", value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="md:col-span-2">
              <TextInput
                label="Address"
                value={formData.billingAddress}
                onChange={(value) => updateFormData("billingAddress", value)}
                placeholder="123 Main Street"
                required
              />
            </div>

            <TextInput
              label="City"
              value={formData.billingCity}
              onChange={(value) => updateFormData("billingCity", value)}
              placeholder="New York"
              required
            />

            <TextInput
              label="ZIP Code"
              value={formData.billingZip}
              onChange={(value) => updateFormData("billingZip", value)}
              placeholder="10001"
              required
            />

            <div className="md:col-span-2">
              <SelectInput
                label="Country"
                value={formData.billingCountry}
                onChange={(value) => updateFormData("billingCountry", value)}
                options={countryOptions}
                placeholder="Select country"
                required
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="space-y-3">
            <PaymentMethodButton
              method="card"
              icon={CreditCard}
              title="Credit / Debit Card"
              subtitle="Visa, Mastercard, Amex"
              iconColor="text-[#0066FF]"
              isSelected={formData.paymentMethod === "card"}
              onSelect={() => updateFormData("paymentMethod", "card")}
            />
            <PaymentMethodButton
              method="paypal"
              customIcon={
                <div className="w-5 h-5 bg-[#0066FF] rounded flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
              }
              title="PayPal"
              subtitle="Fast & secure payment"
              isSelected={formData.paymentMethod === "paypal"}
              onSelect={() => updateFormData("paymentMethod", "paypal")}
            />
          </div>
        </div>

        <InfoCard
          icon={Lock}
          title="Secure Payment:"
          description="Your payment information is encrypted and processed securely. We never store your card details."
          variant="green"
        />
      </div>
    </motion.div>
  )
}

function PaymentMethodButton({ method, icon: Icon, customIcon, title, subtitle, iconColor, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? "border-[#0066FF] bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3">
        {customIcon ? customIcon : <Icon className={`w-5 h-5 ${iconColor}`} />}
        <div>
          <div className="font-semibold text-sm md:text-base">{title}</div>
          <div className="text-xs md:text-sm text-gray-600">{subtitle}</div>
        </div>
      </div>
    </button>
  )
}