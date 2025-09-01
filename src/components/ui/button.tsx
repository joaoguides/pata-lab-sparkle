import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "ghost" | "outline" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
};

export default function Button({ 
  variant = "primary", 
  size = "default", 
  asChild = false,
  className, 
  ...props 
}: Props) {
  const baseClasses = "btn";
  const variantClasses = {
    primary: "btn-primary",
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
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )} 
    />
  );
}
