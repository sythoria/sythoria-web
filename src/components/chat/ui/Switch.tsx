"use client";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-text-primary">{label}</p>}
          {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ?? "Toggle"}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface outline-none ${
          checked ? "bg-accent" : "bg-input-border"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 shadow-sm ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
