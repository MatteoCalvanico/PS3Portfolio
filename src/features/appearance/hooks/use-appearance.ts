import { useCallback, useState } from "react";
import { readBackgroundTheme, saveBackgroundTheme } from "../background-themes";
import type { BackgroundSelection } from "../background-themes";
import { readIconStyle, saveIconStyle } from "../icons/icon-styles";
import type { IconStyleId } from "../icons/icon-styles";

export function useAppearance() {
  const [background, setBackground] = useState(readBackgroundTheme);
  const [iconStyle, setIconStyle] = useState(readIconStyle);

  const onBackgroundChange = useCallback((selection: BackgroundSelection) => {
    setBackground(selection);
    saveBackgroundTheme(selection);
  }, []);

  const onIconStyleChange = useCallback((style: IconStyleId) => {
    setIconStyle(style);
    saveIconStyle(style);
  }, []);

  return { background, iconStyle, onBackgroundChange, onIconStyleChange };
}
