import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocsSearch from "./Search";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("DocsSearch", () => {
  it("opens as a modal dialog, handles Escape, and returns focus", async () => {
    const user = userEvent.setup();
    render(<DocsSearch variant="full" />);
    const trigger = screen.getByRole("button", { name: /search docs/i });
    await user.click(trigger);

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("combobox")).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("supports arrow-key result selection and Enter", async () => {
    const user = userEvent.setup();
    render(<DocsSearch variant="full" />);
    await user.click(screen.getByRole("button", { name: /search docs/i }));
    const input = screen.getByRole("combobox");
    await user.type(input, "privacy");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(push).toHaveBeenCalledWith("/docs/privacy");
  });
});
