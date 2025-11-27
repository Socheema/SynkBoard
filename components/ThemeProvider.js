import { useEffect } from "react";
import { useThemeStore } from "@/lib/store/themeStore";

export function ThemeProvider({ children }) {
  const theme = useThemeStore((state) => state.theme);
  useEffect(() => {
    // update document class for dark theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
}
