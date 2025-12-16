"use client"

import { motion } from "framer-motion"
import { CreditCard, Lock } from "lucide-react"
import { TextInput } from "@/components/ui/input/TextInput"
import { SelectInput } from "@/components/ui/input/SelectInput"
import { InfoCard } from "@/components/ui/input/InfoCard"
import { useTranslation } from "@/lib/translations"


import { countries } from "@/lib/countries"

export function BillingPaymentForm({ formData, updateFormData }) {
  const { t } = useTranslation()

  const countryOptions = countries.map(country => ({
    value: country.code,
    label: country.name
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 md:space-y-6"
    >
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
          {t('buyTicket.billingPayment.title')}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {t('buyTicket.billingPayment.description')}
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Billing Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('buyTicket.billingPayment.billingAddress')}</h3>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="md:col-span-2">
              <TextInput
                label={t('buyTicket.billingPayment.fields.fullName')}
                value={formData.billingName}
                onChange={(value) => updateFormData("billingName", value)}
                placeholder={t('buyTicket.billingPayment.placeholders.fullName')}
                required
              />
            </div>

            <div className="md:col-span-2">
              <TextInput
                label={t('buyTicket.billingPayment.fields.address')}
                value={formData.billingAddress}
                onChange={(value) => updateFormData("billingAddress", value)}
                placeholder={t('buyTicket.billingPayment.placeholders.address')}
                required
              />
            </div>

            <TextInput
              label={t('buyTicket.billingPayment.fields.city')}
              value={formData.billingCity}
              onChange={(value) => updateFormData("billingCity", value)}
              placeholder={t('buyTicket.billingPayment.placeholders.city')}
              required
            />

            <TextInput
              label={t('buyTicket.billingPayment.fields.zipCode')}
              value={formData.billingZip}
              onChange={(value) => updateFormData("billingZip", value)}
              placeholder={t('buyTicket.billingPayment.placeholders.zipCode')}
              required
            />

            <div className="md:col-span-2">
              <SelectInput
                label={t('buyTicket.billingPayment.fields.country')}
                value={formData.billingCountry}
                onChange={(value) => updateFormData("billingCountry", value)}
                options={countryOptions}
                placeholder={t('buyTicket.billingPayment.placeholders.selectCountry')}
                required
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('buyTicket.billingPayment.fields.paymentMethod')}</h3>
          <div className="space-y-3">
            <PaymentMethodButton
              method="card"
              icon={CreditCard}
              title={t('buyTicket.billingPayment.fields.creditDebitCard')}
              subtitle={t('buyTicket.billingPayment.fields.cardTypes')}
              iconColor="text-[#0066FF]"
              isSelected={true} // Always selected as it's the only option
              onSelect={() => { }} // No-op since it's the only option
            />
          </div>
        </div>

        <InfoCard
          icon={Lock}
          title={t('buyTicket.billingPayment.securityNote')}
          description={t('buyTicket.billingPayment.securityNote')}
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
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isSelected
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