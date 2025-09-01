import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  return <input {...props} ref={ref} className={cn("input", props.className)} />;
});

Input.displayName = "Input";

export default Input;
export { Input };
