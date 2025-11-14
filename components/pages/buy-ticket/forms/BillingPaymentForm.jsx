"use client"

import { motion } from "framer-motion"
import { CreditCard, Lock } from "lucide-react"
import { TextInput } from "@/components/ui/input/TextInput"
import { SelectInput } from "@/components/ui/input/SelectInput"
import { InfoCard } from "@/components/ui/input/InfoCard"
import { useTranslation } from "@/lib/translations"


export function BillingPaymentForm({ formData, updateFormData }) {
  const { t } = useTranslation()

  const countryOptions = [
    { value: "US", label: t('buyTicket.passengerDetails.nationalities.us') },
    { value: "UK", label: t('buyTicket.passengerDetails.nationalities.uk') },
    { value: "CA", label: t('buyTicket.passengerDetails.nationalities.ca') },
    { value: "AU", label: t('buyTicket.passengerDetails.nationalities.au') },
    { value: "IN", label: t('buyTicket.passengerDetails.nationalities.in') },
    { value: "DE", label: t('buyTicket.passengerDetails.nationalities.de') },
    { value: "FR", label: t('buyTicket.passengerDetails.nationalities.fr') },
    { value: "IT", label: t('buyTicket.passengerDetails.nationalities.it') },
    { value: "ES", label: t('buyTicket.passengerDetails.nationalities.es') },
    { value: "JP", label: t('buyTicket.passengerDetails.nationalities.jp') },
    { value: "CN", label: t('buyTicket.passengerDetails.nationalities.cn') },
    { value: "SG", label: t('buyTicket.passengerDetails.nationalities.sg') },
    { value: "AE", label: t('buyTicket.passengerDetails.nationalities.ae') },
    { value: "SA", label: t('buyTicket.passengerDetails.nationalities.sa') },
    { value: "NZ", label: t('buyTicket.passengerDetails.nationalities.nz') },
    { value: "KR", label: t('buyTicket.passengerDetails.nationalities.kr') },
    { value: "BR", label: t('buyTicket.passengerDetails.nationalities.br') },
    { value: "ZA", label: t('buyTicket.passengerDetails.nationalities.za') },
    { value: "MX", label: t('buyTicket.passengerDetails.nationalities.mx') },
    { value: "TH", label: t('buyTicket.passengerDetails.nationalities.th') },
  ]

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
              title={t('buyTicket.billingPayment.fields.paypal')}
              subtitle={t('buyTicket.billingPayment.fields.paypalDesc')}
              isSelected={formData.paymentMethod === "paypal"}
              onSelect={() => updateFormData("paymentMethod", "paypal")}
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