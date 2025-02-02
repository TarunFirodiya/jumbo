import React from 'react';
import { motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
}

const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack 
}: ProgressIndicatorProps) => {
  const isExpanded = currentStep === 1;

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex items-center gap-6 relative">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index + 1}
            className={cn(
              "w-2 h-2 rounded-full relative z-10",
              index + 1 <= currentStep ? "bg-white" : "bg-gray-300"
            )}
          />
        ))}

        {/* Green progress overlay */}
        <motion.div
          initial={{ width: '12px', height: "24px", x: 0 }}
          animate={{
            width: `${(currentStep / totalSteps) * 100}%`,
            x: 0
          }}
          className="absolute -left-[8px] -top-[8px] -translate-y-1/2 h-3 bg-green-500 rounded-full"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.8,
            bounce: 0.25,
            duration: 0.6
          }}
        />
      </div>

      {/* Buttons container */}
      <div className="w-full max-w-sm">
        <motion.div
          className="flex items-center gap-1"
          animate={{
            justifyContent: isExpanded ? 'stretch' : 'space-between'
          }}
        >
          {!isExpanded && (
            <motion.button
              initial={{ opacity: 0, width: 0, scale: 0.8 }}
              animate={{ opacity: 1, width: "64px", scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                mass: 0.8,
                bounce: 0.25,
                duration: 0.6,
                opacity: { duration: 0.2 }
              }}
              onClick={onBack}
              className="px-4 py-3 text-black flex items-center justify-center bg-gray-100 font-semibold rounded-full hover:bg-gray-50 hover:border transition-colors flex-1 w-16 text-sm"
            >
              Back
            </motion.button>
          )}
          <motion.button
            onClick={onNext}
            animate={{
              flex: isExpanded ? 1 : 'inherit',
            }}
            className={cn(
              "px-4 py-3 rounded-full text-white bg-[#006cff] transition-colors flex-1 w-56",
              !isExpanded && 'w-44'
            )}
          >
            <div className="flex items-center font-[600] justify-center gap-2 text-sm">
              {currentStep === totalSteps && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    mass: 0.5,
                    bounce: 0.4
                  }}
                >
                  <CircleCheck size={16} />
                </motion.div>
              )}
              {currentStep === totalSteps ? 'Finish' : 'Continue'}
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressIndicator;