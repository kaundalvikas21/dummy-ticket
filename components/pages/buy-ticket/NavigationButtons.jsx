"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NavigationButtons({ currentStep, totalSteps, isStepValid, onNext, onPrevious }) {
  return (
    <div className="flex justify-between mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 gap-3">
      <Button
        onClick={onPrevious}
        disabled={currentStep === 1}
        variant="outline"
        className="flex items-center gap-1.5 md:gap-2 bg-transparent text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </Button>
      
      <Button
        onClick={onNext}
        disabled={currentStep === totalSteps || !isStepValid}
        className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 cursor-pointer"
      >
        <span className="hidden sm:inline">
          {currentStep === totalSteps ? "Complete Order" : "Next Step"}
        </span>
        <span className="sm:hidden">
          {currentStep === totalSteps ? "Complete" : "Next"}
        </span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}