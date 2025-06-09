
import React from 'react';
import DiceRoller from './DiceRoller.tsx';
import Timer from './Timer.tsx';
import ScoreCounter from './ScoreCounter.tsx';
import SpinnyWheel from './SpinnyWheel.tsx';
import RandomTeamGenerator from './RandomTeamGenerator.tsx'; // Added
import { GlobalToolsPanelProps } from '../../types.ts'; 

const GlobalToolsPanel: React.FC<GlobalToolsPanelProps> = ({
  isOpen,
  onClose,
  showDice,
  toggleDice,
  showTimer,
  toggleTimer,
  showScoreCounter,
  toggleScoreCounter,
  pulseDice,
  pulseTimer,
  pulseScore,
  showSpinnyWheel, 
  toggleSpinnyWheel, 
  pulseSpinnyWheel, 
  showRandomTeamGenerator, // Added
  toggleRandomTeamGenerator, // Added
  pulseRandomTeamGenerator, // Added
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 right-0 h-full w-80 bg-brandNeutral-50 text-brandTextPrimary shadow-2xl z-[80] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-brandNeutral-300"
      style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      role="complementary"
      aria-labelledby="global-tools-panel-title"
    >
      <div className="flex justify-between items-center p-4 border-b border-brandNeutral-300 bg-brandPrimary-600">
        <h2 id="global-tools-panel-title" className="text-xl font-semibold text-white">Tools</h2>
        <button 
          onClick={onClose} 
          className="text-brandPrimary-100 hover:text-white transition-colors p-1 rounded-full hover:bg-brandPrimary-700"
          aria-label="Close tools panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-brandPrimary-400 scrollbar-track-brandNeutral-200">
        <ToolToggle 
            label="Dice Roller" 
            emoji="🎲" 
            isActive={showDice} 
            onToggle={toggleDice}
            pulse={pulseDice} 
        />
        {showDice && <div className="p-3 bg-white rounded-md border border-brandNeutral-200 shadow"><DiceRoller /></div>}
        
        <ToolToggle 
            label="Timer" 
            emoji="⏱️" 
            isActive={showTimer} 
            onToggle={toggleTimer}
            pulse={pulseTimer} 
        />
        {showTimer && <div className="p-3 bg-white rounded-md border border-brandNeutral-200 shadow"><Timer initialMinutes={5} /></div>}

        <ToolToggle 
            label="Score Counter" 
            emoji="🏆" 
            isActive={showScoreCounter} 
            onToggle={toggleScoreCounter}
            pulse={pulseScore} 
        />
        {showScoreCounter && <div className="p-3 bg-white rounded-md border border-brandNeutral-200 shadow"><ScoreCounter /></div>}

        <ToolToggle 
            label="Spinny Wheel" 
            emoji="🎡"
            isActive={showSpinnyWheel} 
            onToggle={toggleSpinnyWheel}
            pulse={pulseSpinnyWheel || false} 
        />
        {showSpinnyWheel && <div className="p-1 bg-white rounded-md border border-brandNeutral-200 shadow h-96"><SpinnyWheel /></div>}

        <ToolToggle 
            label="Team Generator" 
            emoji="🧑‍🤝‍🧑" 
            isActive={showRandomTeamGenerator} 
            onToggle={toggleRandomTeamGenerator}
            pulse={pulseRandomTeamGenerator || false} 
        />
        {showRandomTeamGenerator && <div className="p-1 bg-white rounded-md border border-brandNeutral-200 shadow h-96"><RandomTeamGenerator /></div>}

      </div>
    </div>
  );
};

interface ToolToggleProps {
    label: string;
    emoji: string;
    isActive: boolean;
    onToggle: () => void;
    pulse: boolean;
}

const ToolToggle: React.FC<ToolToggleProps> = ({ label, emoji, isActive, onToggle, pulse }) => {
    return (
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between p-3 rounded-md text-left transition-all duration-150
            ${isActive ? 'bg-brandPrimary-500 hover:bg-brandPrimary-600 text-white' : 'bg-brandNeutral-200 hover:bg-brandNeutral-300 text-brandTextPrimary'}
            ${pulse ? 'animate-pulse-glow' : ''}
          `}
          aria-pressed={isActive}
          aria-label={`Toggle ${label}`}
        >
          <span className="flex items-center">
            <span className="text-2xl mr-3" role="img" aria-hidden="true">{emoji}</span>
            {label}
          </span>
          <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${isActive ? 'bg-brandPrimary-300' : 'bg-brandNeutral-400'}`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${isActive ? 'translate-x-5' : ''}`}></div>
          </div>
        </button>
    );
}

export default GlobalToolsPanel;