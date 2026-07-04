import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import InstallGuide from "./InstallGuide";

describe("InstallGuide", () => {
  const originalUserAgent = navigator.userAgent;
  const writeTextMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock clipboard
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    // Reset userAgent mock
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

  it("defaults to Windows tab when user agent is Windows", () => {
    mockUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );
    render(<InstallGuide />);
    act(() => {
      vi.runAllTimers();
    });

    // Checks header
    expect(screen.getByText("Windows Desktop")).toBeInTheDocument();
    // Checks button text
    expect(screen.getByText("Download for Windows (.exe)")).toBeInTheDocument();
    // Checks steps specific text
    expect(screen.getByText("Download the executable")).toBeInTheDocument();
  });

  it("defaults to macOS tab when user agent is macOS", () => {
    mockUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    );
    render(<InstallGuide />);
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText("macOS Desktop")).toBeInTheDocument();
    expect(screen.getByText("Download for macOS (.dmg)")).toBeInTheDocument();
    expect(screen.getByText("Download the disk image")).toBeInTheDocument();
  });

  it("defaults to Linux tab when user agent is Linux", () => {
    mockUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36");
    render(<InstallGuide />);
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Linux Desktop")).toBeInTheDocument();
    expect(
      screen.getByText("Download for Linux (.AppImage)")
    ).toBeInTheDocument();
    expect(screen.getByText("Download the AppImage")).toBeInTheDocument();
    expect(
      screen.getByText("chmod +x Sythoria-*.AppImage")
    ).toBeInTheDocument();
  });

  it("switches tabs correctly on click", () => {
    mockUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    render(<InstallGuide />);
    act(() => {
      vi.runAllTimers();
    });

    // Starts on Windows
    expect(screen.getByText("Windows Desktop")).toBeInTheDocument();

    // Click macOS tab
    const macTabButton = screen.getByRole("button", { name: /macos/i });
    fireEvent.click(macTabButton);

    expect(screen.getByText("macOS Desktop")).toBeInTheDocument();
    expect(screen.queryByText("Windows Desktop")).not.toBeInTheDocument();

    // Click Linux tab
    const linuxTabButton = screen.getByRole("button", { name: /linux/i });
    fireEvent.click(linuxTabButton);

    expect(screen.getByText("Linux Desktop")).toBeInTheDocument();
    expect(screen.queryByText("macOS Desktop")).not.toBeInTheDocument();
  });

  it("copies commands to clipboard when copy button is clicked on Linux tab", async () => {
    mockUserAgent("Mozilla/5.0 (X11; Linux x86_64)");
    render(<InstallGuide />);
    act(() => {
      vi.runAllTimers();
    });

    // Get the first copy button (for chmod +x)
    const copyButtons = screen.getAllByTitle("Copy to clipboard");
    expect(copyButtons.length).toBe(2); // One for chmod, one for launch

    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    expect(writeTextMock).toHaveBeenCalledWith("chmod +x Sythoria-*.AppImage");

    await act(async () => {
      fireEvent.click(copyButtons[1]);
    });
    expect(writeTextMock).toHaveBeenCalledWith("./Sythoria-*.AppImage");

    // Fast-forward fake timers to resolve clipboard states inside act block
    await act(async () => {
      vi.runAllTimers();
    });
  });
});
