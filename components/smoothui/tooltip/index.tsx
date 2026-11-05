"use client";

import { cn } from "@/lib/utils";
import {
  Root as TooltipRoot,
  Trigger as TooltipTriggerPrimitive,
  Content as TooltipContentPrimitive,
  Provider as TooltipProviderPrimitive,
} from "@radix-ui/react-tooltip";
import { forwardRef } from "react";

const TooltipRootC = TooltipRoot as unknown as React.ComponentType<any>;
const TooltipTriggerC = TooltipTriggerPrimitive as unknown as React.ComponentType<any>;
const TooltipContentC = TooltipContentPrimitive as unknown as React.ComponentType<any>;

const Tooltip = forwardRef<HTMLDivElement, any>(({ className, children, ...props }) => (
  <TooltipRootC {...{ className: cn(className), ...props } as any}>
    {children}
  </TooltipRootC>
));
Tooltip.displayName = "Tooltip";

const TooltipTrigger = forwardRef<HTMLButtonElement, any>(({ className, children, ...props }) => (
  <TooltipTriggerC {...{ className: cn("inline-flex items-center justify-center", className), ...props } as any}>
    {children}
  </TooltipTriggerC>
));
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = forwardRef<HTMLDivElement, any>(({ className, children, ...props }) => (
  <TooltipContentC {...{ className: cn("rounded-none border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-2 py-1 text-xs text-[var(--text-primary)] shadow-[0_24px_64px_rgba(0,0,0,0.8)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className), ...props } as any}>
    {children}
  </TooltipContentC>
));
TooltipContent.displayName = "TooltipContent";

const TooltipProvider = TooltipProviderPrimitive;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
