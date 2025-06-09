
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TimerProps {
  initialMinutes?: number;
}

const Timer: React.FC<TimerProps> = ({ initialMinutes = 5 }) => {
  const [minutes, setMinutes] = useState<number>(initialMinutes);
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(initialMinutes * 60); 

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setMinutes(initialMinutes);
    setSeconds(0);
    setDuration(initialMinutes * 60);
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [initialMinutes]);

  const startTimer = useCallback(() => {
    if (duration <= 0 && !(minutes === 0 && seconds === 0)) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setIsActive(true);
    intervalRef.current = window.setInterval(() => {
      setDuration((prevDuration) => {
        if (prevDuration <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsActive(false);
          return 0;
        }
        return prevDuration - 1;
      });
    }, 1000);
  }, [duration, minutes, seconds]);


  useEffect(() => {
    setMinutes(Math.floor(duration / 60));
    setSeconds(duration % 60);
  }, [duration]);

  const handleStartPause = () => {
    if (isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
    } else {
        const currentTotalSeconds = minutes * 60 + seconds;
        if (currentTotalSeconds === 0) { 
             const resetDuration = (initialMinutes > 0 ? initialMinutes : 5) * 60; 
             setDuration(resetDuration); 
             setTimeout(() => startTimer(), 0); 
        } else {
            setDuration(currentTotalSeconds); 
            startTimer();
        }
    }
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setDuration(initialMinutes * 60);
  };

  const handleMinutesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = parseInt(e.target.value, 10);
    if (!isActive) {
      if (!isNaN(newMinutes) && newMinutes >= 0 && newMinutes <= 999) {
        setDuration(newMinutes * 60 + seconds); 
      } else if (e.target.value === '') {
        setDuration(0 + seconds); 
      }
    }
  };
  
   const handleSecondsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeconds = parseInt(e.target.value, 10);
    if (!isActive) {
      if (!isNaN(newSeconds) && newSeconds >= 0 && newSeconds <= 59) {
        setDuration(minutes * 60 + newSeconds);
      } else if (e.target.value === '') {
         setDuration(minutes * 60 + 0);
      }
    }
  };

  const formatTime = (time: number): string => {
    return time < 10 ? `0${time}` : `${time}`;
  };

  return (
    <div className="flex flex-col items-center space-y-3 p-3 rounded-lg w-full">
      <div className="text-4xl font-mono text-brandTextPrimary p-2 border-2 border-brandNeutral-300 rounded-lg shadow-inner bg-brandNeutral-100" aria-live="polite">
        <span>{formatTime(minutes)}</span>:<span>{formatTime(seconds)}</span>
      </div>
      <div className="flex items-center space-x-1.5">
        <label htmlFor="timer-minutes" className="text-xs text-brandTextSecondary">M:</label>
        <input
          id="timer-minutes"
          type="number"
          min="0"
          max="999"
          value={formatTime(minutes)}
          onChange={handleMinutesInputChange}
          disabled={isActive}
          className="w-14 p-1 border border-brandNeutral-300 bg-brandNeutral-50 text-brandTextPrimary rounded-md text-sm text-center focus:ring-brandPrimary-500 focus:border-brandPrimary-500 disabled:bg-brandNeutral-200 disabled:text-brandNeutral-500"
          aria-label="Set minutes"
        />
        <label htmlFor="timer-seconds" className="text-xs text-brandTextSecondary">S:</label>
         <input
          id="timer-seconds"
          type="number"
          min="0"
          max="59"
          value={formatTime(seconds)}
          onChange={handleSecondsInputChange}
          disabled={isActive}
          className="w-14 p-1 border border-brandNeutral-300 bg-brandNeutral-50 text-brandTextPrimary rounded-md text-sm text-center focus:ring-brandPrimary-500 focus:border-brandPrimary-500 disabled:bg-brandNeutral-200 disabled:text-brandNeutral-500"
          aria-label="Set seconds"
        />
      </div>
      <div className="flex space-x-2 w-full">
        <button
          onClick={handleStartPause}
          className={`flex-1 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-75
            ${isActive 
              ? 'bg-brandAccent-500 text-white hover:bg-brandAccent-600 focus:ring-brandAccent-500' 
              : 'bg-brandPrimary-500 text-white hover:bg-brandPrimary-600 focus:ring-brandPrimary-500'}
          `}
          aria-pressed={isActive}
        >
          {isActive ? 'Pause' : (duration === 0 && !isActive ? 'Restart' : 'Start')}
        </button>
        <button
          onClick={handleReset}
          disabled={isActive && duration === initialMinutes * 60}
          className="flex-1 px-4 py-1.5 bg-brandFunctionalRed text-white text-sm font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-brandFunctionalRed focus:ring-opacity-75 disabled:bg-brandNeutral-300 disabled:text-brandNeutral-500"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;