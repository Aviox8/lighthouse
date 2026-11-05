"use client";

import { cn } from "@/lib/utils";
import {
  Root as PopoverRoot,
  Trigger as PopoverTriggerPrimitive,
  Content as PopoverContentPrimitive,
} from "@radix-ui/react-popover";
import { forwardRef } from "react";

const PopoverRootC = PopoverRoot as unknown as React.ComponentType<any>;
const PopoverTriggerC = PopoverTriggerPrimitive as unknown as React.ComponentType<any>;
const PopoverContentC = PopoverContentPrimitive as unknown as React.ComponentType<any>;

const Popover = forwardRef<HTMLDivElement, any>(({ className, children, ...props }) => (
  <PopoverRootC {...{ className: cn(className), ...props } as any}>
    {children}
  </PopoverRootC>
));
Popover.displayName = "Popover";

const PopoverTrigger = forwardRef<HTMLButtonElement, any>(({ className, children, ...props }) => (
  <PopoverTriggerC {...{ className: cn("inline-flex items-center justify-center", className), ...props } as any}>
    {children}
  </PopoverTriggerC>
));
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = forwardRef<HTMLDivElement, any>(({ className, children, ...props }) => (
  <PopoverContentC {...{ className: cn("w-64 rounded-none border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-[0_24px_64px_rgba(0,0,0,0.8)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className), ...props } as any}>
    {children}
  </PopoverContentC>
));
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
