import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies glass variant by default", () => {
    const { container } = render(<Card>Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("glass-panel");
  });

  it("applies solid variant classes", () => {
    const { container } = render(<Card variant="solid">Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("bg-surface");
  });

  it("applies outline variant classes", () => {
    const { container } = render(<Card variant="outline">Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("bg-transparent");
  });

  it("applies elevated variant classes", () => {
    const { container } = render(<Card variant="elevated">Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("shadow-lg");
  });

  it("applies padding classes", () => {
    const { container } = render(<Card padding="lg">Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("p-8");
  });

  it("applies none padding", () => {
    const { container } = render(<Card padding="none">Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain("p-4");
    expect(card.className).not.toContain("p-6");
    expect(card.className).not.toContain("p-8");
  });

  it("applies hover class when hover is true", () => {
    const { container } = render(<Card hover>Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("card-hover");
  });

  it("applies glow class when glow is true", () => {
    const { container } = render(<Card glow>Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("card-glow");
  });

  it("applies custom className", () => {
    const { container } = render(<Card className="my-custom">Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("my-custom");
  });
});
