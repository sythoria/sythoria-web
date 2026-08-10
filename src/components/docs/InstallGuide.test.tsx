import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import InstallGuide from "./InstallGuide";
import { DESKTOP_DOWNLOAD_URLS } from "@/lib/site-config";

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
    const setupBtn = screen.getByText("View Windows download").closest("a");
    expect(setupBtn).toHaveAttribute("href", "/downloads");

    // Checks steps specific text
    expect(
      screen.getByText("Download the setup installer")
    ).toBeInTheDocument();
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
    const macBtn = screen.getByText("View macOS download").closest("a");
    expect(macBtn).toHaveAttribute("href", "/downloads");
    expect(screen.getByText("Download the disk image")).toBeInTheDocument();
  });

  it("defaults to Linux tab when user agent is Linux", () => {
    mockUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36");
    render(<InstallGuide />);
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Linux Desktop")).toBeInTheDocument();
    const linuxBtn = screen.getByText("Download install.sh").closest("a");
    expect(linuxBtn).toHaveAttribute("href", DESKTOP_DOWNLOAD_URLS.linuxScript);
    expect(screen.getByText("Inspect and run the script")).toBeInTheDocument();
    expect(
      screen.getByText(
        "curl -fsSLo install-sythoria.sh " + DESKTOP_DOWNLOAD_URLS.linuxScript
      )
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
    const macTabButton = screen.getByRole("tab", { name: /macos/i });
    fireEvent.click(macTabButton);

    expect(screen.getByText("macOS Desktop")).toBeInTheDocument();
    expect(screen.queryByText("Windows Desktop")).not.toBeInTheDocument();

    // Click Linux tab
    const linuxTabButton = screen.getByRole("tab", { name: /linux/i });
    fireEvent.click(linuxTabButton);

    expect(screen.getByText("Linux Desktop")).toBeInTheDocument();
    expect(screen.queryByText("macOS Desktop")).not.toBeInTheDocument();
  });

  it("copies command to clipboard when copy button is clicked on Linux tab", async () => {
    mockUserAgent("Mozilla/5.0 (X11; Linux x86_64)");
    render(<InstallGuide />);
    act(() => {
      vi.runAllTimers();
    });

    // Get copy button (universal installer command)
    const copyButtons = screen.getAllByTitle("Copy to clipboard");
    expect(copyButtons.length).toBe(1);

    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    expect(writeTextMock).toHaveBeenCalledWith(
      "curl -fsSLo install-sythoria.sh " + DESKTOP_DOWNLOAD_URLS.linuxScript
    );

    // Fast-forward fake timers to resolve clipboard states inside act block
    await act(async () => {
      vi.runAllTimers();
    });
  });
});
