import React from 'react';

interface MapSystemProps {
  levels: string[];
  onLevelSelect: (level: string) => void;
  currentLevel: string;
}

const MapSystem: React.FC<MapSystemProps> = ({ levels, onLevelSelect, currentLevel }) => {
  return (
    <div className="map-system">
      <h2>Map</h2>
      <ul>
        {levels.map((level) => (
          <li key={level} className={level === currentLevel ? 'active' : ''}>
            <button onClick={() => onLevelSelect(level)}>{level}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MapSystem;
