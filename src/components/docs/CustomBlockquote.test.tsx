import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import CustomBlockquote from "./CustomBlockquote";

describe("CustomBlockquote", () => {
  it("renders a normal blockquote when no alert marker is present", () => {
    render(
      <CustomBlockquote>
        <p>This is a normal blockquote with some text.</p>
      </CustomBlockquote>
    );

    const blockquote = screen.getByRole("blockquote");
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toHaveTextContent(
      "This is a normal blockquote with some text."
    );
    expect(screen.queryByTestId(/alert-/)).not.toBeInTheDocument();
  });

  it("detects and renders a NOTE alert block", () => {
    render(
      <CustomBlockquote>
        <p>[!NOTE] This is a note alert.</p>
      </CustomBlockquote>
    );

    expect(screen.queryByRole("blockquote")).not.toBeInTheDocument();
    const alert = screen.getByTestId("alert-note");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Note");
    expect(alert).toHaveTextContent("This is a note alert.");
  });

  it("detects and renders a TIP alert block", () => {
    render(
      <CustomBlockquote>
        <p>[!TIP] This is a tip alert.</p>
      </CustomBlockquote>
    );

    const alert = screen.getByTestId("alert-tip");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Tip");
    expect(alert).toHaveTextContent("This is a tip alert.");
  });

  it("detects and renders an IMPORTANT alert block", () => {
    render(
      <CustomBlockquote>
        <p>[!IMPORTANT] This is important information.</p>
      </CustomBlockquote>
    );

    const alert = screen.getByTestId("alert-important");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Important");
    expect(alert).toHaveTextContent("This is important information.");
  });

  it("detects and renders a WARNING alert block", () => {
    render(
      <CustomBlockquote>
        <p>[!WARNING] This is a warning alert.</p>
      </CustomBlockquote>
    );

    const alert = screen.getByTestId("alert-warning");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Warning");
    expect(alert).toHaveTextContent("This is a warning alert.");
  });

  it("detects and renders a CAUTION alert block", () => {
    render(
      <CustomBlockquote>
        <p>[!CAUTION] This is a caution alert.</p>
      </CustomBlockquote>
    );

    const alert = screen.getByTestId("alert-caution");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Caution");
    expect(alert).toHaveTextContent("This is a caution alert.");
  });

  it("handles case insensitivity for alert markers", () => {
    render(
      <CustomBlockquote>
        <p>[!tip] This is a lowercase tip alert.</p>
      </CustomBlockquote>
    );

    const alert = screen.getByTestId("alert-tip");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("This is a lowercase tip alert.");
  });

  it("handles alert blocks with formatted/nested text children", () => {
    render(
      <CustomBlockquote>
        <p>
          [!IMPORTANT]
          <br />
          <strong>Linux Users</strong>: Ensure you have a keyring manager.
        </p>
      </CustomBlockquote>
    );

    const alert = screen.getByTestId("alert-important");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      "Linux Users: Ensure you have a keyring manager."
    );
    expect(screen.getByText("Linux Users").tagName).toBe("STRONG");
  });

  it("handles alert blocks split across multiple paragraphs", () => {
    render(
      <CustomBlockquote>
        <p>[!NOTE]</p>
        <p>This is the first paragraph of the note.</p>
        <p>This is the second paragraph of the note.</p>
      </CustomBlockquote>
    );

    const alert = screen.getByTestId("alert-note");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("This is the first paragraph of the note.");
    expect(alert).toHaveTextContent(
      "This is the second paragraph of the note."
    );
    // Verify that the empty/cleaned first paragraph is dropped/not rendering empty node
    const paragraphs = alert.querySelectorAll("p");
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0]).toHaveTextContent(
      "This is the first paragraph of the note."
    );
    expect(paragraphs[1]).toHaveTextContent(
      "This is the second paragraph of the note."
    );
  });

  it("handles leading whitespace and newlines inside the children list", () => {
    render(
      <CustomBlockquote>
        {"\n"}
        <p>[!IMPORTANT] Linux Users: Ensure you have a keyring manager.</p>
        {"\n"}
      </CustomBlockquote>
    );

    const alert = screen.getByTestId("alert-important");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      "Linux Users: Ensure you have a keyring manager."
    );
  });

  it("handles standard markdown **Tip**: bold colon syntax", () => {
    render(
      <CustomBlockquote>
        <p>
          <strong>Tip</strong>: Use quantized models for better performance.
        </p>
      </CustomBlockquote>
    );

    const alert = screen.getByTestId("alert-tip");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      "Use quantized models for better performance."
    );
  });

  it("handles standard markdown **Note:** inline colon syntax", () => {
    render(
      <CustomBlockquote>
        <p>
          <strong>Note:</strong> This is a note with colon inside strong tag.
        </p>
      </CustomBlockquote>
    );

    const alert = screen.getByTestId("alert-note");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      "This is a note with colon inside strong tag."
    );
  });
});
