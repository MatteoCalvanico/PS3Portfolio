import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  readBackgroundTheme,
  resolveBackground,
  saveBackgroundTheme,
} from "./background-themes";
import { readIconStyle, saveIconStyle } from "./icons/icon-styles";
import { IconStyleProvider, XmbCategoryIcon, XmbItemIcon } from "./icons/icons";
import AppearanceOptions from "./components/appearance-options";

const backgroundKey = "ps3-portfolio:background-theme:v2";
const legacyKey = "ps3-portfolio:background-theme:v1";
const iconKey = "ps3-portfolio:icon-style:v1";
let values: Map<string, string>;

beforeEach(() => {
  values = new Map();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("appearance preferences", () => {
  it("defaults to classic blue Wave and XMB icons", () => {
    expect(readBackgroundTheme()).toEqual({
      themeId: "wave",
      variantId: "blue",
    });
    expect(readIconStyle()).toBe("xmb");
  });

  it.each(["blue", "purple", "green", "amber", "rose", "graphite"])(
    "preserves the legacy %s color preference",
    (color) => {
      values.set(legacyKey, color);
      expect(readBackgroundTheme()).toEqual({
        themeId: "wave",
        variantId: color,
      });
    },
  );

  it("restores a new theme instead of the previous legacy color", () => {
    values.set(legacyKey, "rose");
    saveBackgroundTheme({ themeId: "aurora", variantId: "original" });
    expect(readBackgroundTheme()).toEqual({
      themeId: "aurora",
      variantId: "original",
    });
  });

  it("persists background and icons independently", () => {
    saveBackgroundTheme({ themeId: "wave", variantId: "purple" });
    const savedBackground = values.get(backgroundKey);
    saveIconStyle("outline");
    expect(values.get(backgroundKey)).toBe(savedBackground);
    saveBackgroundTheme({ themeId: "aurora", variantId: "original" });
    expect(readIconStyle()).toBe("outline");
    expect(readBackgroundTheme().themeId).toBe("aurora");
  });

  it.each([
    "{broken",
    "null",
    "[]",
    '{"themeId":42}',
    '{"themeId":"removed","variantId":"removed"}',
  ])("recovers from invalid or obsolete saved data: %s", (value) => {
    values.set(backgroundKey, value);
    values.set(iconKey, "removed");
    expect(readBackgroundTheme()).toEqual({
      themeId: "wave",
      variantId: "blue",
    });
    expect(readIconStyle()).toBe("xmb");
  });

  it("uses the theme's own default for an unavailable variant", () => {
    values.set(
      backgroundKey,
      JSON.stringify({ themeId: "aurora", variantId: "purple" }),
    );
    const selection = readBackgroundTheme();
    expect(selection).toEqual({ themeId: "aurora", variantId: "original" });
    expect(resolveBackground(selection).variant.filter).toBe("none");
  });

  it("keeps the page usable when accessing localStorage throws", () => {
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("Storage blocked");
      },
    });
    expect(readBackgroundTheme().themeId).toBe("wave");
    expect(readIconStyle()).toBe("xmb");
    expect(() =>
      saveBackgroundTheme({ themeId: "aurora", variantId: "original" }),
    ).not.toThrow();
    expect(() => saveIconStyle("outline")).not.toThrow();
  });
});

describe("appearance rendering", () => {
  it("switches category and folder symbols to SVG while keeping technology artwork", () => {
    const renderIcons = () => (
      <>
        <XmbCategoryIcon category="projects" />
        <XmbItemIcon name="folder" />
        <XmbItemIcon name="brand:react" />
      </>
    );
    const classic = renderToStaticMarkup(
      <IconStyleProvider style="xmb">{renderIcons()}</IconStyleProvider>,
    );
    const outline = renderToStaticMarkup(
      <IconStyleProvider style="outline">{renderIcons()}</IconStyleProvider>,
    );
    expect(classic).toContain("icon_game.png");
    expect(classic).toContain("icon_photo_album_default.png");
    expect(outline.match(/<svg/g)).toHaveLength(2);
    expect(outline).not.toContain("icon_game.png");
    expect(outline).toContain("technology/react.svg");
  });

  it("shows only the selected theme's variants and keeps the icon chooser available", () => {
    const html = renderToStaticMarkup(
      <AppearanceOptions
        background={{ themeId: "aurora", variantId: "original" }}
        onBackgroundChange={() => {}}
        iconStyle="outline"
        onIconStyleChange={() => {}}
      />,
    );
    expect(html).toContain('name="background-theme"');
    expect(html).not.toContain('name="background-variant"');
    expect(html).toContain('name="icon-style"');
    const checkedInputs = html.match(/<input\b[^>]*checked=""[^>]*>/g) ?? [];
    expect(checkedInputs).toHaveLength(2);
    expect(
      checkedInputs.some((input) => input.includes('value="aurora"')),
    ).toBe(true);
    expect(
      checkedInputs.some((input) => input.includes('value="outline"')),
    ).toBe(true);
  });
});
