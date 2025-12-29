"use client"

import { motion } from "framer-motion"
import { Mail, Phone, Shield } from "lucide-react"
import { TextInput } from "@/components/ui/input/TextInput"
import { InfoCard } from "@/components/ui/input/InfoCard"
import { useTranslation } from "@/lib/translations"

export function DeliveryOptionsForm({ formData, updateFormData }) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 md:space-y-6"
    >
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
          {t('buyTicket.deliveryOptions.title')}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {t('buyTicket.deliveryOptions.description')}
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Delivery Method Selection */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
            {t('buyTicket.deliveryOptions.fields.deliveryMethod')} *
          </label>
          <div className="space-y-3">
            <DeliveryMethodButton
              method="email"
              icon={Mail}
              title={t('buyTicket.deliveryOptions.fields.emailDelivery')}
              subtitle={t('buyTicket.deliveryOptions.fields.emailDeliveryDesc')}
              iconColor="text-[#0066FF]"
              isSelected={formData.deliveryMethod === "email"}
              onSelect={() => updateFormData("deliveryMethod", "email")}
            />
            <DeliveryMethodButton
              method="whatsapp"
              icon={Phone}
              title={t('buyTicket.deliveryOptions.fields.whatsappDelivery')}
              subtitle="Instant Delivery"
              iconColor="text-[#00D4AA]"
              isSelected={formData.deliveryMethod === "whatsapp"}
              onSelect={() => updateFormData("deliveryMethod", "whatsapp")}
            />
          </div>
        </div>

        {/* Delivery Contact Input */}
        <TextInput
          label={formData.deliveryMethod === "email" ? t('buyTicket.deliveryOptions.fields.deliveryEmail') : t('buyTicket.deliveryOptions.fields.whatsappNumber')}
          icon={formData.deliveryMethod === "email" ? Mail : Phone}
          type={formData.deliveryMethod === "email" ? "email" : "tel"}
          value={formData.deliveryMethod === "email" ? formData.deliveryEmail : formData.whatsappNumber}
          onChange={(value) => {
            // Only allow numbers
            const numericValue = value.replace(/[^0-9]/g, '');
            updateFormData(formData.deliveryMethod === "email" ? "deliveryEmail" : "whatsappNumber", formData.deliveryMethod === "email" ? value : numericValue);
          }}
          placeholder={
            formData.deliveryMethod === "email"
              ? t('buyTicket.deliveryOptions.placeholders.deliveryEmail')
              : "Enter WhatsApp Number"
          }
          required
        />

        <InfoCard
          icon={Shield}
          title={t('buyTicket.deliveryOptions.securityNote')}
          description={t('buyTicket.deliveryOptions.securityNote')}
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
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isSelected
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