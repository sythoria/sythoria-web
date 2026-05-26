import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "./Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders as a span element", () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.querySelector("span")!;
    expect(badge).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.querySelector("span")!;
    expect(badge.className).toContain("bg-accent-soft");
  });

  it("applies accent variant classes", () => {
    const { container } = render(<Badge variant="accent">Accent</Badge>);
    const badge = container.querySelector("span")!;
    expect(badge.className).toContain("bg-accent");
  });

  it("applies outline variant classes", () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    const badge = container.querySelector("span")!;
    expect(badge.className).toContain("bg-transparent");
  });

  it("applies success variant classes", () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.querySelector("span")!;
    expect(badge.className).toContain("bg-emerald");
  });

  it("applies warning variant classes", () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    const badge = container.querySelector("span")!;
    expect(badge.className).toContain("bg-amber");
  });

  it("renders dot indicator when dot prop is true", () => {
    const { container } = render(<Badge dot>With Dot</Badge>);
    const dot = container.querySelector(".animate-pulse");
    expect(dot).toBeInTheDocument();
  });

  it("does not render dot by default", () => {
    const { container } = render(<Badge>No Dot</Badge>);
    const dot = container.querySelector(".animate-pulse");
    expect(dot).not.toBeInTheDocument();
  });
});
