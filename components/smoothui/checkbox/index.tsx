"use client";

import { cn } from "@/lib/utils";
import {
  Checkbox as CheckboxRoot,
  unstable_CheckboxTrigger as CheckboxTriggerPrimitive,
} from "@radix-ui/react-checkbox";
import { forwardRef } from "react";

const CheckboxRootC = CheckboxRoot as unknown as React.ComponentType<any>;
const CheckboxTriggerC = CheckboxTriggerPrimitive as unknown as React.ComponentType<any>;

const Checkbox = forwardRef<HTMLButtonElement, any>(({ className, children, ...props }) => (
  <CheckboxRootC {...{ className: cn("inline-flex items-center justify-center", className), ...props } as any}>
    {children}
  </CheckboxRootC>
));
Checkbox.displayName = "Checkbox";

const CheckboxTrigger = forwardRef<HTMLButtonElement, any>(({ className, children, ...props }) => (
  <CheckboxTriggerC {...{ className: cn("inline-flex items-center justify-center text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--accent)] data-[state=unchecked]:bg-[var(--bg-tertiary)]", className), ...props } as any}>
    {children}
  </CheckboxTriggerC>
));
CheckboxTrigger.displayName = "CheckboxTrigger";

export { Checkbox, CheckboxTrigger };
