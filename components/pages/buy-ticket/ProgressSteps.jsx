"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

export function ProgressSteps({ steps, currentStep }) {
  return (
    <div className="max-w-5xl mx-auto mb-8 md:mb-16">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-8 md:top-12 left-0 right-0 h-0.5 md:h-1 bg-gray-200" />

        {/* Animated Progress Bar */}
        <motion.div
          className="absolute top-8 md:top-12 left-0 h-0.5 md:h-1 bg-gradient-to-r from-[#0066FF] to-[#00D4AA]"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Steps */}
        <div className="relative flex flex-row justify-between gap-2 md:gap-0 overflow-x-auto pb-2 pt-3 md:pt-4 scrollbar-hide">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id
            const isActive = currentStep === step.id
            const isUpcoming = currentStep < step.id

            return (
              <StepItem
                key={step.id}
                step={step}
                index={index}
                isCompleted={isCompleted}
                isActive={isActive}
                isUpcoming={isUpcoming}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StepItem({ step, index, isCompleted, isActive, isUpcoming }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center flex-1 min-w-[70px] md:min-w-0 relative"
    >
      <div className="relative">
        {/* Step Number Badge */}
        <motion.div
          className={`absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 z-20 w-4 h-4 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[8px] md:text-xs font-bold shadow-lg ${
            isCompleted
              ? "bg-green-500 text-white"
              : isActive
                ? "bg-white text-[#0066FF] ring-1 md:ring-2 ring-[#0066FF]"
                : "bg-gray-300 text-gray-600"
          }`}
          animate={{
            scale: isActive ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isActive ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          }}
        >
          {step.id}
        </motion.div>

        {/* Step Icon Circle */}
        <motion.div
          className={`relative z-10 w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCompleted
              ? "bg-gradient-to-br from-green-400 to-green-600 shadow-md md:shadow-lg shadow-green-500/50"
              : isActive
                ? "bg-gradient-to-br from-[#0066FF] to-[#00D4AA] shadow-md md:shadow-lg shadow-blue-500/50"
                : "bg-white border-2 border-gray-300"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Check className="w-4 h-4 md:w-8 md:h-8 text-white" />
              </motion.div>
            ) : (
              <motion.div 
                key="icon" 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                exit={{ scale: 0 }}
              >
                <step.icon className={`w-4 h-4 md:w-7 md:h-7 ${isActive ? "text-white" : "text-gray-400"}`} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse Animation for Active Step */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full bg-[#0066FF]"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Step Label */}
      <motion.div
        className="mt-1.5 md:mt-4 text-center"
        animate={{
          scale: isActive ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`text-[9px] md:text-sm font-semibold transition-colors duration-300 leading-tight ${
            isCompleted || isActive ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {step.name}
        </div>

        <div className="mt-0.5 md:mt-1">
          {isCompleted && (
            <span className="inline-flex items-center gap-0.5 md:gap-1 text-[8px] md:text-xs text-green-600 font-medium">
              <Check className="w-2 h-2 md:w-3 md:h-3" />
              <span className="hidden md:inline">Completed</span>
            </span>
          )}
          {isActive && (
            <span className="inline-flex items-center gap-0.5 md:gap-1 text-[8px] md:text-xs text-[#0066FF] font-medium">
              <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-[#0066FF] animate-pulse" />
              <span className="hidden md:inline">In Progress</span>
            </span>
          )}
          {isUpcoming && (
            <span className="text-[8px] md:text-xs text-gray-400 font-medium hidden md:inline">
              Pending
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}