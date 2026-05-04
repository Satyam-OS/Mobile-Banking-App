import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: { bg: "#FFF", text: "#1E293B", card: "#F8FAFC", primary: "#0EA5E9" }
});

export const ThemeProvider = ({ children }: any) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Define your two themes here
  const colors = {
    primary: "#0EA5E9", // Your signature Sky Blue stays the same
    bg: isDarkMode ? "#0F172A" : "#FFF",
    text: isDarkMode ? "#F8FAFC" : "#1E293B",
    card: isDarkMode ? "#1E293B" : "#F8FAFC",
    border: isDarkMode ? "#334155" : "#E2E8F0",
    header: isDarkMode ? "#1E293B" : "#0EA5E9",
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);