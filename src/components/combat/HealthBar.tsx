import React from 'react';

interface HealthBarProps {
  currentHealth: number;
  maxHealth: number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
  color?: 'red' | 'green' | 'blue' | 'yellow';
}

/**
 * Health bar component for displaying entity health
 */
export const HealthBar: React.FC<HealthBarProps> = ({
  currentHealth,
  maxHealth,
  className = '',
  showText = true,
  animated = true,
  color = 'red'
}) => {
  // Ensure health values are valid
  const safeCurrentHealth = Math.max(0, Math.min(currentHealth, maxHealth));
  const safeMaxHealth = Math.max(1, maxHealth);
  const healthPercentage = (safeCurrentHealth / safeMaxHealth) * 100;

  // Determine health bar color based on percentage
  const getHealthColor = (): string => {
    if (color !== 'red') return color;
    
    if (healthPercentage > 60) return 'green';
    if (healthPercentage > 30) return 'yellow';
    return 'red';
  };

  const healthColor = getHealthColor();

  // CSS classes for styling
  const containerClasses = `health-bar-container ${className}`;
  const barClasses = `health-bar-fill ${animated ? 'animated' : ''} ${healthColor}`;

  return (
    <div className={containerClasses} style={containerStyle}>
      <div className="health-bar-background" style={backgroundStyle}>
        <div 
          className={barClasses} 
          style={{
            ...fillStyle,
            width: `${healthPercentage}%`,
            backgroundColor: getColorValue(healthColor),
            transition: animated ? 'width 0.3s ease-in-out' : 'none'
          }}
        />
        {showText && (
          <div className="health-bar-text" style={textStyle}>
            {Math.ceil(safeCurrentHealth)} / {safeMaxHealth}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get color values
const getColorValue = (color: string): string => {
  const colors = {
    red: '#ff4444',
    green: '#44ff44',
    blue: '#4444ff',
    yellow: '#ffff44'
  };
  return colors[color as keyof typeof colors] || colors.red;
};

// Inline styles for the component
const containerStyle: React.CSSProperties = {
  width: '100%',
  position: 'relative'
};

const backgroundStyle: React.CSSProperties = {
  width: '100%',
  height: '20px',
  backgroundColor: '#333',
  border: '1px solid #666',
  borderRadius: '10px',
  position: 'relative',
  overflow: 'hidden'
};

const fillStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: '10px',
  position: 'absolute',
  top: 0,
  left: 0,
  minWidth: '2px' // Ensure visibility even at very low health
};

const textStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  fontSize: '12px',
  fontWeight: 'bold',
  textShadow: '1px 1px 1px rgba(0,0,0,0.8)',
  pointerEvents: 'none',
  zIndex: 10
};

export default HealthBar;