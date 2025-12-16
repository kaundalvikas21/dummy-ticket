"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/translations"

export function NavigationButtons({ currentStep, totalSteps, isStepValid, onNext, onPrevious, onComplete, loading }) {
  const { t } = useTranslation()
  return (
    <div className="flex justify-between mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 gap-3">
      <Button
        onClick={onPrevious}
        disabled={currentStep === 1 || loading}
        variant="outline"
        className="flex items-center gap-1.5 md:gap-2 bg-transparent text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">{t('buyTicket.navigation.previous')}</span>
        <span className="sm:hidden">{t('buyTicket.navigation.prev')}</span>
      </Button>

      <Button
        onClick={currentStep === totalSteps ? onComplete : onNext}
        disabled={!isStepValid || loading}
        className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 cursor-pointer"
      >
        <span className="hidden sm:inline">
          {loading ? t('common.processing') : (currentStep === totalSteps ? t('buyTicket.navigation.complete') : t('buyTicket.navigation.nextStep'))}
        </span>
        <span className="sm:hidden">
          {loading ? t('common.processing') : (currentStep === totalSteps ? t('buyTicket.navigation.complete') : t('buyTicket.navigation.next'))}
        </span>
        {!loading && currentStep !== totalSteps && <ChevronRight className="w-4 h-4" />}
      </Button>
    </div>
  )
}