import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import StreamingFlowDiagram from "./StreamingFlowDiagram";

describe("StreamingFlowDiagram", () => {
  it("renders all phase cards and nodes in static mode", () => {
    render(<StreamingFlowDiagram />);

    expect(
      screen.getAllByText("1. Request & Connection")[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("2. Streaming & Buffering")[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("3. Completion & Finalize")[0]
    ).toBeInTheDocument();

    // Verify indicators and static node circles exist
    expect(screen.getByTestId("phase-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("phase-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("phase-card-3")).toBeInTheDocument();

    expect(screen.getByTestId("phase-node-1")).toBeInTheDocument();
    expect(screen.getByTestId("phase-node-2")).toBeInTheDocument();
    expect(screen.getByTestId("phase-node-3")).toBeInTheDocument();
  });
});
