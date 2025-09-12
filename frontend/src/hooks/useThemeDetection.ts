import { useState, useEffect } from 'react';

export const useThemeDetection = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark'
  );
  
  useEffect(() => {
    const checkTheme = () => {
      const darkMode = document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark';
      setIsDark(darkMode);
    };
    
    checkTheme();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-mantine-color-scheme') {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mantine-color-scheme']
    });
    
    return () => observer.disconnect();
  }, []);
  
  return isDark;
};
