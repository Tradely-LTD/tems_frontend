import { clsx } from 'clsx';
import type { StepperProps } from './types';

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-start w-full">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;

        return (
          <div key={idx} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Circle */}
              <div
                className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors',
                  isCompleted && 'bg-[#002366] text-white',
                  isActive && 'bg-[#D4AF37] text-white',
                  !isCompleted && !isActive && 'bg-[#c5c6d2] text-[#444650]'
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              {/* Label */}
              <span
                className={clsx(
                  'mt-1.5 text-[11px] text-center leading-tight max-w-[80px]',
                  isCompleted && 'text-[#002366] font-medium',
                  isActive && 'text-[#1a1b20] font-semibold',
                  !isCompleted && !isActive && 'text-[#444650]'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line — not after last step */}
            {idx < steps.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mt-3 mx-1 transition-colors',
                  idx < currentStep ? 'bg-[#002366]' : 'bg-[#c5c6d2]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
