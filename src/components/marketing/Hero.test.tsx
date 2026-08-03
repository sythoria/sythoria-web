import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "./Hero";

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

describe("Hero", () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(true);
    // Mock HTMLMediaElement play and load methods
    window.HTMLMediaElement.prototype.load = vi.fn();
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.play = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
  });

  it("renders headline and zero telemetry badge", () => {
    render(<Hero latestVersion="v1.2.0" />);
    expect(screen.getByText(/Zero Telemetry/i)).toBeInTheDocument();
    expect(screen.getByText("The private")).toBeInTheDocument();
    expect(screen.getByText("interface")).toBeInTheDocument();
  });

  it("renders download button with formatted version string", () => {
    render(<Hero latestVersion="v1.2.0" />);
    const downloadBtn = screen.getByText(/Download Desktop v1\.2\.0/i);
    expect(downloadBtn).toBeInTheDocument();
    expect(downloadBtn.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/sythoria/sythoria-desktop/releases/latest"
    );
  });

  it("renders download button without version when latestVersion is null", () => {
    render(<Hero latestVersion={null} />);
    const downloadBtn = screen.getByText(/Download Desktop/i);
    expect(downloadBtn).toBeInTheDocument();
  });

  it("renders video element with autoPlay and playsInline attributes", () => {
    const { container } = render(<Hero latestVersion="1.2.0" />);
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveClass(
      "w-[calc(100%+2rem)]",
      "object-right",
      "sm:w-full",
      "sm:object-center"
    );
    expect(screen.getByTestId("demo-video-viewport")).toHaveClass(
      "aspect-[4/3]",
      "sm:aspect-video",
      "!min-h-0"
    );
  });
});
