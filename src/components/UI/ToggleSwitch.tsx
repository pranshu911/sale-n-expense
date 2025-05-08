import React from 'react';
import './ToggleSwitch.css';
import { useTheme } from '../../context/ThemeContext';

const ToggleSwitch: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="toggle-switch-container">
      <span className="toggle-icon light-icon">☀️</span>
      <label className="toggle-switch">
        <input 
          type="checkbox" 
          checked={darkMode} 
          onChange={toggleDarkMode}
          aria-label="Toggle dark mode"
        />
        <span className="slider round"></span>
      </label>
      <span className="toggle-icon dark-icon">🌙</span>
    </div>
  );
};

export default ToggleSwitch;
