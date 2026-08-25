import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, CircleNotch } from '@phosphor-icons/react';
import { cn } from '../utils/cn';

export function ReceiptPrinter({ stage, children }) {
  return (
    <div className="w-full max-w-sm mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-neutral-400 flex flex-col gap-5 relative overflow-hidden">
      {/* LED Status Bar / Screen Display */}
      <div className="bg-black border border-neutral-800 rounded-xl p-4 flex items-center justify-between shadow-inner">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">Terminal Status</span>
          <span className="text-sm font-semibold font-mono text-neutral-300">
            {stage === 'processing' && 'Processing Booking...'}
            {stage === 'printing' && 'Printing Receipt...'}
            {stage === 'complete' && 'Transaction Complete'}
          </span>
        </div>
        <div className="flex items-center justify-center">
          {stage === 'processing' && (
            <CircleNotch className="w-5 h-5 animate-spin text-amber-500" />
          )}
          {stage === 'printing' && (
            <CircleNotch className="w-5 h-5 animate-spin text-amber-500" />
          )}
          {stage === 'complete' && (
            <CheckCircle className="w-6 h-6 text-emerald-400" weight="fill" />
          )}
        </div>
      </div>

      {/* Printer Slot & Feed Mechanical Simulator */}
      <div className="relative bg-neutral-950 border-t border-b border-neutral-800 rounded-md p-1 overflow-hidden h-[240px] flex items-end">
        {/* Metal Tear Cutter Bar Shadow/Indicator */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-neutral-950 to-transparent z-10" />
        <div className="absolute top-0 left-4 right-4 h-[2px] bg-neutral-800 z-20" />

        {/* Paper Feeding Mechanism container */}
        <div className="w-full overflow-hidden relative flex flex-col justify-end h-full">
          <AnimatePresence>
            {stage !== 'processing' && (
              <motion.div
                initial="hidden"
                animate="printing"
                exit="hidden"
                variants={{
                  hidden: { y: '-100%', opacity: 0 },
                  printing: {
                    y: ['-80%', '-60%', '-40%', '-20%', '0%'],
                    opacity: 1,
                    transition: {
                      duration: 2.2,
                      ease: 'linear',
                      times: [0, 0.25, 0.5, 0.75, 1]
                    }
                  }
                }}
                className="w-full"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: ReceiptPrinter.Paper
ReceiptPrinter.Paper = function ReceiptPaper({ children, className }) {
  return (
    <div className={cn(
      "bg-white text-neutral-900 font-mono text-xs p-5 shadow-lg border-l border-r border-neutral-200 rounded-sm relative flex flex-col gap-3 min-h-[220px]",
      className
    )}>
      {/* Decorative Receipt Serrated Tear Top Line */}
      <div className="absolute -top-1 left-0 right-0 flex overflow-hidden h-2 select-none pointer-events-none">
        {Array.from({ length: 40 }).map((_, idx) => (
          <span key={idx} className="text-[10px] text-neutral-200 leading-none" style={{ marginTop: '-4px' }}>^</span>
        ))}
      </div>
      {children}
    </div>
  );
};
