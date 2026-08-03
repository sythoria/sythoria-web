import type { ReactNode } from "react";

function getText(value: ReactNode): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) return value.map(getText).join(" ");
  if (value && typeof value === "object" && "props" in value) {
    return getText(
      (value as { props: { children?: ReactNode } }).props.children
    );
  }
  return "";
}

function slugify(value: ReactNode): string {
  return getText(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function DocHeading({
  level,
  children,
}: {
  level: 2 | 3 | 4;
  children: ReactNode;
}) {
  const id = slugify(children);
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return (
    <Tag id={id} className="group scroll-mt-32">
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="heading-anchor"
          aria-label={`Link to ${getText(children)}`}
        >
          #
        </a>
      )}
    </Tag>
  );
}
