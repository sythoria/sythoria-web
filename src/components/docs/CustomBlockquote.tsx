import React from "react";
import {
  Info,
  Lightbulb,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";

type AlertType = "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";

interface AlertConfig {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  containerClass: string;
  iconClass: string;
  headerClass: string;
}

const ALERT_CONFIGS: Record<AlertType, AlertConfig> = {
  NOTE: {
    icon: Info,
    title: "Note",
    containerClass:
      "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 text-blue-900 dark:text-blue-100",
    iconClass: "text-blue-600 dark:text-blue-400",
    headerClass: "text-blue-800 dark:text-blue-300",
  },
  TIP: {
    icon: Lightbulb,
    title: "Tip",
    containerClass:
      "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    headerClass: "text-emerald-800 dark:text-emerald-300",
  },
  IMPORTANT: {
    icon: AlertCircle,
    title: "Important",
    containerClass:
      "border-violet-500 bg-violet-500/5 dark:bg-violet-500/10 text-violet-900 dark:text-violet-100",
    iconClass: "text-violet-600 dark:text-violet-400",
    headerClass: "text-violet-800 dark:text-violet-300",
  },
  WARNING: {
    icon: AlertTriangle,
    title: "Warning",
    containerClass:
      "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 text-amber-900 dark:text-amber-100",
    iconClass: "text-amber-600 dark:text-amber-400",
    headerClass: "text-amber-800 dark:text-amber-300",
  },
  CAUTION: {
    icon: AlertOctagon,
    title: "Caution",
    containerClass:
      "border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-900 dark:text-rose-100",
    iconClass: "text-rose-600 dark:text-rose-400",
    headerClass: "text-rose-800 dark:text-rose-300",
  },
};

function extractAlert(
  children: React.ReactNode
): { type: AlertType; children: React.ReactNode } | null {
  if (!children) return null;

  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length === 0) return null;

  // Find the first index that is either a non-empty React element or a non-whitespace string
  const firstRealIndex = childrenArray.findIndex((child) => {
    if (typeof child === "string") {
      return child.trim() !== "";
    }
    return child !== null && child !== undefined;
  });

  if (firstRealIndex === -1) return null;

  const firstChild = childrenArray[firstRealIndex];

  // Case 1: First child is a string
  if (typeof firstChild === "string") {
    // Check 1.1: [!NOTE] style
    const m1 = firstChild.match(
      /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*[\r\n]*/i
    );
    if (m1) {
      const type = m1[1].toUpperCase() as AlertType;
      const rest = firstChild.substring(m1[0].length);
      const newChildren = [
        ...childrenArray.slice(0, firstRealIndex),
        ...(rest ? [rest] : []),
        ...childrenArray.slice(firstRealIndex + 1),
      ];
      return { type, children: newChildren };
    }

    // Check 1.2: Note: style
    const m2 = firstChild.match(
      /^\s*(NOTE|TIP|IMPORTANT|WARNING|CAUTION):\s*/i
    );
    if (m2) {
      const type = m2[1].toUpperCase() as AlertType;
      const rest = firstChild.substring(m2[0].length);
      const newChildren = [
        ...childrenArray.slice(0, firstRealIndex),
        ...(rest ? [rest] : []),
        ...childrenArray.slice(firstRealIndex + 1),
      ];
      return { type, children: newChildren };
    }
  }

  // Case 2: First child is a React Element (e.g. <p> or <strong>)
  if (React.isValidElement(firstChild)) {
    const element = firstChild as React.ReactElement<{
      children?: React.ReactNode;
    }>;

    // Check 2.1: Is it a bold/italic tag containing the alert word?
    const tag =
      typeof element.type === "string" ? element.type.toLowerCase() : "";
    if (tag === "strong" || tag === "em" || tag === "b" || tag === "i") {
      const innerText =
        typeof element.props.children === "string"
          ? element.props.children
          : "";

      // Match "Note:" or "Note"
      const mInlineColon = innerText.match(
        /^\s*(NOTE|TIP|IMPORTANT|WARNING|CAUTION):\s*$/i
      );
      if (mInlineColon) {
        const type = mInlineColon[1].toUpperCase() as AlertType;
        const newChildren = [
          ...childrenArray.slice(0, firstRealIndex),
          ...childrenArray.slice(firstRealIndex + 1),
        ];
        return { type, children: newChildren };
      }

      const mInlineNoColon = innerText.match(
        /^\s*(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\s*$/i
      );
      if (mInlineNoColon) {
        const type = mInlineNoColon[1].toUpperCase() as AlertType;

        // Look at the next child to check for a colon
        const nextIndex = firstRealIndex + 1;
        if (
          nextIndex < childrenArray.length &&
          typeof childrenArray[nextIndex] === "string"
        ) {
          const nextStr = childrenArray[nextIndex] as string;
          const colonMatch = nextStr.match(/^\s*:\s*/);
          if (colonMatch) {
            const rest = nextStr.substring(colonMatch[0].length);
            const newChildren = [
              ...childrenArray.slice(0, firstRealIndex),
              ...(rest ? [rest] : []),
              ...childrenArray.slice(nextIndex + 1),
            ];
            return { type, children: newChildren };
          }
        }
      }
    }

    // Check 2.2: Standard recursion (first child is a tag containing the alert)
    const innerResult = extractAlert(element.props.children);
    if (innerResult) {
      const innerChildrenArray = React.Children.toArray(innerResult.children);
      const isInnerEmpty =
        innerChildrenArray.length === 0 ||
        (innerChildrenArray.length === 1 &&
          typeof innerChildrenArray[0] === "string" &&
          innerChildrenArray[0].trim() === "");

      let newChildren: React.ReactNode[];
      if (isInnerEmpty) {
        newChildren = [
          ...childrenArray.slice(0, firstRealIndex),
          ...childrenArray.slice(firstRealIndex + 1),
        ];
      } else {
        const cleanedElement = React.cloneElement(element, {
          ...element.props,
          children: innerResult.children,
        });
        newChildren = [
          ...childrenArray.slice(0, firstRealIndex),
          cleanedElement,
          ...childrenArray.slice(firstRealIndex + 1),
        ];
      }
      return { type: innerResult.type, children: newChildren };
    }
  }

  return null;
}

export default function CustomBlockquote({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"blockquote">) {
  const alert = extractAlert(children);
  if (!alert) {
    return <blockquote {...props}>{children}</blockquote>;
  }

  const { type, children: alertChildren } = alert;
  const config = ALERT_CONFIGS[type];
  const Icon = config.icon;

  return (
    <div
      className={`my-6 flex gap-4 p-4 border-l-4 rounded-r-xl ${config.containerClass}`}
      data-testid={`alert-${type.toLowerCase()}`}
    >
      <div className={`mt-0.5 shrink-0 ${config.iconClass}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`font-semibold text-xs mb-1 uppercase tracking-wider ${config.headerClass}`}
        >
          {config.title}
        </div>
        <div className="text-sm leading-relaxed">{alertChildren}</div>
      </div>
    </div>
  );
}
