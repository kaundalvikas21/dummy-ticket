"use client"

import { motion } from "framer-motion"
import { Check, Shield } from "lucide-react"
import { InfoCard } from "@/components/ui/input/InfoCard"
import { useTranslation } from "@/lib/translations"

export function ServicePlanSelection({ formData, updateFormData, servicePlans }) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 md:space-y-6"
    >
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
          {t('buyTicket.servicePlan.title')}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {t('buyTicket.servicePlan.description')}
        </p>
      </div>

      <div className="grid gap-4 md:gap-6">
        {servicePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={formData.selectedPlan === plan.id}
            onSelect={() => updateFormData("selectedPlan", plan.id)}
          />
        ))}
      </div>

      <InfoCard
        icon={Shield}
        title={t('buyTicket.servicePlan.allPlansInclude')}
        description={t('buyTicket.servicePlan.allPlansInclude')}
        variant="blue"
      />
    </motion.div>
  )
}

function PlanCard({ plan, isSelected, onSelect }) {
  const { t } = useTranslation()
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all text-left ${isSelected
          ? "border-[#0066FF] bg-blue-50 shadow-lg shadow-blue-500/20"
          : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
    >
      {plan.popular_label && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white px-4 py-1 rounded-full text-xs font-semibold uppercase">
            {plan.popular_label}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 md:gap-4 mb-3 md:mb-4">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">
            {plan.name}
          </h3>
          <div className="flex items-baseline gap-1 mb-1 md:mb-2">
            <span className="text-2xl md:text-3xl font-bold text-gray-700">$</span>
            <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
              {plan.price}
            </span>
            <span className="text-xs md:text-sm text-gray-500 ml-1">/person</span>
          </div>
          <p className="text-[10px] md:text-xs text-gray-500">{plan.currencies}</p>
        </div>

        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "border-[#0066FF] bg-[#0066FF]" : "border-gray-300 bg-white"
            }`}
        >
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>

      <ul className="space-y-1.5 md:space-y-2">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
            <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00D4AA] flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.button>
  )
}