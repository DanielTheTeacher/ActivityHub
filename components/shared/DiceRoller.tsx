
import React, { useState } from 'react';

const diceFaces: string[] = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']; // 1 to 6

const DiceRoller: React.FC = () => {
  const [currentFace, setCurrentFace] = useState<number>(1); // Start with 1
  const [isRolling, setIsRolling] = useState<boolean>(false);

  const rollDie = () => {
    setIsRolling(true);
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setCurrentFace(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 5) { 
        clearInterval(rollInterval);
        const finalResult = Math.floor(Math.random() * 6) + 1;
        setCurrentFace(finalResult);
        setIsRolling(false);
      }
    }, 75);
  };

  return (
    <div className="flex flex-col items-center space-y-3 p-3 rounded-lg w-full">
      <div 
        className={`text-6xl p-3 border-2 border-brandNeutral-300 rounded-lg shadow-inner bg-brandNeutral-100 text-brandTextPrimary transition-transform duration-100 ${isRolling ? 'animate-pulse' : ''}`}
        aria-live="polite"
        aria-label={`Dice shows ${currentFace}`}
      >
        {diceFaces[currentFace - 1]}
      </div>
      <button
        onClick={rollDie}
        disabled={isRolling}
        className="px-5 py-1.5 bg-brandAccent-500 text-white text-sm font-semibold rounded-md hover:bg-brandAccent-600 focus:outline-none focus:ring-2 focus:ring-brandAccent-500 focus:ring-opacity-75 transition-colors disabled:bg-brandNeutral-300 disabled:text-brandNeutral-500 w-full"
      >
        {isRolling ? 'Rolling...' : 'Roll Die'}
      </button>
    </div>
  );
};

export default DiceRoller;