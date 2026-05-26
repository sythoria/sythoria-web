import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("renders with role=switch", () => {
    render(<Switch checked={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("reflects checked state via aria-checked", () => {
    const { rerender } = render(<Switch checked={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");

    rerender(<Switch checked={true} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange when clicked", async () => {
    const user = userEvent.setup();
    let value = false;
    render(<Switch checked={value} onChange={(v) => (value = v)} />);

    await user.click(screen.getByRole("switch"));
    expect(value).toBe(true);
  });

  it("calls onChange on Space key", async () => {
    const user = userEvent.setup();
    let value = false;
    render(<Switch checked={value} onChange={(v) => (value = v)} />);

    screen.getByRole("switch").focus();
    await user.keyboard(" ");
    expect(value).toBe(true);
  });

  it("calls onChange on Enter key", async () => {
    const user = userEvent.setup();
    let value = true;
    render(<Switch checked={value} onChange={(v) => (value = v)} />);

    screen.getByRole("switch").focus();
    await user.keyboard("{Enter}");
    expect(value).toBe(false);
  });

  it("renders label and description", () => {
    render(
      <Switch
        checked={false}
        onChange={() => {}}
        label="Dark mode"
        description="Toggle between light and dark"
      />
    );
    expect(screen.getByText("Dark mode")).toBeInTheDocument();
    expect(
      screen.getByText("Toggle between light and dark")
    ).toBeInTheDocument();
  });

  it("uses label as aria-label", () => {
    render(<Switch checked={false} onChange={() => {}} label="Test Label" />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "aria-label",
      "Test Label"
    );
  });
});
