import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('campusiq-theme');
    return saved ? saved === 'dark' : true; // default: dark
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';

    // Apply to <html> for CSS [data-theme] selectors
    document.documentElement.setAttribute('data-theme', theme);

    // Also apply class to <body> for additional overrides
    document.body.setAttribute('data-theme', theme);
    document.body.classList.toggle('theme-light', !isDark);
    document.body.classList.toggle('theme-dark', isDark);

    localStorage.setItem('campusiq-theme', theme);
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);