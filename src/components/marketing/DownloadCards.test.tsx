import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import DownloadCards from "./DownloadCards";

describe("DownloadCards", () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  function mockUserAgent(ua: string) {
    Object.defineProperty(navigator, "userAgent", {
      value: ua,
      configurable: true,
    });
  }

  const defaultProps = {
    defaultWinSetupUrl: "https://example.com/win-setup.exe",
    defaultMacUrl: "https://example.com/mac.dmg",
    windowsSetupSize: 12000000,
    macDmgSize: 14000000,
  };

  it("detects Windows OS and highlights Windows card with 'Your OS' badge", () => {
    mockUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    render(<DownloadCards {...defaultProps} />);
    act(() => {
      vi.runAllTimers();
    });

    const yourOsBadge = screen.getByText("Your OS");
    expect(yourOsBadge).toBeInTheDocument();

    const winHeading = screen.getByText("Windows (x64)");
    expect(winHeading).toBeInTheDocument();
  });

  it("detects macOS and highlights macOS card with 'Your OS' badge", () => {
    mockUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    render(<DownloadCards {...defaultProps} />);
    act(() => {
      vi.runAllTimers();
    });

    const yourOsBadge = screen.getByText("Your OS");
    expect(yourOsBadge).toBeInTheDocument();

    const macHeading = screen.getByText("macOS (Apple Silicon)");
    expect(macHeading).toBeInTheDocument();
  });

  it("detects Linux OS and highlights Linux card with 'Your OS' badge", () => {
    mockUserAgent("Mozilla/5.0 (X11; Linux x86_64)");
    render(<DownloadCards {...defaultProps} />);
    act(() => {
      vi.runAllTimers();
    });

    const yourOsBadge = screen.getByText("Your OS");
    expect(yourOsBadge).toBeInTheDocument();

    const linuxHeading = screen.getByText("Linux Desktop");
    expect(linuxHeading).toBeInTheDocument();
  });
});
