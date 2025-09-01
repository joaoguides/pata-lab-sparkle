import React from "react";

const Skeleton = React.forwardRef<HTMLDivElement, { className?: string; style?: React.CSSProperties }>(({ className = "", style, ...props }, ref) => {
  return <div ref={ref} style={style} className={`skeleton ${className}`} {...props} />;
});

Skeleton.displayName = "Skeleton";

export default Skeleton;
export { Skeleton };
