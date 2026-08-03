import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  it("copies the rendered code and announces success", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    render(
      <CodeBlock>
        <code>npm run check</code>
      </CodeBlock>
    );

    await user.click(screen.getByRole("button", { name: "Copy code" }));

    expect(writeText).toHaveBeenCalledWith("npm run check");
    expect(
      screen.getByRole("button", { name: "Code copied" })
    ).toBeInTheDocument();
  });

  it("announces a clipboard failure", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("Denied")
    );
    render(
      <CodeBlock>
        <code>safe command</code>
      </CodeBlock>
    );

    await user.click(screen.getByRole("button", { name: "Copy code" }));

    expect(
      screen.getByRole("button", { name: "Copy failed" })
    ).toBeInTheDocument();
  });
});
