"use client";

import { cn } from "@/lib/utils";
import {
  Root as DialogRoot,
  Trigger as DialogTriggerPrimitive,
  Portal as DialogPortalPrimitive,
  Overlay as DialogOverlayPrimitive,
  Content as DialogContentPrimitive,
  Title as DialogTitlePrimitive,
  Description as DialogDescriptionPrimitive,
  Close as DialogClosePrimitive,
} from "@radix-ui/react-dialog";
import { forwardRef } from "react";

const DialogRootC = DialogRoot as unknown as React.ComponentType<any>;
const DialogTriggerC = DialogTriggerPrimitive as unknown as React.ComponentType<any>;
const DialogPortalC = DialogPortalPrimitive as unknown as React.ComponentType<any>;
const DialogOverlayC = DialogOverlayPrimitive as unknown as React.ComponentType<any>;
const DialogContentC = DialogContentPrimitive as unknown as React.ComponentType<any>;
const DialogTitleC = DialogTitlePrimitive as unknown as React.ComponentType<any>;
const DialogDescriptionC = DialogDescriptionPrimitive as unknown as React.ComponentType<any>;
const DialogCloseC = DialogClosePrimitive as unknown as React.ComponentType<any>;

const Dialog = forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
  <DialogRootC {...{ className: cn("fixed inset-0 z-50 flex items-center justify-center", className), ...props } as any}>
    {children}
  </DialogRootC>
));
Dialog.displayName = "Dialog";

const DialogTrigger = forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => (
  <DialogTriggerC {...{ className: cn("inline-flex items-center justify-center", className), ...props } as any}>
    {children}
  </DialogTriggerC>
));
DialogTrigger.displayName = "DialogTrigger";

const DialogPortal = forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
  <DialogPortalC {...{ className: cn(className), ...props } as any}>
    {children}
  </DialogPortalC>
));
DialogPortal.displayName = "DialogPortal";

const DialogOverlay = forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
  <DialogOverlayC {...{ className: cn("fixed inset-0 z-50 bg-[rgba(0,0,0,0.8)] backdrop-blur-sm", className), ...props } as any}>
    {children}
  </DialogOverlayC>
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
  <DialogContentC {...{ className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.8)]", className), ...props } as any}>
    {children}
  </DialogContentC>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = forwardRef<HTMLDivElement, any>(({ className, children, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props}>
    {children}
  </div>
));
DialogHeader.displayName = "DialogHeader";

const DialogFooter = forwardRef<HTMLDivElement, any>(({ className, children, ...props }) => (
  <div className={cn("mt-4 flex flex-row-reverse gap-2", className)} {...props}>
    {children}
  </div>
));
DialogFooter.displayName = "DialogFooter";

const DialogTitle = forwardRef<HTMLHeadingElement, any>(({ className, children, ...props }, ref) => (
  <DialogTitleC {...{ className: cn("text-lg font-semibold leading-none tracking-tight text-[var(--text-primary)]", className), ...props } as any}>
    {children}
  </DialogTitleC>
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = forwardRef<HTMLParagraphElement, any>(({ className, children, ...props }, ref) => (
  <DialogDescriptionC {...{ className: cn("text-sm text-[var(--text-secondary)]", className), ...props } as any}>
    {children}
  </DialogDescriptionC>
));
DialogDescription.displayName = "DialogDescription";

const DialogClose = forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => (
  <DialogCloseC {...{ className: cn("absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100", className), ...props } as any} aria-label="Close">
    {children}
  </DialogCloseC>
));
DialogClose.displayName = "DialogClose";

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
