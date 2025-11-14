"use client"

import { motion } from "framer-motion"
import { Plane } from "lucide-react"
import { TextInput } from "@/components/ui/input/TextInput"
import { SelectInput } from "@/components/ui/input/SelectInput"
import { DatePicker } from "@/components/ui/input/DatePicker"
import { useTranslation } from "@/lib/translations"

export function TravelDetailsForm({ formData, updateFormData }) {
  const { t } = useTranslation()

  const travelClassOptions = [
    { value: "economy", label: t('buyTicket.travelDetails.travelClasses.economy') },
    { value: "premium-economy", label: t('buyTicket.travelDetails.travelClasses.premiumEconomy') },
    { value: "business", label: t('buyTicket.travelDetails.travelClasses.business') },
    { value: "first", label: t('buyTicket.travelDetails.travelClasses.first') },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-4 md:space-y-6"
    >
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
          {t('buyTicket.travelDetails.title')}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {t('buyTicket.travelDetails.description')}
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Trip Type Selection */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
            {t('buyTicket.travelDetails.fields.tripType')} *
          </label>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <TripTypeButton
              type="round-trip"
              label={t('buyTicket.travelDetails.fields.roundTrip')}
              subtitle={t('buyTicket.travelDetails.fields.departureAndReturn')}
              isSelected={formData.tripType === "round-trip"}
              onSelect={() => updateFormData("tripType", "round-trip")}
            />
            <TripTypeButton
              type="one-way"
              label={t('buyTicket.travelDetails.fields.oneWay')}
              subtitle={t('buyTicket.travelDetails.fields.departureOnly')}
              isSelected={formData.tripType === "one-way"}
              onSelect={() => updateFormData("tripType", "one-way")}
            />
          </div>
        </div>

        {/* City and Date Inputs */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <TextInput
            label={t('buyTicket.travelDetails.fields.departureCity')}
            icon={Plane}
            value={formData.departureCity}
            onChange={(value) => updateFormData("departureCity", value)}
            placeholder={t('buyTicket.travelDetails.placeholders.departureCity')}
            required
          />

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
              {t('buyTicket.travelDetails.fields.arrivalCity')} *
            </label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 rotate-90" />
              <input
                type="text"
                value={formData.arrivalCity}
                onChange={(e) => updateFormData("arrivalCity", e.target.value)}
                placeholder={t('buyTicket.travelDetails.placeholders.arrivalCity')}
                className="w-full pl-10 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <DatePicker
            label={t('buyTicket.travelDetails.fields.departureDate')}
            value={formData.departureDate}
            onChange={(value) => updateFormData("departureDate", value)}
            required
            disabledDate={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />

          {formData.tripType === "round-trip" && (
            <DatePicker
              label={t('buyTicket.travelDetails.fields.returnDate')}
              value={formData.returnDate}
              onChange={(value) => updateFormData("returnDate", value)}
              required
              disabledDate={(date) =>
                date < new Date(formData.departureDate || new Date())
              }
            />
          )}
        </div>

        {/* Travel Class */}
        <SelectInput
          label={t('buyTicket.travelDetails.fields.travelClass')}
          value={formData.travelClass}
          onChange={(value) => updateFormData("travelClass", value)}
          options={travelClassOptions}
          required
        />
      </div>
    </motion.div>
  )
}

function TripTypeButton({ type, label, subtitle, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? "border-[#0066FF] bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="font-semibold text-sm md:text-base">{label}</div>
      <div className="text-xs md:text-sm text-gray-600">{subtitle}</div>
    </button>
  )
}
