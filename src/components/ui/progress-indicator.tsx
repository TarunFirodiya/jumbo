import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const ProgressIndicator = ({ currentStep, onStepChange }: { currentStep: number; onStepChange: (step: number) => void }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-8">
            <div className="flex items-center gap-6 relative">
                {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                        key={dot}
                        className={cn(
                            "w-2 h-2 rounded-full relative z-10",
                            dot <= currentStep ? "bg-white" : "bg-gray-300"
                        )}
                    />
                ))}

                {/* Green progress overlay */}
                <motion.div
                    initial={{ width: '12px', height: "24px", x: 0 }}
                    animate={{
                        width: currentStep === 1 ? '24px' : 
                               currentStep === 2 ? '60px' : 
                               currentStep === 3 ? '96px' :
                               currentStep === 4 ? '132px' : '168px',
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
        </div>
    )
}

export default ProgressIndicator