import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "./Navbar";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe("Navbar", () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(true);
  });

  it("renders the Sythoria logo link", () => {
    render(<Navbar />);
    const logo = screen.getByText("Sythoria");
    expect(logo).toBeInTheDocument();
    expect(logo.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders the Docs link", () => {
    render(<Navbar />);
    const docsLinks = screen.getAllByText("Docs");
    expect(docsLinks.length).toBeGreaterThan(0);
    expect(docsLinks[0].closest("a")).toHaveAttribute("href", "/docs");
  });

  it("renders the Download button", () => {
    render(<Navbar />);
    const buttons = screen.getAllByText("Download");
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons[0]).toBeInTheDocument();
  });

  it("renders the theme toggle button", () => {
    render(<Navbar />);
    const themeBtn = screen.getByRole("button", {
      name: /switch to light mode|switch to dark mode/i,
    });
    expect(themeBtn).toBeInTheDocument();
  });

  it("renders the search docs button", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("button", { name: /search docs/i })
    ).toBeInTheDocument();
  });

  it("renders the Changelog link", () => {
    render(<Navbar />);
    const changelogLinks = screen.getAllByText("Changelog");
    expect(changelogLinks.length).toBeGreaterThan(0);
    expect(changelogLinks[0].closest("a")).toHaveAttribute(
      "href",
      "/changelog"
    );
  });
});
