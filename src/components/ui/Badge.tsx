import { type HTMLAttributes, forwardRef } from "react";

type BadgeVariant = "default" | "accent" | "outline" | "success" | "warning";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  dot?: boolean;
};

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-accent-soft text-accent border border-accent/10",
  accent:
    "bg-accent text-white border border-accent",
  outline:
    "bg-transparent text-text-secondary border border-border",
  success:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  warning:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      dot = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
      variantClasses[variant],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span ref={ref} className={classes} {...props}>
        {dot && (
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
export default Badge;
