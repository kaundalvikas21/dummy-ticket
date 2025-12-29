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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PaymentMethodButton
              method="card"
              icon={CreditCard}
              title={t('buyTicket.billingPayment.fields.creditDebitCard')}
              subtitle={t('buyTicket.billingPayment.fields.cardTypes')}
              iconColor="text-[#0066FF]"
              isSelected={formData.paymentMethod === "card"}
              onSelect={() => updateFormData("paymentMethod", "card")}
            />
            <PaymentMethodButton
              method="apple_pay"
              customIcon={
                <svg viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5 text-black">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 46.9 96.3 78.8 95.3 31.9-1.7 44-24.2 86.1-24.2 40.5 0 54.4 23.4 89.2 24.2 36.2.8 63.9-63.1 79.4-95.6 2.4-7.1 23-42.3 22.1-45.9-46.6-8.2-85.3-64.3-55.3-139.8zM260 74.1c25.9-32.1 47.1-32.9 50.3-33-12.3 49.3-54.3 84.4-92 84.4-31.9 0-53-37-43.1-66.2 3.6-1.7 11.7-7.6 84.8 14.8z" />
                </svg>
              }
              title="Apple Pay"
              subtitle="Pay with Apple Pay"
              isSelected={formData.paymentMethod === "apple_pay"}
              onSelect={() => updateFormData("paymentMethod", "apple_pay")}
            />
            <PaymentMethodButton
              method="amazon_pay"
              customIcon={
                <svg viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5 text-[#FF9900]">
                  <path d="M257.2 162.7c-48.7 1.8-166.3 1.5-166.3 1.5l-16-.2v127l16.8.2c47.1 0 134.7-.5 134.7-.5l17.2-.2-27.1 36.6-8.6 11.6-2.5 3.4c-3.1 4.2-6.1 8.3-9.2 12.5-4.4 6-8.8 11.9-13.2 17.9-2.7 3.7-5.4 7.4-8.1 11.1l-10 13.6-20.7 28.1c-12.7 17.2-12.6 17.1-12.6 17.1s-16.6 22.4 12.8 22.4h111.9l-34.9-35.1c-5.2-5.2-10.4-10.4-15.6-15.6l-50.6-50.7 78.5-106-2.2-2.9c-10.5-13.7-52.9-68.9-52.9-68.9zm-46.3 34.6c2.7 3.5 125.7 163.6 125.7 163.6s16.6 21.6 16.6 21.6c17.2 22.4 16.6 22.4 16.6 22.4s16.6 22.4-12.8 22.4h-68.1c-6.2 0-11.8-3-15.4-8.1l-10-14.1-39.7-55.8-9.4-13.1c-3.1-4.3-6.1-8.6-9.2-12.9-2.8-3.9-5.5-7.8-8.2-11.7l-9.9-13.9-35.3-49.6-15.4-21.7c-3.8-5.3 0-12.6 6.5-12.6h33zm-101.9 14.1l32.5 45.7 16 22.5 16.5 23.2 24.3 34.1 8.6 12.1 2.9 4.1c16.1 22.6 10.1 54.3-17.6 54.3H32.4c-6.5 0-10.3-7.3-6.5-12.6l23.1-32.5c11.9-16.7 11.9-16.7 11.9-16.7l50.3-70.7c3.9-5.5 10.2-5.5 14.1 0z" />
                  <path d="M239.1 364.6c-48.8 33.6-114.3 37.3-155.3 12.6-3.8-2.3-5.3-7.1-3.6-11.2l12.1-27.9c1.9-4.3 7-6.2 11.1-4.1 26.6 13.9 66.2 14.3 103.7-9.5 3.9-2.5 9-1.4 11.5 2.5l18.5 26.6c2.5 3.9 1.4 9-2.5 11.5z" />
                </svg>
              }
              title="Amazon Pay"
              subtitle="Pay with Amazon Pay"
              isSelected={formData.paymentMethod === "amazon_pay"}
              onSelect={() => updateFormData("paymentMethod", "amazon_pay")}
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