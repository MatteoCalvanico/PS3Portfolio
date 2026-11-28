import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TouchControls from "./touch-controls";

describe("TouchControls", () => {
  it("renders D-pad controls with accessible names and Open action at root level", () => {
    const html = renderToStaticMarkup(
      <TouchControls
        categoryIndex={0}
        categoryCount={7}
        selectedIndex={0}
        itemCount={5}
        inFolder={false}
        onNavigate={() => {}}
      />,
    );

    expect(html).toContain('aria-label="Previous item"');
    expect(html).toContain('aria-label="Next item"');
    expect(html).toContain('aria-label="Previous category"');
    expect(html).toContain('aria-label="Next category"');
    expect(html).toContain("Open");
    expect(html).not.toContain("touch-back");
  });

  it("renders an explicit Back button alongside Open when inside a folder", () => {
    const html = renderToStaticMarkup(
      <TouchControls
        categoryIndex={2}
        categoryCount={7}
        selectedIndex={0}
        itemCount={1}
        inFolder={true}
        onNavigate={() => {}}
      />,
    );

    expect(html).toContain('aria-label="Back to parent folder"');
    expect(html).toContain('aria-label="Open selected item"');
    expect(html).toContain("touch-back");
    expect(html).toContain("Back");
  });
});
