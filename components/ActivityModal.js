
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Activity, ActivityTags, FilterOptions, Flashcard } from '../types.js'; // Added Flashcard
import CheckboxGroup from './shared/CheckboxGroup.js'; 

type StringArrayActivityTagKeys = {
  [K in keyof ActivityTags]: ActivityTags[K] extends string[] ? K : never;
}[keyof ActivityTags];

interface ActivityModalProps {
  activity: Activity; // Assumes activity now has an 'id'
  isOpen: boolean;
  onClose: () => void;
  initialEditedDescription: string; 
  onSaveTemporaryEdit: (activityId: string, newDescription: string) => void; // Use ID
  onResetTemporaryEdit: (activityId: string) => void; // Use ID
  isGlobalToolsPanelOpen: boolean;
  isEditModeActive: boolean; 
  onSaveChangesInEditMode: (originalActivityId: string, updatedActivityData: Activity) => void; // Changed to use ID
  globalFilterOptions: FilterOptions; 
  toggleGlobalToolsPanel: () => void;
  setShowDiceGlobal: (show: boolean) => void;
  setShowTimerGlobal: (show: boolean) => void;
  setShowScoreCounterGlobal: (show: boolean) => void;
  triggerDicePulse: () => void;
  triggerTimerPulse: () => void;
  triggerScorePulse: () => void;
}

const TagBadgeModal: React.FC<{ label: string; value?: string | boolean | string[]; color?: string }> = ({ label, value, color = 'bg-brandNeutral-200 text-brandNeutral-700' }) => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0 && !(typeof value[0] === 'boolean'))) {
    if (typeof value === 'string' && value.toLowerCase() === 'none') return null;
    if (Array.isArray(value) && value.length === 0) return null;
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) return null;
  }
  
  let displayValue = '';
  if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  } else if (Array.isArray(value)) {
    displayValue = value.filter(item => String(item).trim() !== '').join(', ');
     if (displayValue === '') return null;
  } else {
    displayValue = String(value);
    if (displayValue.toLowerCase() === 'none') return null;
  }

  const labelPart = label && label.trim() !== '' ? `<span class="font-semibold">${label}:</span> ` : '';

  return (
    <div 
        className={`text-sm px-3 py-1.5 rounded-lg ${color} whitespace-normal break-words`}
        dangerouslySetInnerHTML={{ __html: `${labelPart}${displayValue}` }}
    />
  );
};

const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  isOpen,
  onClose,
  initialEditedDescription,
  onSaveTemporaryEdit,
  onResetTemporaryEdit,
  isGlobalToolsPanelOpen,
  isEditModeActive,
  onSaveChangesInEditMode,
  globalFilterOptions,
  toggleGlobalToolsPanel,
  setShowDiceGlobal,
  setShowTimerGlobal,
  setShowScoreCounterGlobal,
  triggerDicePulse,
  triggerTimerPulse,
  triggerScorePulse,
}) => {
  const [isThematicEditing, setIsThematicEditing] = useState(false); 
  const [currentThematicDescription, setCurrentThematicDescription] = useState(initialEditedDescription || '');
  const [editableActivityData, setEditableActivityData] = useState<Activity | null>(null);
  const [newTagInputs, setNewTagInputs] = useState<Record<keyof ActivityTags, string>>({
      main_category: '', sub_category: '', cefr_level: '', group_size: '', 
      preparation_required: '', materials_resources: '', sensitivity_warning: '', 
      activity_type: '', classroom_community_bonding: '', thematically_adaptable: '',
      teacher_instruction: '', 
      flashcards: '' 
  });

  const [isTextEnlarged, setIsTextEnlarged] = useState(false);
  const [dynamicFontSize, setDynamicFontSize] = useState<string | null>(null);
  const [showAllDetailsInModal, setShowAllDetailsInModal] = useState<boolean>(false);

  const enlargedTextRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null); 
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const [isDiceRelevant, setIsDiceRelevant] = useState(false);
  const [isTimerRelevant, setIsTimerRelevant] = useState(false);
  const [isScoreRelevant, setIsScoreRelevant] = useState(false);
  
  const [showSuggestButtonContainer, setShowSuggestButtonContainer] = useState(false);
  const [isAdaptationOptionsPopupOpen, setIsAdaptationOptionsPopupOpen] = useState(false); 
  const [adaptToTheme, setAdaptToTheme] = useState(false);
  const [themeInput, setThemeInput] = useState('');
  const [adaptForVocation, setAdaptForVocation] = useState(false);
  const [vocationInput, setVocationInput] = useState('');
  const [simplifyLanguage, setSimplifyLanguage] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null); // For share button feedback


  const [flippedCardIndices, setFlippedCardIndices] = useState<Set<number>>(new Set());
  const [eliminatedCardIndices, setEliminatedCardIndices] = useState<Set<number>>(new Set());
  const [flashcardScore, setFlashcardScore] = useState<number>(0);
  const [eliminatingCardIndex, setEliminatingCardIndex] = useState<number | null>(null);
  
  const [showPrependedInstruction, setShowPrependedInstruction] = useState<boolean>(false);
  const [showCopilotEmbed, setShowCopilotEmbed] = useState<boolean>(false);


  const DEFAULT_FONT_SIZE = "16px"; 
  const TOOLS_PANEL_WIDTH = 320; // Assumed width of the global tools panel, matches App.js lg:mr-[320px]


  useEffect(() => {
    if (isOpen && activity) {
      if (isEditModeActive) {
        setEditableActivityData(JSON.parse(JSON.stringify(activity))); 
        setIsThematicEditing(false); 
      } else {
        setCurrentThematicDescription(initialEditedDescription || activity.full_description || '');
        setEditableActivityData(null); 
      }
      // Reset states for the modal view
      setIsTextEnlarged(false);
      setDynamicFontSize(null);
      setShowAllDetailsInModal(false);
      setShowPrependedInstruction(false);
      setShowCopilotEmbed(false); // Ensure Copilot embed is hidden on new modal open
      
      setShowSuggestButtonContainer(false);
      setIsAdaptationOptionsPopupOpen(false); 
      setAdaptToTheme(false);
      setThemeInput('');
      setAdaptForVocation(false);
      setVocationInput('');
      setSimplifyLanguage(false);
      setPromptMessage(null);
      setShareMessage(null);

      setFlippedCardIndices(new Set());
      setEliminatedCardIndices(new Set());
      setFlashcardScore(0);
      setEliminatingCardIndex(null);

      const activityTypes = activity.tags.activity_type;
      let diceRelevant = false;
      let timerRelevant = false;
      let scoreRelevant = false;
      if (Array.isArray(activityTypes)) {
        if (activityTypes.includes("Games & Quizzes")) { diceRelevant = true; scoreRelevant = true; timerRelevant = true; }
        if (activityTypes.some(type => ["Presentation & Speaking", "Discussion & Debate", "Writing", "Role-play & Acting", "Problem Solving"].includes(type))) { timerRelevant = true; }
      }
      setIsDiceRelevant(diceRelevant); setIsTimerRelevant(timerRelevant); setIsScoreRelevant(scoreRelevant);
      if (diceRelevant) triggerDicePulse(); if (timerRelevant) triggerTimerPulse(); if (scoreRelevant) triggerScorePulse();

    } else {
        setShowSuggestButtonContainer(false);
        setIsAdaptationOptionsPopupOpen(false);
        setPromptMessage(null);
        setShareMessage(null);
        setShowCopilotEmbed(false);
    }
  }, [isOpen, activity, isEditModeActive, initialEditedDescription, triggerDicePulse, triggerTimerPulse, triggerScorePulse]);

  const handleToolButtonClick = (tool: 'dice' | 'timer' | 'score') => { 
    if (!isGlobalToolsPanelOpen) toggleGlobalToolsPanel();
    if (tool === 'dice') setShowDiceGlobal(true);
    if (tool === 'timer') setShowTimerGlobal(true);
    if (tool === 'score') setShowScoreCounterGlobal(true);
  };

  const handleGenerateAndCopyPromptAndRedirect = async () => {
    let prompt = "Please modify the description of this classroom activity. I want the following changes:";
    let changesRequested = false;
    if (adaptToTheme && themeInput.trim()) { prompt += `\n\n- Change the text so that it is relevant for the following theme: ${themeInput.trim()}`; changesRequested = true; }
    if (adaptForVocation && vocationInput.trim()) { prompt += `\n\n- Change the text so that it is relevant for the following vocation: ${vocationInput.trim()}`; changesRequested = true; }
    if (simplifyLanguage) { prompt += "\n\n- Make the language significantly more simple."; changesRequested = true; }
    if (!changesRequested) { setPromptMessage("Please select at least one adaptation option."); setTimeout(() => setPromptMessage(null), 3000); return; }
    prompt += `\n\nActivity Description:\n${activity.full_description || ''}`;
    try {
      await navigator.clipboard.writeText(prompt);
      setPromptMessage("Prompt copied! Copilot is opening below...");
      setShowCopilotEmbed(true); 
      setIsAdaptationOptionsPopupOpen(false); // Close the options popup
    } catch (err) { console.error('Failed to copy prompt: ', err); setPromptMessage("Failed to copy. Please try again."); setTimeout(() => setPromptMessage(null), 3000); }
  };

  const handleReturnFromCopilot = () => {
    setShowCopilotEmbed(false);
    setIsThematicEditing(true); // Automatically open in "Adapt Activity" mode
    setPromptMessage(null); // Clear any messages
  };

  const togglePrependedInstruction = () => setShowPrependedInstruction(prev => !prev);

  const handleThematicEditToggle = () => { 
    if (isThematicEditing) {
      onSaveTemporaryEdit(activity.id, currentThematicDescription); // Use ID
    } else {
      setShowPrependedInstruction(false); 
    }
    setIsThematicEditing(!isThematicEditing);
    if (isTextEnlarged) setIsTextEnlarged(false); 
    setIsAdaptationOptionsPopupOpen(false); 
    setShowSuggestButtonContainer(false);
  };

  const handleEnlargeToggle = () => { 
    if (isThematicEditing && !isEditModeActive) { 
      onSaveTemporaryEdit(activity.id, currentThematicDescription);  // Use ID
      setIsThematicEditing(false);
    }
    setIsTextEnlarged(!isTextEnlarged);
    setIsAdaptationOptionsPopupOpen(false); 
    setShowSuggestButtonContainer(false);
  };
  
  const handleEditModeTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    if (editableActivityData) { setEditableActivityData(prev => prev ? { ...prev, title: e.target.value } : null); }
  };

  const handleEditModeInputChange = (field: keyof ActivityTags, value: string | string[] | boolean | Flashcard[]) => { 
    if (editableActivityData) {
      const currentTagType = typeof activity.tags[field];
      let isValid = false;
      if (field === 'flashcards' && Array.isArray(value)) { isValid = true;
      } else if (Array.isArray(activity.tags[field]) && Array.isArray(value)) { isValid = true;
      } else if (currentTagType === typeof value) { isValid = true;
      } else if (field === 'teacher_instruction' && (typeof value === 'string' || value === undefined)) { isValid = true; }
      if (isValid) { setEditableActivityData(prev => prev ? { ...prev, tags: { ...prev.tags, [field]: value } } : null);
      } else { console.warn(`Type mismatch: Attempted to set tag '${String(field)}' with value of type ${typeof value}, expected compatible with ${currentTagType}`); }
    }
  };
  
  const handleEditModeDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { 
    if (editableActivityData) { setEditableActivityData(prev => prev ? { ...prev, full_description: e.target.value } : null); }
  };

 const handleAddNewTagValue = (tagKey: StringArrayActivityTagKeys) => { 
    if (!editableActivityData) return;
    const currentInputString = newTagInputs[tagKey as keyof ActivityTags] as string; 
    if (!currentInputString.trim()) return;
    const newValue = currentInputString.trim();
    const currentTagValuesFromActivity = editableActivityData.tags[tagKey] as string[] | undefined;
    const currentTagArray: string[] = Array.isArray(currentTagValuesFromActivity) ? currentTagValuesFromActivity : [];
    if (!currentTagArray.includes(newValue)) {
        const updatedTagArray = [...currentTagArray, newValue];
        handleEditModeInputChange(tagKey, updatedTagArray);
    }
    setNewTagInputs(prev => ({ ...prev, [tagKey]: '' }));
};

  const handleSaveChangesAndClose = () => {
    if (isEditModeActive && editableActivityData && activity) { 
      onSaveChangesInEditMode(activity.id, editableActivityData); // Use ID
    }
    onClose();
  };

  const descriptionTextForDisplay = (isEditModeActive && editableActivityData ? editableActivityData.full_description : currentThematicDescription) || '';

  useEffect(() => {
    let animationFrameId: number;
    let timeoutId: number;

    if (isTextEnlarged && enlargedTextRef.current && mainContentRef.current && modalContainerRef.current && activity) {
        const textContainer = enlargedTextRef.current;
        const mainContent = mainContentRef.current; 
        
        textContainer.style.fontSize = '';
        textContainer.style.lineHeight = '';
        textContainer.style.width = ''; 

        let contentToMeasure = descriptionTextForDisplay.trim();
        if (showPrependedInstruction && activity.tags.teacher_instruction) {
            contentToMeasure += activity.tags.teacher_instruction.trim();
        }

        if (contentToMeasure === '') {
            setDynamicFontSize(DEFAULT_FONT_SIZE);
            textContainer.style.fontSize = DEFAULT_FONT_SIZE;
            textContainer.style.lineHeight = '1.5';
            return () => {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                if (timeoutId) clearTimeout(timeoutId);
            };
        }
        
        timeoutId = window.setTimeout(() => {
            animationFrameId = requestAnimationFrame(() => {
                if (!enlargedTextRef.current || !mainContentRef.current || !modalContainerRef.current) return;

                const mainContentPadding = 24; 
                let availableWidthForTextNoPanel = mainContent.clientWidth - (2 * mainContentPadding);
                let availableWidthForText = availableWidthForTextNoPanel;

                if (isGlobalToolsPanelOpen) {
                    const mainContentRect = mainContent.getBoundingClientRect();
                    const toolsPanelEdge = window.innerWidth - TOOLS_PANEL_WIDTH;
                    
                    const mainContentContentBoxRightEdge = mainContentRect.left + mainContent.clientWidth - mainContentPadding;

                    if (mainContentContentBoxRightEdge > toolsPanelEdge) {
                        const widthIfPanelOverlaps = toolsPanelEdge - (mainContentRect.left + mainContentPadding);
                        availableWidthForText = Math.max(0, widthIfPanelOverlaps);
                    }
                }
                
                availableWidthForText = Math.max(50, availableWidthForText);
                textContainer.style.width = `${availableWidthForText}px`;
                
                const availableHeightForText = mainContent.clientHeight - (2 * mainContentPadding);

                let currentFs = 80; 
                const minFs = 16; 
                const step = 1;
                let iteration = 0;
                const maxIterations = (currentFs - minFs) / step + 15;

                while (currentFs >= minFs && iteration < maxIterations) {
                    textContainer.style.fontSize = `${currentFs}px`;
                    textContainer.style.lineHeight = currentFs > 30 ? '1.3' : '1.5';
                    if (textContainer.scrollHeight <= availableHeightForText && textContainer.scrollWidth <= availableWidthForText + 2) {
                        break; 
                    }
                    currentFs -= step;
                    iteration++;
                }
                const finalFs = Math.max(currentFs, minFs);
                setDynamicFontSize(`${finalFs}px`); 
                
                textContainer.style.fontSize = `${finalFs}px`;
                textContainer.style.lineHeight = finalFs > 30 ? '1.3' : '1.5';
            });
        }, 350);

    } else if (!isTextEnlarged && enlargedTextRef.current) {
        enlargedTextRef.current.style.fontSize = '';
        enlargedTextRef.current.style.lineHeight = '';
        enlargedTextRef.current.style.width = '';
        setDynamicFontSize(null);
    }

    return () => { 
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isTextEnlarged, descriptionTextForDisplay, activity, isOpen, isGlobalToolsPanelOpen, showPrependedInstruction]);


  const handleThematicDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentThematicDescription(e.target.value);

  const handleResetThematicDescription = () => {
    setCurrentThematicDescription(activity.full_description || ''); 
    onResetTemporaryEdit(activity.id); // Use ID
  };

  const handleClose = useCallback(() => {
    if (isThematicEditing && !isEditModeActive) { 
        onSaveTemporaryEdit(activity.id, currentThematicDescription); // Use ID
    }
    setIsThematicEditing(false); 
    setIsTextEnlarged(false); 
    setDynamicFontSize(null); 
    setShowAllDetailsInModal(false); 
    setShowPrependedInstruction(false);
    setShowCopilotEmbed(false); // Ensure Copilot embed is closed
    if (enlargedTextRef.current) { 
        enlargedTextRef.current.style.fontSize = ''; 
        enlargedTextRef.current.style.lineHeight = ''; 
        enlargedTextRef.current.style.width = ''; 
    }
    setShowSuggestButtonContainer(false); 
    setIsAdaptationOptionsPopupOpen(false); 
    setPromptMessage(null); 
    setShareMessage(null);
    onClose();
  }, [isThematicEditing, isEditModeActive, currentThematicDescription, onSaveTemporaryEdit, onClose, activity?.id, setShowCopilotEmbed]);

  useEffect(() => { 
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { if (isAdaptationOptionsPopupOpen) setIsAdaptationOptionsPopupOpen(false); else handleClose(); } };
    if (isOpen) { document.addEventListener('keydown', handleKeyDown); }
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [isOpen, handleClose, isAdaptationOptionsPopupOpen]);

  const toggleFlashcardFlip = (index: number) => { 
    setFlippedCardIndices(prev => { const newSet = new Set(prev); if (newSet.has(index)) newSet.delete(index); else newSet.add(index); return newSet; });
  };

  const eliminateFlashcard = (originalIndex: number) => { 
    setEliminatingCardIndex(originalIndex);
    setTimeout(() => {
      setEliminatedCardIndices(prev => new Set(prev).add(originalIndex)); setFlashcardScore(prev => prev + 1);
      setFlippedCardIndices(prev => { const newSet = new Set(prev); newSet.delete(originalIndex); return newSet; });
      setEliminatingCardIndex(null);
    }, 300);
  };

  const resetFlashcards = () => { 
    setFlippedCardIndices(new Set()); setEliminatedCardIndices(new Set()); setFlashcardScore(0); setEliminatingCardIndex(null);
  };

  const handleShareActivity = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/activity/${activity.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy share link: ', err);
      setShareMessage('Failed to copy link.');
    }
    setTimeout(() => setShareMessage(null), 3000);
  };

  if (!isOpen || !activity) return null;

  const allTagsDisplayOrder: (keyof ActivityTags)[] = [
    'main_category', 'sub_category', 'cefr_level', 'group_size', 
    'preparation_required', 'materials_resources', 'activity_type', 
    'classroom_community_bonding', 'sensitivity_warning', 'thematically_adaptable',
    'teacher_instruction' 
  ];
  const tagColors: Record<string, string> = { 
    main_category: 'bg-brandPrimary-100 text-brandPrimary-800', sub_category: 'bg-sky-100 text-sky-800', 
    cefr_level: 'bg-green-100 text-green-800', group_size: 'bg-indigo-100 text-indigo-800', 
    preparation_required: 'bg-brandAccent-100 text-brandAccent-800', materials_resources: 'bg-purple-100 text-purple-800', 
    sensitivity_warning: 'bg-red-100 text-red-800', activity_type: 'bg-teal-100 text-teal-800', 
    classroom_community_bonding: 'bg-pink-100 text-pink-800', thematically_adaptable: 'bg-lime-100 text-lime-800', 
    teacher_instruction: 'bg-yellow-100 text-yellow-800',
  };
  const formatTagName = (tagName: string): string => tagName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  
  const modalSizeClass = showCopilotEmbed 
    ? "w-11/12 max-w-6xl" 
    : (isTextEnlarged ? "w-11/12 max-w-7xl" : "w-full max-w-3xl");

  const canShowAdaptButtons = !isEditModeActive && !isTextEnlarged && !isThematicEditing && !showCopilotEmbed;
  const toolButtonsConfig = []; 
  if (isDiceRelevant) toolButtonsConfig.push({ key: 'dice', emoji: '🎲', text: 'Dice', color: 'bg-brandPrimary-100 text-brandPrimary-700 hover:bg-brandPrimary-200 focus:ring-brandPrimary-300', action: () => handleToolButtonClick('dice'), title: 'Use Dice'});
  if (isTimerRelevant) toolButtonsConfig.push({ key: 'timer', emoji: '⏱️', text: 'Timer', color: 'bg-lime-100 text-lime-700 hover:bg-lime-200 focus:ring-lime-300', action: () => handleToolButtonClick('timer'), title: 'Use Timer' });
  if (isScoreRelevant) toolButtonsConfig.push({ key: 'score', emoji: '🏆', text: 'Scoreboard', color: 'bg-pink-100 text-pink-700 hover:bg-pink-200 focus:ring-pink-300', action: () => handleToolButtonClick('score'), title: 'Use Scoreboard'});


  const renderTagEditor = (tagKey: keyof ActivityTags) => { 
    if (!editableActivityData || !globalFilterOptions) return null;
    const currentValue = editableActivityData.tags[tagKey]; const label = formatTagName(String(tagKey)); let options: string[] = []; 
    if (tagKey === 'main_category') { options = globalFilterOptions.main_category;
    } else if (tagKey === 'sub_category' && editableActivityData.tags.main_category) { options = globalFilterOptions.sub_category_options[editableActivityData.tags.main_category] || [];
    } else if (['cefr_level', 'group_size', 'preparation_required', 'materials_resources', 'activity_type'].includes(tagKey)) { options = globalFilterOptions[tagKey as keyof Omit<FilterOptions, 'sub_category_options' | 'sensitivity_warning' | 'classroom_community_bonding'>];
    } else if (['sensitivity_warning', 'classroom_community_bonding', 'thematically_adaptable'].includes(tagKey)) { options = ["Yes", "No"]; }
    const handleSingleStringChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => handleEditModeInputChange(tagKey, e.target.value);
    const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => handleEditModeInputChange(tagKey, e.target.checked);
    const handleArrayChange = (selected: string[]) => handleEditModeInputChange(tagKey, selected);
    const handleNewTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewTagInputs(prev => ({ ...prev, [tagKey]: e.target.value }));
    if (tagKey === 'teacher_instruction') {
        return ( <div className="mb-3 p-3 border rounded-md bg-brandNeutral-50"> <label htmlFor={`edit-${tagKey}`} className="block text-sm font-medium text-brandTextSecondary mb-1">{label}</label> <textarea id={`edit-${tagKey}`} value={(currentValue as string || '')} onChange={handleSingleStringChange} className="w-full p-1.5 border border-brandNeutral-300 rounded-md text-sm text-brandTextPrimary min-h-[80px] resize-y" rows={3} placeholder="Enter teacher-specific instructions or notes here..." /> </div> );
    }
    if (typeof currentValue === 'boolean') {
      return ( <div className="mb-3 p-3 border rounded-md bg-brandNeutral-50"> <label className="flex items-center space-x-2 text-sm font-medium text-brandTextSecondary"> <input type="checkbox" checked={currentValue} onChange={handleBooleanChange} className="rounded border-brandNeutral-400 text-brandPrimary-600 shadow-sm focus:border-brandPrimary-300 focus:ring focus:ring-brandPrimary-200 focus:ring-opacity-50" /> <span>{label}</span> </label> </div> );
    }
    if (Array.isArray(currentValue)) { 
      return ( <div className="mb-3 p-3 border rounded-md bg-brandNeutral-50"> <CheckboxGroup label={label} name={tagKey} options={options.sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}))} selectedOptions={currentValue as string[]} onChange={handleArrayChange} /> <div className="mt-2 flex gap-2"> <input type="text" value={newTagInputs[tagKey as keyof ActivityTags] || ''} onChange={handleNewTagInputChange} placeholder={`New ${label.toLowerCase()} option`} className="flex-grow p-1.5 border border-brandNeutral-300 rounded-md text-sm text-brandTextPrimary" /> <button onClick={() => { if (tagKey !== 'flashcards') { handleAddNewTagValue(tagKey as StringArrayActivityTagKeys); } }} className="px-3 py-1.5 bg-brandPrimary-500 text-white text-xs rounded-md hover:bg-brandPrimary-600" > Add </button> </div> </div> );
    }
    if (typeof currentValue === 'string') {
        if (tagKey === 'main_category' || tagKey === 'preparation_required') { 
            return ( <div className="mb-3 p-3 border rounded-md bg-brandNeutral-50"> <label htmlFor={`edit-${tagKey}`} className="block text-sm font-medium text-brandTextSecondary mb-1">{label}</label> <input type="text" id={`edit-${tagKey}`} value={currentValue || ''} onChange={handleSingleStringChange} className="w-full p-1.5 border border-brandNeutral-300 rounded-md text-sm text-brandTextPrimary" /> </div> );
        } else { return ( <div className="mb-3 p-3 border rounded-md bg-brandNeutral-50"> <p className="text-sm text-red-600">Data inconsistency for tag '{label}'. Expected array or boolean, got string.</p> </div> ); }
    }
    console.warn(`ActivityModal: renderTagEditor reached fallback for tagKey: ${String(tagKey)} with value:`, currentValue);
    return null;
  };

  const titleAreaContent = ( 
    <div className="flex-grow flex items-center space-x-2">
      {isEditModeActive && editableActivityData ? (
        <input type="text" id="activity-modal-title-edit" value={editableActivityData.title} onChange={handleEditModeTitleChange} className="text-3xl font-bold text-brandPrimary-700 flex-grow border-b-2 border-brandPrimary-300 focus:border-brandPrimary-500 outline-none py-1 mr-2" aria-label="Editable activity title" />
      ) : (
        <h2 id="activity-modal-title" className="text-3xl font-bold text-brandPrimary-700">{activity.title}</h2>
      )}
    </div>
  );
  const totalFlashcards = activity.tags.flashcards?.length || 0;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
        onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="activity-modal-title"
    >
      <div 
        ref={modalContainerRef}
        className={`bg-white rounded-xl shadow-2xl ${modalSizeClass} max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out scale-100`}
        onClick={e => e.stopPropagation()}
      >
        {showCopilotEmbed ? (
            <>
                <div className="flex justify-between items-center p-4 border-b border-brandNeutral-200 bg-brandPrimary-50 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-brandTextPrimary">Adapt with Copilot</h2>
                    <button 
                        onClick={handleClose} 
                        className="text-brandNeutral-500 hover:text-brandNeutral-700 transition-colors p-1 rounded-full hover:bg-brandNeutral-100"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 flex-grow flex flex-col space-y-4 overflow-y-auto">
                    <p className="text-sm text-brandTextSecondary">
                        Paste the copied prompt (Ctrl+V or Cmd+V) into the Copilot chat window below to adapt the activity description.
                    </p>
                    <button
                        onClick={handleReturnFromCopilot}
                        className="mb-2 px-4 py-2 bg-brandPrimary-500 text-white rounded-md hover:bg-brandPrimary-600 self-start text-sm font-medium"
                    >
                        Return to Activity & Edit
                    </button>
                    {promptMessage && <p className="text-xs text-center text-brandPrimary-600">{promptMessage}</p>}
                    <div className="flex-grow border border-brandNeutral-300 rounded-md overflow-hidden min-h-[300px]"> {/* Added min-h for iframe visibility */}
                        <iframe
                            src="https://copilot.microsoft.com"
                            title="Microsoft Copilot"
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        ></iframe>
                    </div>
                </div>
            </>
        ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-start p-6 border-b border-brandNeutral-200 flex-shrink-0">
                {titleAreaContent}
                <button 
                  onClick={handleClose} 
                  className="text-brandNeutral-500 hover:text-brandNeutral-700 transition-colors p-1 rounded-full hover:bg-brandNeutral-100 ml-2"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              {/* Body */}
              <div ref={modalBodyRef} className="flex-grow overflow-y-auto flex">
                  <div ref={mainContentRef} className={`p-6 space-y-6 flex-grow w-full ${isTextEnlarged ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
                      {/* Description Section */}
                      <div>
                        <div className="flex items-center mb-2 space-x-2">
                          <h3 className="text-xl font-semibold text-brandTextPrimary">Description</h3>
                          {activity.tags.teacher_instruction && activity.tags.teacher_instruction.trim() !== '' && !isEditModeActive && !isThematicEditing && (
                              <button onClick={togglePrependedInstruction} className={`p-1.5 rounded-full transition-colors shadow-sm ${showPrependedInstruction ? 'bg-yellow-400 hover:bg-yellow-500 text-white' : 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800'}`} title={showPrependedInstruction ? "Hide Teacher Instruction from description" : `Teacher Instruction: ${activity.tags.teacher_instruction}`} aria-pressed={showPrependedInstruction} aria-label="Toggle Teacher Instruction display in description" >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg>
                              </button>
                          )}
                        </div>
                        <div 
                          ref={isTextEnlarged ? enlargedTextRef : null} 
                          className={`${isTextEnlarged 
                                      ? 'flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-brandPrimary-300 scrollbar-track-brandNeutral-100' 
                                      : 'w-full overflow-x-hidden'}`} 
                          style={isTextEnlarged && dynamicFontSize ? { fontSize: dynamicFontSize, lineHeight: (parseInt(dynamicFontSize) > 30 ? '1.3' : '1.5') } : {}}
                        >
                          {showPrependedInstruction && activity.tags.teacher_instruction && activity.tags.teacher_instruction.trim() !== '' && !isEditModeActive && (
                            <div className={`mb-3 p-3 bg-yellow-100 border border-yellow-200 rounded-md shadow-sm ${isTextEnlarged ? '' : 'text-sm'}`}>
                                <p className="font-semibold text-yellow-800 mb-1">Teacher Note:</p>
                                <p className="text-yellow-700 whitespace-pre-wrap">{activity.tags.teacher_instruction}</p>
                            </div>
                          )}
                          {isEditModeActive && editableActivityData ? ( <textarea value={editableActivityData.full_description || ''} onChange={handleEditModeDescriptionChange} className="w-full p-3 border border-brandNeutral-300 rounded-md focus:ring-2 focus:ring-brandPrimary-500 focus:border-brandPrimary-500 resize-y text-base min-h-[150px] text-brandTextPrimary bg-brandNeutral-50" aria-label="Editable description (Edit Mode)"/>
                          ) : isThematicEditing ? ( <textarea value={currentThematicDescription} onChange={handleThematicDescriptionChange} className="w-full p-3 border border-brandNeutral-300 rounded-md focus:ring-2 focus:ring-brandPrimary-500 focus:border-brandPrimary-500 resize-y text-base min-h-[150px] text-brandTextPrimary bg-brandNeutral-50" aria-label="Editable description (Thematic Adaptation)"/>
                          ) : ( <p className={`text-brandTextSecondary whitespace-pre-wrap text-left ${isTextEnlarged ? '' : 'text-base leading-relaxed'}`}>{descriptionTextForDisplay}</p> )}
                        </div>
                        {/* Action buttons for description */}
                        <div className="mt-4 flex flex-wrap gap-3 items-start relative"> 
                            {!isEditModeActive && !isTextEnlarged && (
                                <div className="relative inline-flex flex-col" onMouseEnter={() => { if (canShowAdaptButtons) setShowSuggestButtonContainer(true);}} onMouseLeave={() => setShowSuggestButtonContainer(false)}>
                                  <button onClick={handleThematicEditToggle} className={`w-full px-4 py-2 text-sm font-medium text-white transition-colors ${ isThematicEditing ? 'bg-brandAccent-500 hover:bg-brandAccent-600 rounded-md' : 'bg-brandPrimary-500 hover:bg-brandPrimary-600'} ${showSuggestButtonContainer ? 'rounded-t-md' : 'rounded-md'}`} aria-pressed={isThematicEditing} disabled={isAdaptationOptionsPopupOpen}>
                                    {isThematicEditing ? 'Save Temp Changes' : 'Adapt Description'}
                                  </button>
                                  <div className={`transition-all duration-300 ease-in-out overflow-hidden w-full ${ showSuggestButtonContainer && canShowAdaptButtons ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0' }`}>
                                    <button onClick={() => { setIsAdaptationOptionsPopupOpen(true); setShowSuggestButtonContainer(false); }} className={`w-full px-4 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-b-md mt-0 flex items-center justify-center space-x-2`} style={{ display: (canShowAdaptButtons) ? 'flex' : 'none' }}>
                                      <span role="img" aria-hidden="true">✨</span> <span>Suggest Adaptations</span>
                                    </button>
                                  </div>
                                </div>
                            )}
                            {isThematicEditing && !isEditModeActive && !isTextEnlarged && ( <button onClick={handleResetThematicDescription} className="px-4 py-2 text-sm font-medium bg-brandNeutral-200 hover:bg-brandNeutral-300 text-brandTextPrimary rounded-md transition-colors"> Reset Temp Description </button> )}
                            {(!isEditModeActive && !isThematicEditing) && ( <button onClick={handleEnlargeToggle} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors bg-purple-500 hover:bg-purple-600 text-white ${isAdaptationOptionsPopupOpen ? 'opacity-50 cursor-not-allowed' : ''}`} aria-pressed={isTextEnlarged} disabled={isAdaptationOptionsPopupOpen}> {isTextEnlarged ? 'Minimize Text' : 'Enlarge Text'} </button> )}
                            {isEditModeActive && !isTextEnlarged && ( <button onClick={handleEnlargeToggle} className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-purple-500 hover:bg-purple-600 text-white" aria-pressed={isTextEnlarged}> {isTextEnlarged ? 'Minimize Text View' : 'Enlarge Text View'} </button> )}
                            {isEditModeActive && isTextEnlarged && ( <button onClick={handleEnlargeToggle} className="mt-4 px-4 py-2 text-sm font-medium rounded-md transition-colors bg-purple-500 hover:bg-purple-600 text-white self-center" aria-pressed={isTextEnlarged}> Minimize Text View </button> )}
                            {(!isEditModeActive && !isTextEnlarged && !isThematicEditing && !isAdaptationOptionsPopupOpen && toolButtonsConfig.length > 0) && (
                              <div className="flex rounded-md border border-brandNeutral-300 overflow-hidden shadow-sm">
                                {toolButtonsConfig.map((tool, index) => (
                                  <button key={tool.key} onClick={tool.action} className={`${tool.color} px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-inset flex items-center justify-center space-x-1.5 ${index < toolButtonsConfig.length - 1 ? 'border-r border-brandNeutral-300' : ''}`} title={tool.title}>
                                    <span role="img" aria-hidden="true">{tool.emoji}</span> <span>{tool.text}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                      
                      {/* Flashcards Section */}
                      {!isTextEnlarged && (activity.tags.flashcards && activity.tags.flashcards.length > 0) && ( 
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-3"> <h3 className="text-xl font-semibold text-brandTextPrimary">Flashcards</h3> <div className="flex items-center space-x-3"> <span className="text-sm text-brandTextSecondary"> Score: {flashcardScore} / {totalFlashcards} </span> <button onClick={resetFlashcards} className="px-3 py-1 text-xs font-medium bg-brandNeutral-200 hover:bg-brandNeutral-300 text-brandTextPrimary rounded-md transition-colors"> Reset Deck </button> </div> </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {(activity.tags.flashcards || []).map((flashcard, originalIndex) => {
                              const isFlipped = flippedCardIndices.has(originalIndex); const isEliminating = eliminatingCardIndex === originalIndex; const isEliminated = eliminatedCardIndices.has(originalIndex);
                              if (isEliminated && !isEliminating) return null;
                              return (
                                <div key={originalIndex} className={`group [perspective:1000px] ${isEliminating ? 'animate-shrink-fade-out' : 'opacity-100'}`}>
                                  <div onClick={() => toggleFlashcardFlip(originalIndex)} className={`relative w-full h-32 rounded-lg shadow-lg cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleFlashcardFlip(originalIndex);}} aria-pressed={isFlipped} aria-label={`Flashcard: ${flashcard.term}. Click to flip.`}>
                                    <div className="absolute w-full h-full bg-brandPrimary-50 p-4 rounded-lg flex items-center justify-center text-center [backface-visibility:hidden]"> <p className="text-brandTextPrimary text-sm break-words select-none">{flashcard.term}</p> </div>
                                    <div className="absolute w-full h-full bg-brandAccent-100 p-4 rounded-lg flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]"> <p className="text-brandTextPrimary text-sm break-words select-none mb-2 flex-grow flex items-center">{flashcard.definition}</p> <button onClick={(e) => { e.stopPropagation(); eliminateFlashcard(originalIndex); }} className="mt-auto px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50" aria-label={`Mark card "${flashcard.term}" as "Got it"`}> Got it! ✔️ </button> </div>
                                  </div>
                                </div>);
                            })}
                          </div>
                          {((activity.tags.flashcards?.length || 0) - eliminatedCardIndices.size === 0) && totalFlashcards > 0 && ( <p className="text-center text-brandTextSecondary mt-4">All cards studied! Click "Reset Deck" to practice again.</p> )}
                        </div>
                      )}

                      {/* Details/Tags Section */}
                      {!isTextEnlarged && (!activity.tags.flashcards || activity.tags.flashcards.length === 0) && ( 
                          <div>
                              <h3 className="text-xl font-semibold text-brandTextPrimary mb-3">Details</h3>
                              {isEditModeActive && editableActivityData ? ( <div className="space-y-2"> {allTagsDisplayOrder.map(tagKey => ( <div key={tagKey}>{renderTagEditor(tagKey)}</div> ))} </div>
                              ) : (
                                <>
                                  {showAllDetailsInModal ? ( 
                                    <>
                                      <div className="flex flex-wrap gap-3">
                                          {allTagsDisplayOrder.map(tagKey => {
                                          const value = activity.tags[tagKey];
                                          if (tagKey === 'flashcards' || tagKey === 'teacher_instruction') return null; 
                                          if (Array.isArray(value) && value.length === 0 && typeof value[0] !== 'boolean') return null;
                                          if (typeof value === 'string' && value.trim() === '') return null;
                                          return ( <TagBadgeModal key={tagKey} label={formatTagName(String(tagKey))} value={value as string | boolean | string[]} color={tagColors[String(tagKey)] || 'bg-brandNeutral-200 text-brandNeutral-700'} /> )
                                          })}
                                      </div>
                                      {activity.tags.teacher_instruction && activity.tags.teacher_instruction.trim() !== '' && ( <div className="mt-4"> <h4 className="text-md font-semibold text-brandTextPrimary mb-1">{formatTagName('teacher_instruction')}:</h4> <p className="text-sm text-brandTextSecondary whitespace-pre-wrap bg-brandNeutral-100 p-3 rounded-md">{activity.tags.teacher_instruction}</p> </div> )}
                                    </>
                                  ) : ( 
                                      <div className="space-y-2">
                                          {(() => { 
                                              const mainCatVal = activity.tags.main_category; const subCategoryTagValue = activity.tags.sub_category; let combinedCategoryElements: string[] = [];
                                              if (mainCatVal && mainCatVal.trim() !== '' && mainCatVal.toLowerCase() !== 'none') combinedCategoryElements.push(mainCatVal);
                                              if (Array.isArray(subCategoryTagValue)) { const filteredSubs = subCategoryTagValue.map(s => String(s).trim()).filter(s => s !== '' && s.toLowerCase() !== 'none'); if (filteredSubs.length > 0) combinedCategoryElements.push(filteredSubs.join(', '));}
                                              const combinedCategory = combinedCategoryElements.join(' | ');
                                              if (combinedCategory && combinedCategory.trim() !== '') return ( <div className={`text-md px-3 py-1.5 rounded-lg ${tagColors['main_category'] || 'bg-brandPrimary-100 text-brandPrimary-800'} whitespace-normal break-words font-semibold`}> {combinedCategory} </div> );
                                              return null;
                                          })()}
                                          {activity.tags.activity_type && activity.tags.activity_type.length > 0 && ( <TagBadgeModal label={formatTagName('activity_type')} value={activity.tags.activity_type} color={tagColors['activity_type']} /> )}
                                          {(activity.tags.cefr_level && (Array.isArray(activity.tags.cefr_level) ? activity.tags.cefr_level.length > 0 : (activity.tags.cefr_level as string).trim() !== '')) && ( <TagBadgeModal label={formatTagName('cefr_level')} value={activity.tags.cefr_level} color={tagColors['cefr_level']} /> )}
                                          {activity.tags.group_size && activity.tags.group_size.length > 0 && ( <TagBadgeModal label="" value={activity.tags.group_size} color={tagColors['group_size']} /> )}
                                          {activity.tags.preparation_required && activity.tags.preparation_required.trim() !== '' && activity.tags.preparation_required.toLowerCase() !== 'none' && ( <TagBadgeModal label={formatTagName('preparation_required')} value={activity.tags.preparation_required} color={tagColors['preparation_required']} /> )}
                                          {activity.tags.sensitivity_warning === true && ( <TagBadgeModal label={formatTagName('sensitivity_warning')} value={true} color={tagColors['sensitivity_warning']} /> )}
                                          <TagBadgeModal label={formatTagName('classroom_community_bonding')} value={activity.tags.classroom_community_bonding} color={tagColors['classroom_community_bonding']} />
                                      </div>
                                  )}
                                  {!isEditModeActive && !isTextEnlarged && (
                                      <button onClick={() => setShowAllDetailsInModal(prev => !prev)} className="mt-4 px-3 py-1.5 text-xs font-medium text-brandPrimary-600 hover:text-brandPrimary-700 bg-brandPrimary-100 hover:bg-brandPrimary-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brandPrimary-300">
                                          {showAllDetailsInModal ? 'Show fewer details' : 'Show all details'}
                                      </button>
                                  )}
                                </>
                              )}
                          </div>
                      )}
                  </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-brandNeutral-100 border-t border-brandNeutral-200 flex justify-between items-center flex-shrink-0">
                <div> 
                      <button
                        onClick={handleShareActivity}
                        className="px-4 py-2 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 flex items-center space-x-2"
                        title="Copy link to this activity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                        </svg>
                        <span>Share</span>
                      </button>
                      {shareMessage && <span className="ml-2 text-xs text-brandPrimary-600">{shareMessage}</span>}
                  </div>
                  <div className="flex space-x-3"> 
                      {isEditModeActive && (
                          <button 
                              onClick={handleSaveChangesAndClose}
                              className="px-6 py-2 bg-brandAccent-500 text-white rounded-md hover:bg-brandAccent-600 transition-colors"
                          >
                              Save Changes & Close
                          </button>
                      )}
                      <button 
                          onClick={handleClose}
                          className="px-6 py-2 bg-brandNeutral-600 text-white rounded-md hover:bg-brandNeutral-700 transition-colors"
                      >
                          {isEditModeActive ? "Cancel & Close" : "Close"}
                      </button>
                  </div>
              </div>
            </>
        )}
      </div>

      {/* Adaptation Options Popup */}
      {isAdaptationOptionsPopupOpen && !showCopilotEmbed && ( 
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60] p-4" onClick={() => setIsAdaptationOptionsPopupOpen(false)}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-slide-down" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="adaptation-options-popup-title">
            <div className="flex justify-between items-center mb-4"> <h4 id="adaptation-options-popup-title" className="text-lg font-semibold text-brandTextPrimary"> Adaptation Options </h4> <button onClick={() => setIsAdaptationOptionsPopupOpen(false)} className="text-brandNeutral-500 hover:text-brandNeutral-700 p-1 rounded-full hover:bg-brandNeutral-100" aria-label="Close adaptation options"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> </button> </div>
            <label className="flex items-center space-x-2 text-sm text-brandTextSecondary cursor-pointer mb-2"> <input type="checkbox" checked={adaptToTheme} onChange={() => setAdaptToTheme(!adaptToTheme)} className="rounded text-brandPrimary-600 focus:ring-brandPrimary-500 border-brandNeutral-300" /> <span>Adapt description to a theme</span> </label> {adaptToTheme && ( <input type="text" value={themeInput} onChange={(e) => setThemeInput(e.target.value)} placeholder="Type your theme here" className="w-full p-1.5 border border-brandNeutral-300 rounded-md text-sm focus:ring-brandPrimary-500 focus:border-brandPrimary-500 text-brandTextPrimary bg-brandNeutral-50 mb-3" /> )}
            <label className="flex items-center space-x-2 text-sm text-brandTextSecondary cursor-pointer mb-2"> <input type="checkbox" checked={adaptForVocation} onChange={() => setAdaptForVocation(!adaptForVocation)} className="rounded text-brandPrimary-600 focus:ring-brandPrimary-500 border-brandNeutral-300" /> <span>Adapt for vocational relevance</span> </label> {adaptForVocation && ( <input type="text" value={vocationInput} onChange={(e) => setVocationInput(e.target.value)} placeholder="Type your vocation here" className="w-full p-1.5 border border-brandNeutral-300 rounded-md text-sm focus:ring-brandPrimary-500 focus:border-brandPrimary-500 text-brandTextPrimary bg-brandNeutral-50 mb-3" /> )}
            <label className="flex items-center space-x-2 text-sm text-brandTextSecondary cursor-pointer mb-4"> <input type="checkbox" checked={simplifyLanguage} onChange={() => setSimplifyLanguage(!simplifyLanguage)} className="rounded text-brandPrimary-600 focus:ring-brandPrimary-500 border-brandNeutral-300" /> <span>Simplify language</span> </label>
            <button onClick={handleGenerateAndCopyPromptAndRedirect} className="w-full mt-3 px-4 py-2 text-sm font-medium bg-brandAccent-500 hover:bg-brandAccent-600 text-white rounded-md transition-colors"> Copy Prompt & Open Copilot </button> {promptMessage && !showCopilotEmbed && ( <p className="text-xs text-center text-brandPrimary-600 mt-2">{promptMessage}</p> )}
            </div>
        </div>
        )}
    </div>
  );
};

export default ActivityModal;
