
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const useThemeSync = (cssVariable: string): string => {
  const { theme } = useTheme();
  const [color, setColor] = useState<string>("#000000");

  useEffect(() => {
    // Get the CSS variable value
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVariable)
      .trim();
    setColor(value || "#000000");
  }, [cssVariable, theme]);

  return color;
};

export default useThemeSync;
