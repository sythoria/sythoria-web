import {
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  forwardRef,
} from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "xl";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsAnchor = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "btn-primary bg-accent hover:bg-accent-hover !text-white shadow-sm shadow-accent/20 hover:shadow-lg hover:shadow-accent/25 active:scale-[0.97] hover:-translate-y-0.5",
  secondary:
    "btn-secondary bg-surface border border-border !text-text-primary hover:!text-text-primary hover:border-accent/40 hover:bg-hover hover:shadow-md hover:shadow-accent/5 hover:-translate-y-0.5",
  tertiary:
    "bg-accent-soft !text-accent hover:bg-accent/15 border border-accent/10 hover:border-accent/25 hover:shadow-sm hover:shadow-accent/10 active:scale-[0.97] hover:-translate-y-0.5",
  outline:
    "bg-transparent border border-border !text-text-secondary hover:!text-text-primary hover:border-accent/30 hover:bg-hover hover:shadow-sm hover:shadow-accent/5 hover:-translate-y-0.5",
  ghost:
    "bg-transparent !text-text-secondary hover:!text-text-primary hover:bg-hover active:scale-[0.97]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs gap-1.5 min-h-[32px] rounded-lg",
  md: "px-5 py-2.5 text-sm gap-2 min-h-[40px] rounded-xl",
  lg: "px-7 py-3.5 text-base gap-2.5 min-h-[48px] rounded-xl",
  xl: "px-8 py-4 text-lg gap-3 min-h-[56px] rounded-xl",
};

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      icon,
      iconRight,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      "inline-flex items-center justify-center font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out select-none whitespace-nowrap relative overflow-hidden !no-underline",
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = (
      <>
        {variant === "primary" && (
          <span className="btn-shine" aria-hidden="true" />
        )}
        <span className="relative z-[1] inline-flex items-center justify-center [&]:gap-[inherit]">
          {icon && <span className="shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {iconRight && (
            <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
              {iconRight}
            </span>
          )}
        </span>
      </>
    );

    if ("href" in props && props.href) {
      const { href, ...rest } = props as ButtonAsAnchor;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...rest}
        >
          {content}
        </a>
      );
    }

    const buttonProps = props as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
