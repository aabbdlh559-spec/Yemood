import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { YemoodMark, YemoodWordmark } from "./brand";

afterEach(cleanup);

describe("YemoodMark", () => {
  it("draws a decorative square logo at the requested size", () => {
    const { container } = render(<YemoodMark size={40} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("40");
    expect(svg?.getAttribute("height")).toBe("40");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("gives every logo its own gradient id", () => {
    const { container } = render(
      <>
        <YemoodMark />
        <YemoodMark />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("YemoodWordmark", () => {
  it("shows the name next to a logo about as tall as the text", () => {
    const { container } = render(<YemoodWordmark fontSize={56} />);
    expect(screen.getByText("Yemood")).toBeTruthy();
    expect(container.querySelector("svg")?.getAttribute("width")).toBe("60");
  });
});
