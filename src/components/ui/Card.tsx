import { type HTMLAttributes, forwardRef } from "react";

type CardVariant = "glass" | "solid" | "outline" | "elevated";
type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  glow?: boolean;
};

const variantClasses: Record<CardVariant, string> = {
  glass: "glass-panel border border-white/10 dark:border-white/[0.06]",
  solid: "bg-surface border border-border",
  outline: "bg-transparent border border-border",
  elevated:
    "bg-surface border border-border shadow-lg shadow-black/5 dark:shadow-black/20",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "glass",
      padding = "md",
      hover = false,
      glow = false,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const classes = [
      "rounded-xl",
      variantClasses[variant],
      paddingClasses[padding],
      hover ? "card-hover" : "",
      glow ? "card-glow" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
export default Card;
