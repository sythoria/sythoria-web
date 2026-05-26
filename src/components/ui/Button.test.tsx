import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  it("renders as a button by default", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders as an anchor when href is provided", () => {
    render(<Button href="/docs">Docs</Button>);
    const link = screen.getByRole("link", { name: /docs/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/docs");
  });

  it("applies primary variant classes by default", () => {
    const { container } = render(<Button>Primary</Button>);
    const btn = container.querySelector("button")!;
    expect(btn.className).toContain("btn-primary");
  });

  it("applies secondary variant classes", () => {
    const { container } = render(
      <Button variant="secondary">Secondary</Button>
    );
    const btn = container.querySelector("button")!;
    expect(btn.className).toContain("btn-secondary");
  });

  it("applies size classes", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const btn = container.querySelector("button")!;
    expect(btn.className).toContain("px-3.5");
  });

  it("applies fullWidth class", () => {
    const { container } = render(<Button fullWidth>Full</Button>);
    const btn = container.querySelector("button")!;
    expect(btn.className).toContain("w-full");
  });

  it("renders icon on the left", () => {
    render(<Button icon={<span data-testid="icon">I</span>}>With Icon</Button>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders iconRight on the right", () => {
    render(
      <Button iconRight={<span data-testid="icon-right">R</span>}>
        With Icon Right
      </Button>
    );
    expect(screen.getByTestId("icon-right")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(true);
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
