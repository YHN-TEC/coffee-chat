"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c97a42]/30",
  {
    variants: {
      variant: {
        primary: "bg-[#5b3620] text-white hover:bg-[#472a19]",
        secondary: "bg-[#f3e4d3] text-[#5b3620] hover:bg-[#ead7c1]",
        outline: "border border-[#d9c1ad] bg-white text-[#5b3620] hover:bg-[#faf6f0]",
        ghost: "text-[#6b4a36] hover:bg-[#f7efe4]",
        danger: "bg-[#b74835] text-white hover:bg-[#963a2a]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-[#d9c1ad] bg-white px-3 py-2 text-sm text-[#3d281d] shadow-sm outline-none placeholder:text-[#ab8f79] focus:border-[#c97a42]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[110px] w-full rounded-lg border border-[#d9c1ad] bg-white px-3 py-2 text-sm text-[#3d281d] shadow-sm outline-none placeholder:text-[#ab8f79] focus:border-[#c97a42]",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-lg border border-[#d9c1ad] bg-white px-3 py-2 text-sm text-[#3d281d] shadow-sm outline-none focus:border-[#c97a42]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn("h-4 w-4 rounded border-[#d9c1ad] text-[#5b3620] accent-[#5b3620]", className)}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-[#5e4130]", className)} {...props} />;
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-[#b74835]">{error}</p> : hint ? <p className="text-sm text-[#8b6b54]">{hint}</p> : null}
    </div>
  );
}

export function Card({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#ead7c1] bg-white shadow-[0_10px_30px_-20px_rgba(74,45,29,0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function Badge({
  className,
  children,
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#f7efe4] px-3 py-1 text-xs font-medium text-[#7a5338]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn("h-12 w-12 rounded-full object-cover", className)} />;
  }

  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full bg-[#e6c6a8] text-sm font-semibold text-[#5b3620]",
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[#3d281d]">{title}</h1>
        {description ? <p className="text-sm text-[#8b6b54]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed bg-[#fffaf5]">
      <CardContent className="py-10 text-center">
        <h3 className="text-lg font-semibold text-[#4b3023]">{title}</h3>
        <p className="mt-2 text-sm text-[#8b6b54]">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
