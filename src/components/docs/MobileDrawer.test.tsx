import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocsMobileDrawer from "./MobileDrawer";

vi.mock("next/navigation", () => ({
  usePathname: () => "/docs/getting-started",
}));

describe("DocsMobileDrawer", () => {
  it("renders closed content out of the focus tree and restores focus", async () => {
    const user = userEvent.setup();
    render(<DocsMobileDrawer />);
    const trigger = screen.getByRole("button", {
      name: /open documentation menu/i,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
