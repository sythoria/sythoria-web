import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders with role=status", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has Loading aria-label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading");
  });

  it("applies medium size by default", () => {
    render(<Spinner />);
    const svg = screen.getByRole("status");
    expect(svg.getAttribute("class")).toContain("w-6");
    expect(svg.getAttribute("class")).toContain("h-6");
  });

  it("applies small size classes", () => {
    render(<Spinner size="sm" />);
    const svg = screen.getByRole("status");
    expect(svg.getAttribute("class")).toContain("w-4");
    expect(svg.getAttribute("class")).toContain("h-4");
  });

  it("applies large size classes", () => {
    render(<Spinner size="lg" />);
    const svg = screen.getByRole("status");
    expect(svg.getAttribute("class")).toContain("w-8");
    expect(svg.getAttribute("class")).toContain("h-8");
  });

  it("applies animate-spin class", () => {
    render(<Spinner />);
    expect(screen.getByRole("status").getAttribute("class")).toContain(
      "animate-spin"
    );
  });

  it("applies custom className", () => {
    render(<Spinner className="mt-4" />);
    expect(screen.getByRole("status").getAttribute("class")).toContain("mt-4");
  });

  it("renders as SVG element", () => {
    render(<Spinner />);
    expect(screen.getByRole("status").tagName).toBe("svg");
  });
});
