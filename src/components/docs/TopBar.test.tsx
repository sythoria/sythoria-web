import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DocsTopBar from "./TopBar";

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

describe("DocsTopBar", () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(true);
  });

  it("renders the Sythoria Docs logo link", () => {
    render(<DocsTopBar />);
    const logo = screen.getByText("Sythoria Docs");
    expect(logo).toBeInTheDocument();
    expect(logo.closest("a")).toHaveAttribute("href", "/docs");
  });

  it("renders the Home link", () => {
    render(<DocsTopBar />);
    const homeLink = screen.getByText("Home");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders the Download link", () => {
    render(<DocsTopBar />);
    const downloadLink = screen.getByText("Download");
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/sythoria/sythoria-desktop/releases/latest"
    );
  });

  it("renders the theme toggle button", () => {
    render(<DocsTopBar />);
    const themeBtn = screen.getByRole("button", {
      name: /switch to light mode|switch to dark mode/i,
    });
    expect(themeBtn).toBeInTheDocument();
  });

  it("renders the search docs button", () => {
    render(<DocsTopBar />);
    const searchBtns = screen.getAllByRole("button", { name: /search docs/i });
    expect(searchBtns.length).toBeGreaterThan(0);
  });

  it("renders the Changelog link", () => {
    render(<DocsTopBar />);
    const changelogLink = screen.getByText("Changelog");
    expect(changelogLink).toBeInTheDocument();
    expect(changelogLink.closest("a")).toHaveAttribute("href", "/changelog");
  });
});
