import { type HTMLAttributes, forwardRef } from "react";

type BadgeVariant = "default" | "accent" | "outline" | "success" | "warning";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  dot?: boolean;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-accent-soft text-accent border border-accent/10",
  accent: "bg-accent text-accent-contrast border border-accent",
  outline: "bg-transparent text-text-secondary border border-border",
  success:
    "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  warning:
    "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = "default", dot = false, className = "", children, ...props },
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
