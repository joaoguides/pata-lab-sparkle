import React from "react";
import { cn } from "@/lib/utils";

// Create buttonVariants and ButtonProps for shadcn compatibility
export const buttonVariants = (props: any = {}) => {
  const { variant = "default", size = "default" } = props;
  return `btn ${variant === "default" ? "btn-primary" : `btn-${variant}`} ${size !== "default" ? `btn-${size}` : ""}`;
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "secondary" | "destructive" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "ghost" | "outline" | "secondary" | "destructive" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, Props>(({ 
  variant = "primary", 
  size = "default", 
  asChild = false,
  className, 
  ...props 
}, ref) => {
  const baseClasses = "btn";
  const variantClasses = {
    primary: "btn-primary",
    default: "btn-primary", // Map default to primary
    ghost: "btn-ghost", 
    outline: "border border-input hover:bg-accent",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  };
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-lg", 
    icon: "h-10 w-10 p-0"
  };

  if (asChild) {
    return props.children;
  }

  return (
    <button 
      {...props} 
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )} 
    />
  );
});

Button.displayName = "Button";

export default Button;
export { Button };
