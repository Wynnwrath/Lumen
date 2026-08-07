import { Fragment } from "react";

interface CheckoutStepsProps {
  currentStep?: number;
}

const STEPS = [
  { number: 1, label: "Information" },
  { number: 2, label: "Delivery" },
  { number: 3, label: "Payment" },
];

export const CheckoutSteps = ({ currentStep = 1 }: CheckoutStepsProps) => {
  return (
    <div className="flex items-center justify-center max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
      {STEPS.map((step, idx) => {
        const active = step.number === currentStep;
        return (
          <Fragment key={step.number}>
            <div className={`flex items-center gap-1.5 sm:gap-2.5${active ? "" : " opacity-40"}`}>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${
                  active
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-surface-container dark:bg-slate-700 text-outline"
                } font-extrabold text-xs sm:text-sm flex items-center justify-center${active ? " shadow-md" : ""}`}
              >
                {step.number}
              </div>
              <span className={`text-xs sm:text-sm ${active ? "font-extrabold text-on-surface" : "font-semibold text-outline"}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && <div className="flex-grow h-0.5 bg-outline-variant/40 mx-2 sm:mx-8"></div>}
          </Fragment>
        );
      })}
    </div>
  );
};
