import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Hardcode to dark as requested
  const theme = 'dark';

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    root.classList.add('dark');
    body.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
