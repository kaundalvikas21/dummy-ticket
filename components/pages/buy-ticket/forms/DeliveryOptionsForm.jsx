"use client"

import { motion } from "framer-motion"
import { Mail, Phone, Shield } from "lucide-react"
import { TextInput } from "@/components/ui/input/TextInput"
import { InfoCard } from "@/components/ui/input/InfoCard"

export function DeliveryOptionsForm({ formData, updateFormData }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-4 md:space-y-6"
    >
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
          Delivery Options
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Choose how you want to receive your dummy ticket
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Delivery Method Selection */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
            Delivery Method *
          </label>
          <div className="space-y-3">
            <DeliveryMethodButton
              method="email"
              icon={Mail}
              title="Email Delivery (Instant)"
              subtitle="Receive your ticket within minutes"
              iconColor="text-[#0066FF]"
              isSelected={formData.deliveryMethod === "email"}
              onSelect={() => updateFormData("deliveryMethod", "email")}
            />
            <DeliveryMethodButton
              method="whatsapp"
              icon={Phone}
              title="WhatsApp Delivery"
              subtitle="Get your ticket via WhatsApp"
              iconColor="text-[#00D4AA]"
              isSelected={formData.deliveryMethod === "whatsapp"}
              onSelect={() => updateFormData("deliveryMethod", "whatsapp")}
            />
          </div>
        </div>

        {/* Delivery Contact Input */}
        <TextInput
          label={formData.deliveryMethod === "email" ? "Delivery Email" : "WhatsApp Number"}
          icon={formData.deliveryMethod === "email" ? Mail : Phone}
          type={formData.deliveryMethod === "email" ? "email" : "tel"}
          value={formData.deliveryEmail}
          onChange={(value) => updateFormData("deliveryEmail", value)}
          placeholder={
            formData.deliveryMethod === "email" 
              ? "your.email@example.com" 
              : "+1 234 567 8900"
          }
          required
        />

        <InfoCard
          icon={Shield}
          title="Secure Delivery:"
          description="Your dummy ticket will be delivered with a valid PNR code that can be verified on airline websites. All documents are encrypted and sent securely."
          variant="blue"
        />
      </div>
    </motion.div>
  )
}

function DeliveryMethodButton({ method, icon: Icon, title, subtitle, iconColor, isSelected, onSelect }) {
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
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <div>
          <div className="font-semibold text-sm md:text-base">{title}</div>
          <div className="text-xs md:text-sm text-gray-600">{subtitle}</div>
        </div>
      </div>
    </button>
  )
}