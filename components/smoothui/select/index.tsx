"use client";

import { cn } from "@/lib/utils";
import {
  Root as SelectRoot,
  Trigger as SelectTriggerPrimitive,
  Content as SelectContentPrimitive,
  Item as SelectItemPrimitive,
  Value as SelectValuePrimitive,
} from "@radix-ui/react-select";
import { forwardRef } from "react";

const SelectRootC = SelectRoot as unknown as React.ComponentType<any>;
const SelectTriggerC = SelectTriggerPrimitive as unknown as React.ComponentType<any>;
const SelectContentC = SelectContentPrimitive as unknown as React.ComponentType<any>;
const SelectItemC = SelectItemPrimitive as unknown as React.ComponentType<any>;
const SelectValueC = SelectValuePrimitive as unknown as React.ComponentType<any>;

const Select = forwardRef<HTMLDivElement, any>(({ className, children, ...props }) => (
  <SelectRootC {...{ className: cn(className), ...props } as any}>
    {children}
  </SelectRootC>
));
Select.displayName = "Select";

const SelectTrigger = forwardRef<HTMLButtonElement, any>(({ className, children, ...props }) => (
  <SelectTriggerC {...{ className: cn("flex h-10 w-full items-center justify-between rounded-none border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50", className), ...props } as any}>
    {children}
  </SelectTriggerC>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = forwardRef<HTMLSpanElement, any>(({ className, children, ...props }) => (
  <SelectValueC {...{ className: cn(className), ...props } as any}>
    {children}
  </SelectValueC>
));
SelectValue.displayName = "SelectValue";

const SelectContent = forwardRef<HTMLDivElement, any>(({ className, children, ...props }) => (
  <SelectContentC {...{ className: cn("w-64 rounded-none border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-[0_24px_64px_rgba(0,0,0,0.8)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className), ...props } as any}>
    {children}
  </SelectContentC>
));
SelectContent.displayName = "SelectContent";

const SelectItem = forwardRef<HTMLDivElement, any>(({ className, children, ...props }) => (
  <SelectItemC {...{ className: cn("relative flex cursor-pointer select-none items-center rounded-none px-2 py-1.5 text-sm outline-none transition-colors focus:bg-[var(--bg-hover)] focus:text-[var(--text-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className), ...props } as any}>
    {children}
  </SelectItemC>
));
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
