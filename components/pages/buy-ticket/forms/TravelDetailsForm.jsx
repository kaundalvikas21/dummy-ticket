"use client"

import { motion } from "framer-motion"
import { Plane } from "lucide-react"
import { TextInput } from "@/components/ui/input/TextInput"
import { SelectInput } from "@/components/ui/input/SelectInput"
import { DatePicker } from "@/components/ui/input/DatePicker"

const travelClassOptions = [
  { value: "economy", label: "Economy Class" },
  { value: "premium-economy", label: "Premium Economy" },
  { value: "business", label: "Business Class" },
  { value: "first", label: "First Class" },
]

export function TravelDetailsForm({ formData, updateFormData }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-4 md:space-y-6"
    >
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
          Travel Details
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Provide your travel itinerary information
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Trip Type Selection */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
            Trip Type *
          </label>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <TripTypeButton
              type="round-trip"
              label="Round Trip"
              subtitle="Departure & Return"
              isSelected={formData.tripType === "round-trip"}
              onSelect={() => updateFormData("tripType", "round-trip")}
            />
            <TripTypeButton
              type="one-way"
              label="One Way"
              subtitle="Departure Only"
              isSelected={formData.tripType === "one-way"}
              onSelect={() => updateFormData("tripType", "one-way")}
            />
          </div>
        </div>

        {/* City and Date Inputs */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <TextInput
            label="Departure City"
            icon={Plane}
            value={formData.departureCity}
            onChange={(value) => updateFormData("departureCity", value)}
            placeholder="New York (JFK)"
            required
          />

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
              Arrival City *
            </label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 rotate-90" />
              <input
                type="text"
                value={formData.arrivalCity}
                onChange={(e) => updateFormData("arrivalCity", e.target.value)}
                placeholder="London (LHR)"
                className="w-full pl-10 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <DatePicker
            label="Departure Date"
            value={formData.departureDate}
            onChange={(value) => updateFormData("departureDate", value)}
            required
            disabledDate={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />

          {formData.tripType === "round-trip" && (
            <DatePicker
              label="Return Date"
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
          label="Travel Class"
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
