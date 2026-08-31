import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NotFound from "./not-found";

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/some-unknown-route",
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

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

describe("NotFound Page", () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(true);
    vi.clearAllMocks();
  });

  it("renders 404 status pill and big 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByText("Error 404")).toBeInTheDocument();
    expect(screen.getByText("Route Not Found")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /404/i })
    ).toBeInTheDocument();
  });

  it("renders big custom 404 display with Sythoria gradient colors", () => {
    render(<NotFound />);
    const bigNumber = screen.getByText("404", {
      selector: ".not-found-number",
    });
    expect(bigNumber).toBeInTheDocument();
    expect(bigNumber).toHaveClass("not-found-number");
  });

  it("provides Return Home and Go Back action buttons", () => {
    render(<NotFound />);
    const homeBtn = screen.getByRole("link", { name: /return home/i });
    expect(homeBtn).toHaveAttribute("href", "/");

    const backBtn = screen.getByRole("button", { name: /go back/i });
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("renders recommended rescue destinations", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /recommended destinations/i,
      })
    ).toBeInTheDocument();

    const downloadLink = screen.getByRole("link", {
      name: /download desktop client/i,
    });
    expect(downloadLink).toHaveAttribute("href", "/downloads");

    const docsLink = screen.getByRole("link", {
      name: /documentation & quickstart/i,
    });
    expect(docsLink).toHaveAttribute("href", "/docs");

    const changelogLink = screen.getByRole("link", {
      name: /releases & changelog/i,
    });
    expect(changelogLink).toHaveAttribute("href", "/changelog");
  });

  it("includes skip-to-content target landmark", () => {
    const { container } = render(<NotFound />);
    const mainLandmark = container.querySelector("main#main-content");
    expect(mainLandmark).toBeInTheDocument();
  });
});
