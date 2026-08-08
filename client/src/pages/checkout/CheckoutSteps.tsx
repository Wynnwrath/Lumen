import { Fragment } from "react";

interface CheckoutStepsProps {
  currentStep: number;
}

const STEPS = [
  { number: 1, label: "Review" },
  { number: 2, label: "Details" },
  { number: 3, label: "Confirmation" },
];

// 3-line progress indicator for the checkout flow.
export const CheckoutSteps = ({ currentStep }: CheckoutStepsProps) => (
  <div className="flex items-center justify-center max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
    {STEPS.map((step, idx) => {
      const active = currentStep === step.number;
      const done = currentStep > step.number;
      return (
        <Fragment key={step.number}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm transition ${
                active
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                  : done
                    ? "bg-emerald-500 text-white"
                    : "bg-surface-container dark:bg-slate-700 text-outline"
              }`}
            >
              {step.number}
            </div>
            <span
              className={`text-xs sm:text-sm ${
                active ? "font-extrabold text-on-surface" : "font-semibold text-outline"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && <div className="flex-grow h-0.5 bg-outline-variant/40 mx-2 sm:mx-8"></div>}
        </Fragment>
      );
    })}
  </div>
);
