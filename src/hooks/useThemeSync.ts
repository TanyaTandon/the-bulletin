
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const useThemeSync = (cssVariable: string): string => {
  const { theme } = useTheme();
  const [color, setColor] = useState("#000000");
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const computedStyle = getComputedStyle(document.documentElement);
      const value = computedStyle.getPropertyValue(cssVariable);
      setColor(value || (theme === 'dark' ? '#ffffff' : '#000000'));
    }
  }, [cssVariable, theme]);

  return color;
};

export default useThemeSync;
