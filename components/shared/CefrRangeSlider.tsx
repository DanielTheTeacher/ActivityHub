
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CefrRangeFilter } from '../../types.ts';

// Define the canonical order of CEFR levels
const CEFR_LEVELS_ORDERED = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface CefrRangeSliderProps {
  label: string;
  allCefrLevels: string[]; // Should be sorted according to CEFR_LEVELS_ORDERED
  currentRange: CefrRangeFilter;
  onChange: (newRange: CefrRangeFilter) => void;
}

const CefrRangeSlider: React.FC<CefrRangeSliderProps> = ({
  label,
  allCefrLevels, // Currently uses internal CEFR_LEVELS_ORDERED for indexing
  currentRange,
  onChange,
}) => {
  const getInitialIndex = (level: string, defaultIndex: number) => {
    const index = CEFR_LEVELS_ORDERED.indexOf(level);
    return index !== -1 ? index : defaultIndex;
  };

  const [minIndex, setMinIndex] = useState(() => getInitialIndex(currentRange.min, 0));
  const [maxIndex, setMaxIndex] = useState(() => getInitialIndex(currentRange.max, CEFR_LEVELS_ORDERED.length - 1));

  const sliderRef = useRef<HTMLDivElement>(null);
  const minThumbRef = useRef<HTMLButtonElement>(null);
  const maxThumbRef = useRef<HTMLButtonElement>(null);

  // Update internal indices if currentRange prop changes
  useEffect(() => {
    setMinIndex(getInitialIndex(currentRange.min, 0));
    setMaxIndex(getInitialIndex(currentRange.max, CEFR_LEVELS_ORDERED.length - 1));
  }, [currentRange.min, currentRange.max]);

  const handleValueChange = useCallback((newMinIdx: number, newMaxIdx: number) => {
    const validMinIndex = Math.max(0, Math.min(newMinIdx, CEFR_LEVELS_ORDERED.length - 1));
    const validMaxIndex = Math.max(0, Math.min(newMaxIdx, CEFR_LEVELS_ORDERED.length - 1));

    if (validMinIndex <= validMaxIndex) {
      setMinIndex(validMinIndex);
      setMaxIndex(validMaxIndex);
      onChange({
        min: CEFR_LEVELS_ORDERED[validMinIndex],
        max: CEFR_LEVELS_ORDERED[validMaxIndex],
      });
    }
  }, [onChange]);
  
  const createThumbMoveHandler = (thumbType: 'min' | 'max') => (event: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;

    event.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const totalLevels = CEFR_LEVELS_ORDERED.length -1;
    if (totalLevels < 0) return;

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      let clientX;
      if ('touches' in moveEvent) {
        clientX = moveEvent.touches[0].clientX;
      } else {
        clientX = moveEvent.clientX;
      }

      const currentSliderWidth = sliderRect.width;
      if (currentSliderWidth === 0) return;

      const position = Math.max(0, Math.min(1, (clientX - sliderRect.left) / currentSliderWidth));
      let newProposedIndex = Math.round(position * totalLevels);

      if (thumbType === 'min') {
        const newActualMinIndex = Math.min(newProposedIndex, maxIndex); // Can't go past max
        const newMin = Math.max(0, newActualMinIndex); // Ensure not less than 0
        if (newMin !== minIndex) { 
            handleValueChange(newMin, maxIndex);
        }
      } else { // thumbType === 'max'
        if (minIndex === maxIndex) { // Thumbs are co-located
          if (newProposedIndex < maxIndex) { // User is dragging left from co-located
            const newMin = Math.max(0, newProposedIndex); // Ensure new min is not < 0
            handleValueChange(newMin, maxIndex); // Moves minIndex
          } else if (newProposedIndex > maxIndex) { // User is dragging right from co-located
            const newMax = Math.min(newProposedIndex, totalLevels); // Ensure new max is not > totalLevels
            handleValueChange(minIndex, newMax); // Moves maxIndex
          }
          // If newProposedIndex === maxIndex (no change), do nothing.
        } else { // Thumbs are not co-located
          const newActualMaxIndex = Math.max(newProposedIndex, minIndex); // Can't go past min
          const newMax = Math.min(newActualMaxIndex, totalLevels); // Ensure new max is not > totalLevels
          if (newMax !== maxIndex) { // Only call if there's a change
            handleValueChange(minIndex, newMax);
          }
        }
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('touchend', onMouseUp);
    
    if ('touches' in event) {
      onMouseMove(event.nativeEvent as unknown as TouchEvent);
    }
  };

  const handleKeyDown = (thumbType: 'min' | 'max', event: React.KeyboardEvent<HTMLButtonElement>) => {
    let nMinIndex = minIndex; 
    let nMaxIndex = maxIndex;
    const totalSliderLevels = CEFR_LEVELS_ORDERED.length -1;

    if (thumbType === 'min') {
      if (event.key === 'ArrowLeft' && minIndex > 0) {
        nMinIndex--;
      } else if (event.key === 'ArrowRight') {
        if (minIndex < maxIndex) { 
          nMinIndex++;
        } else if (minIndex === maxIndex && maxIndex < totalSliderLevels) { 
          nMaxIndex++;
        }
      }
    } else { 
      if (event.key === 'ArrowLeft') {
        if (maxIndex > minIndex) { 
          nMaxIndex--;
        } else if (maxIndex === minIndex && minIndex > 0) { 
          nMinIndex--;
        }
      } else if (event.key === 'ArrowRight' && maxIndex < totalSliderLevels) {
        nMaxIndex++;
      }
    }
    
    if (nMinIndex !== minIndex || nMaxIndex !== maxIndex) {
        const finalMinIndex = Math.max(0, Math.min(nMinIndex, totalSliderLevels));
        const finalMaxIndex = Math.max(0, Math.min(nMaxIndex, totalSliderLevels));

        // Ensure min <= max after keyboard move
        if (finalMinIndex <= finalMaxIndex) {
            handleValueChange(finalMinIndex, finalMaxIndex);
        } else {
            // This case should be rare if logic above is correct, but as a fallback:
            if (thumbType === 'min' && event.key === 'ArrowRight') { // Min thumb tried to cross max
                 handleValueChange(finalMaxIndex, finalMaxIndex);
            } else if (thumbType === 'max' && event.key === 'ArrowLeft') { // Max thumb tried to cross min
                 handleValueChange(finalMinIndex, finalMinIndex);
            }
        }
        event.preventDefault();
    }
  };


  const minPosPercent = minIndex >= 0 && CEFR_LEVELS_ORDERED.length > 1 ? (minIndex / (CEFR_LEVELS_ORDERED.length - 1)) * 100 : 0;
  const maxPosPercent = maxIndex >= 0 && CEFR_LEVELS_ORDERED.length > 1 ? (maxIndex / (CEFR_LEVELS_ORDERED.length - 1)) * 100 : 100;


  return (
    <div>
      <label className="block text-sm font-medium text-brandTextSecondary mb-1">{label}</label>
      <div className="text-sm text-brandTextPrimary font-semibold mb-2 text-center" aria-live="polite">
        {CEFR_LEVELS_ORDERED[minIndex]} - {CEFR_LEVELS_ORDERED[maxIndex]}
      </div>
      <div ref={sliderRef} className="relative w-full h-8 my-4 select-none touch-none">
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-brandNeutral-200 rounded-full transform -translate-y-1/2"></div>
        {/* Selected Range */}
        <div
          className="absolute top-1/2 h-1.5 bg-brandPrimary-500 rounded-full transform -translate-y-1/2"
          style={{ left: `${minPosPercent}%`, width: `${Math.max(0, maxPosPercent - minPosPercent)}%` }}
        ></div>
        {/* Min Thumb */}
        <button
          ref={minThumbRef}
          onMouseDown={createThumbMoveHandler('min')}
          onTouchStart={createThumbMoveHandler('min')}
          onKeyDown={(e) => handleKeyDown('min', e)}
          className="absolute top-1/2 w-5 h-5 bg-white border-2 border-brandPrimary-500 rounded-full shadow-md cursor-grab transform -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-brandPrimary-400 active:cursor-grabbing"
          style={{ left: `${minPosPercent}%` }} 
          aria-label={`Minimum CEFR level: ${CEFR_LEVELS_ORDERED[minIndex]}`}
          aria-valuemin={0}
          aria-valuemax={CEFR_LEVELS_ORDERED.length - 1}
          aria-valuenow={minIndex}
          aria-valuetext={CEFR_LEVELS_ORDERED[minIndex]}
          role="slider"
        ></button>
        {/* Max Thumb */}
        <button
          ref={maxThumbRef}
          onMouseDown={createThumbMoveHandler('max')}
          onTouchStart={createThumbMoveHandler('max')}
          onKeyDown={(e) => handleKeyDown('max', e)}
          className="absolute top-1/2 w-5 h-5 bg-white border-2 border-brandPrimary-500 rounded-full shadow-md cursor-grab transform -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-brandPrimary-400 active:cursor-grabbing"
          style={{ left: `${maxPosPercent}%` }}
          aria-label={`Maximum CEFR level: ${CEFR_LEVELS_ORDERED[maxIndex]}`}
          aria-valuemin={0}
          aria-valuemax={CEFR_LEVELS_ORDERED.length - 1}
          aria-valuenow={maxIndex}
          aria-valuetext={CEFR_LEVELS_ORDERED[maxIndex]}
          role="slider"
        ></button>
      </div>
      <div className="flex justify-between text-xs text-brandTextSecondary mt-1 px-1">
        {CEFR_LEVELS_ORDERED.map((level) => (
          <span 
            key={level} 
            className="flex-1 text-center cursor-pointer hover:font-semibold" 
            onClick={()=>{
             const levelIndex = CEFR_LEVELS_ORDERED.indexOf(level);
             if (Math.abs(levelIndex - minIndex) < Math.abs(levelIndex - maxIndex) || (Math.abs(levelIndex - minIndex) === Math.abs(levelIndex - maxIndex) && levelIndex < minIndex) || levelIndex < minIndex) {
                if (levelIndex <= maxIndex) handleValueChange(levelIndex, maxIndex);
             } else {
                if (levelIndex >= minIndex) handleValueChange(minIndex, levelIndex);
             }
           }}
           role="button"
           tabIndex={0}
           onKeyDown={(e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                const levelIndex = CEFR_LEVELS_ORDERED.indexOf(level);
                if (Math.abs(levelIndex - minIndex) < Math.abs(levelIndex - maxIndex) || (Math.abs(levelIndex - minIndex) === Math.abs(levelIndex - maxIndex) && levelIndex < minIndex) || levelIndex < minIndex) {
                    if (levelIndex <= maxIndex) handleValueChange(levelIndex, maxIndex);
                } else {
                    if (levelIndex >= minIndex) handleValueChange(minIndex, levelIndex);
                }
             }
           }}
           aria-label={`Set range to include ${level}`}
          >
            {level}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CefrRangeSlider;