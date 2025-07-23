import React, { useState, useEffect } from 'react';
import { HealthBar } from './HealthBar';
import { 
  CombatState, 
  DamageType, 
  ActionType, 
  BattleEventType 
} from '../../types/combat';

interface CombatUIProps {
  combatState: CombatState;
  currentTurnEntity?: { id: string; name?: string } | null;
  playerHealth: number;
  playerMaxHealth: number;
  enemyHealth: number;
  enemyMaxHealth: number;
  statusEffects: Array<{ id: string; name: string; remainingTime: number; stacks?: number }>;
  onActionSelected?: (actionType: ActionType) => void;
  onTargetSelected?: (targetId: string) => void;
  className?: string;
}

interface DamageNumber {
  id: string;
  amount: number;
  type: DamageType;
  isCritical: boolean;
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Main combat UI component that displays health bars, status effects, and combat controls
 */
export const CombatUI: React.FC<CombatUIProps> = ({
  combatState,
  currentTurnEntity,
  playerHealth,
  playerMaxHealth,
  enemyHealth,
  enemyMaxHealth,
  statusEffects,
  onActionSelected,
  onTargetSelected,
  className = ''
}) => {
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  // Simulate damage numbers for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setDamageNumbers(prev => prev.filter(dn => Date.now() - dn.timestamp < 2000));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Handle action button clicks
  const handleActionClick = (actionType: ActionType) => {
    if (onActionSelected) {
      onActionSelected(actionType);
    }
    
    // Add to battle log
    setBattleLog(prev => [...prev.slice(-4), `Player uses ${actionType}`]);
  };

  // Add a damage number (for demonstration)
  const addDamageNumber = (amount: number, type: DamageType, isCritical: boolean = false) => {
    const newDamageNumber: DamageNumber = {
      id: Date.now().toString(),
      amount,
      type,
      isCritical,
      x: Math.random() * 200 + 100,
      y: Math.random() * 100 + 50,
      timestamp: Date.now()
    };
    
    setDamageNumbers(prev => [...prev, newDamageNumber]);
  };

  // Get combat state display text
  const getCombatStateText = (): string => {
    switch (combatState) {
      case CombatState.Idle:
        return 'No Combat';
      case CombatState.InCombat:
        return 'In Combat';
      case CombatState.PlayerTurn:
        return 'Your Turn';
      case CombatState.EnemyTurn:
        return 'Enemy Turn';
      case CombatState.Victory:
        return 'Victory!';
      case CombatState.Defeat:
        return 'Defeat!';
      case CombatState.Paused:
        return 'Paused';
      default:
        return 'Unknown';
    }
  };

  // Check if actions are available
  const actionsAvailable = combatState === CombatState.PlayerTurn || combatState === CombatState.InCombat;

  return (
    <div className={`combat-ui ${className}`} style={containerStyle}>
      {/* Combat State Header */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>Combat Status: {getCombatStateText()}</h3>
        {currentTurnEntity && (
          <p style={turnInfoStyle}>
            Current Turn: {currentTurnEntity.name || currentTurnEntity.id}
          </p>
        )}
      </div>

      {/* Health Bars Section */}
      <div style={healthSectionStyle}>
        <div style={healthRowStyle}>
          <label style={labelStyle}>Player Health:</label>
          <HealthBar
            currentHealth={playerHealth}
            maxHealth={playerMaxHealth}
            color="green"
            showText={true}
            animated={true}
          />
        </div>
        
        <div style={healthRowStyle}>
          <label style={labelStyle}>Enemy Health:</label>
          <HealthBar
            currentHealth={enemyHealth}
            maxHealth={enemyMaxHealth}
            color="red"
            showText={true}
            animated={true}
          />
        </div>
      </div>

      {/* Status Effects Section */}
      {statusEffects.length > 0 && (
        <div style={statusSectionStyle}>
          <h4 style={sectionTitleStyle}>Status Effects</h4>
          <div style={statusListStyle}>
            {statusEffects.map((effect, index) => (
              <div key={`${effect.id}-${index}`} style={statusEffectStyle}>
                <span style={statusNameStyle}>{effect.name}</span>
                {effect.stacks && effect.stacks > 1 && (
                  <span style={stacksStyle}>x{effect.stacks}</span>
                )}
                <span style={timeStyle}>{effect.remainingTime.toFixed(1)}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons Section */}
      <div style={actionSectionStyle}>
        <h4 style={sectionTitleStyle}>Actions</h4>
        <div style={actionButtonsStyle}>
          <button
            onClick={() => handleActionClick(ActionType.Attack)}
            disabled={!actionsAvailable}
            style={getButtonStyle(actionsAvailable)}
          >
            Attack
          </button>
          <button
            onClick={() => handleActionClick(ActionType.Defend)}
            disabled={!actionsAvailable}
            style={getButtonStyle(actionsAvailable)}
          >
            Defend
          </button>
          <button
            onClick={() => handleActionClick(ActionType.Skill)}
            disabled={!actionsAvailable}
            style={getButtonStyle(actionsAvailable)}
          >
            Use Skill
          </button>
          <button
            onClick={() => handleActionClick(ActionType.Wait)}
            disabled={!actionsAvailable}
            style={getButtonStyle(actionsAvailable)}
          >
            Wait
          </button>
        </div>
      </div>

      {/* Battle Log Section */}
      <div style={logSectionStyle}>
        <h4 style={sectionTitleStyle}>Battle Log</h4>
        <div style={logContainerStyle}>
          {battleLog.map((entry, index) => (
            <div key={index} style={logEntryStyle}>
              {entry}
            </div>
          ))}
        </div>
      </div>

      {/* Damage Numbers Overlay */}
      <div style={damageOverlayStyle}>
        {damageNumbers.map((damage) => (
          <div
            key={damage.id}
            style={{
              ...damageNumberStyle,
              left: damage.x,
              top: damage.y,
              color: getDamageColor(damage.type, damage.isCritical),
              fontSize: damage.isCritical ? '20px' : '16px',
              animation: 'damageFloat 2s ease-out forwards'
            }}
          >
            {damage.isCritical && 'CRIT! '}
            {damage.amount}
          </div>
        ))}
      </div>

      {/* Demo button to show damage numbers */}
      <button
        onClick={() => addDamageNumber(Math.floor(Math.random() * 50) + 10, DamageType.Physical, Math.random() < 0.2)}
        style={demoButtonStyle}
      >
        Demo Damage
      </button>
    </div>
  );
};

// Helper function to get damage number color
const getDamageColor = (type: DamageType, isCritical: boolean): string => {
  if (isCritical) return '#ff6600';
  
  switch (type) {
    case DamageType.Physical:
      return '#ffffff';
    case DamageType.Magical:
      return '#6666ff';
    case DamageType.Fire:
      return '#ff4444';
    case DamageType.Ice:
      return '#4444ff';
    case DamageType.Lightning:
      return '#ffff44';
    case DamageType.Poison:
      return '#44ff44';
    case DamageType.Healing:
      return '#00ff00';
    default:
      return '#ffffff';
  }
};

// Helper function to get button style
const getButtonStyle = (enabled: boolean): React.CSSProperties => ({
  ...baseButtonStyle,
  backgroundColor: enabled ? '#007bff' : '#666',
  cursor: enabled ? 'pointer' : 'not-allowed',
  opacity: enabled ? 1 : 0.6
});

// Styles
const containerStyle: React.CSSProperties = {
  backgroundColor: '#2a2a2a',
  color: 'white',
  padding: '20px',
  borderRadius: '8px',
  fontFamily: 'Arial, sans-serif',
  minWidth: '400px',
  position: 'relative'
};

const headerStyle: React.CSSProperties = {
  marginBottom: '20px',
  textAlign: 'center'
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 10px 0',
  color: '#fff'
};

const turnInfoStyle: React.CSSProperties = {
  margin: '0',
  color: '#ccc',
  fontSize: '14px'
};

const healthSectionStyle: React.CSSProperties = {
  marginBottom: '20px'
};

const healthRowStyle: React.CSSProperties = {
  marginBottom: '10px'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '5px',
  fontSize: '14px',
  fontWeight: 'bold'
};

const statusSectionStyle: React.CSSProperties = {
  marginBottom: '20px'
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 10px 0',
  fontSize: '16px',
  color: '#fff'
};

const statusListStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px'
};

const statusEffectStyle: React.CSSProperties = {
  backgroundColor: '#444',
  padding: '5px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '5px'
};

const statusNameStyle: React.CSSProperties = {
  fontWeight: 'bold'
};

const stacksStyle: React.CSSProperties = {
  color: '#ffa500'
};

const timeStyle: React.CSSProperties = {
  color: '#ccc'
};

const actionSectionStyle: React.CSSProperties = {
  marginBottom: '20px'
};

const actionButtonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap'
};

const baseButtonStyle: React.CSSProperties = {
  padding: '10px 15px',
  border: 'none',
  borderRadius: '4px',
  color: 'white',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'background-color 0.2s'
};

const logSectionStyle: React.CSSProperties = {
  marginBottom: '20px'
};

const logContainerStyle: React.CSSProperties = {
  backgroundColor: '#333',
  padding: '10px',
  borderRadius: '4px',
  maxHeight: '100px',
  overflowY: 'auto'
};

const logEntryStyle: React.CSSProperties = {
  fontSize: '12px',
  marginBottom: '2px',
  color: '#ccc'
};

const damageOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  overflow: 'hidden'
};

const damageNumberStyle: React.CSSProperties = {
  position: 'absolute',
  fontWeight: 'bold',
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
  pointerEvents: 'none',
  zIndex: 1000
};

const demoButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#28a745',
  position: 'absolute',
  bottom: '10px',
  right: '10px',
  fontSize: '12px',
  padding: '5px 10px'
};

export default CombatUI;