
import React, { useState } from 'react';
import { Activity, ActivityTags, Flashcard } from '../types.js'; // Added Flashcard for type safety if needed, though not directly used in rendering here

interface ActivityCardProps {
  activity: Activity;
  onViewActivityInModal: (activity: Activity) => void;
  isEditModeActive?: boolean; // Optional for now, make required if always passed
  onDeleteRequest?: (activity: Activity) => void; // Optional for now
}

// Brighter, more harmonious palette for tags on a light background
const categoryColorPalette = [
  'bg-brandPrimary-100 text-brandPrimary-800', // Light Sky Blue BG, Dark Blue Text
  'bg-brandAccent-100 text-brandAccent-800',   // Light Amber BG, Dark Amber Text
  'bg-brandPrimary-200 text-brandPrimary-900', 
  'bg-brandAccent-200 text-brandAccent-900',
  'bg-brandNeutral-200 text-brandNeutral-800', // Light Slate BG, Dark Slate Text
  'bg-brandPrimary-500 text-white',            // Solid Sky Blue BG, White Text
  'bg-brandAccent-500 text-white',             // Solid Amber BG, White Text
];


function getCategoryColor(categoryName: string | undefined): string {
  if (!categoryName) {
    return 'bg-brandNeutral-200 text-brandNeutral-700'; 
  }
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    const char = categoryName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; 
  }
  const index = Math.abs(hash) % categoryColorPalette.length;
  return categoryColorPalette[index];
}


const TagBadge: React.FC<{ label: string; value?: string | boolean | string[]; color?: string; isMainCategory?: boolean }> = ({ label, value, color, isMainCategory = false }) => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0 && !(typeof value[0] === 'boolean'))) { 
    if (typeof value === 'string' && value.toLowerCase() === 'none') return null;
    if (Array.isArray(value) && value.length === 0) return null;
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ) return null;
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

  const textSizeClass = isMainCategory ? 'text-sm px-2.5 py-1' : 'text-xs px-2 py-0.5';
  const defaultColor = isMainCategory 
    ? 'bg-brandPrimary-100 text-brandPrimary-800' 
    : 'bg-brandNeutral-100 text-brandNeutral-700';


  return (
    <div className={`${textSizeClass} rounded-full ${color || defaultColor} whitespace-nowrap`}>
      {!isMainCategory && <span className="font-semibold">{label}:</span>} {displayValue}
    </div>
  );
};

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onViewActivityInModal, isEditModeActive, onDeleteRequest }) => {
  const [areDetailsVisible, setAreDetailsVisible] = useState(false);

  const toggleDetailsVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAreDetailsVisible(!areDetailsVisible);
  };

  const handleCardClick = () => {
    // Corrected: Modal should open in edit mode too for editing.
    // The delete button's stopPropagation handles preventing modal on delete click.
    onViewActivityInModal(activity);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from opening modal
    if (onDeleteRequest) {
      onDeleteRequest(activity);
    }
  };
  
  const tagDisplayOrder: (keyof ActivityTags)[] = [
    'sub_category', 'cefr_level', 'group_size', 
    'preparation_required', 'materials_resources', 'activity_type', 
    'classroom_community_bonding', 'sensitivity_warning', 'thematically_adaptable'
  ];

  const tagColors: Record<string, string> = { 
    sub_category: 'bg-brandPrimary-100 text-brandPrimary-800', // Light Sky
    cefr_level: 'bg-brandAccent-100 text-brandAccent-800',   // Light Amber
    group_size: 'bg-sky-200 text-sky-900',
    preparation_required: 'bg-amber-200 text-amber-900',
    materials_resources: 'bg-blue-200 text-blue-900', // Adjusted
    sensitivity_warning: 'bg-red-100 text-red-800', // Kept red for warning
    activity_type: 'bg-teal-100 text-teal-800', // Using teal for variety, good on light bg
    classroom_community_bonding: 'bg-pink-100 text-pink-800', // Kept pink
    thematically_adaptable: 'bg-lime-100 text-lime-800', // Kept lime
  };

  const formatTagName = (tagName: string): string => {
    return tagName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  const originalMainCategoryValue = activity.tags.main_category;
  let mainCategoryDisplayValue = originalMainCategoryValue;

  if (originalMainCategoryValue === "Skills") {
    const subCategories = activity.tags.sub_category; // subCategories is string[]
    let subCategoryString = '';
    if (Array.isArray(subCategories) && subCategories.length > 0) {
      subCategoryString = subCategories
        .map(s => String(s).trim())
        .filter(s => s !== '' && s.toLowerCase() !== 'none')
        .join(', ');
    }
    // The 'else if (typeof subCategories === "string")' block was removed 
    // as 'subCategories' is typed as 'string[]' and cannot be a direct string.
    
    if (subCategoryString) {
      mainCategoryDisplayValue = `${originalMainCategoryValue} | ${subCategoryString}`;
    }
  }


  return (
    <div 
      className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full transform hover:scale-[1.02] transition-transform duration-200 ${!isEditModeActive ? 'cursor-pointer' : ''} border border-brandNeutral-200 hover:border-brandPrimary-300 relative`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
      aria-label={`View details for ${activity.title}`}
    >
      {isEditModeActive && onDeleteRequest && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 bg-brandFunctionalRed text-white p-1.5 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 z-10"
          aria-label={`Delete activity ${activity.title}`}
          title={`Delete ${activity.title}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c-.34-.059-.68-.114-1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      )}
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-brandPrimary-700 mb-2">
          {activity.title} 
        </h3>
        {originalMainCategoryValue && (
          <div className="mb-3">
            <TagBadge
              label="Main Category" 
              value={mainCategoryDisplayValue}
              color={getCategoryColor(originalMainCategoryValue)}
              isMainCategory={true}
            />
          </div>
        )}
        <p className="text-brandTextSecondary mb-4 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
          {activity.full_description}
        </p>
      </div>

      <div className="px-6 pb-4">
        <button
          onClick={toggleDetailsVisibility}
          className="text-sm text-brandPrimary-600 hover:text-brandPrimary-700 font-medium focus:outline-none focus:ring-2 focus:ring-brandPrimary-500 focus:ring-opacity-50 rounded py-1 px-2 mb-2 inline-flex items-center space-x-1"
          aria-expanded={areDetailsVisible}
          aria-controls={`details-${activity.title.replace(/\s+/g, '-')}`}
        >
          <span>{areDetailsVisible ? 'Hide Details' : 'Show Details'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${areDetailsVisible ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      
      {areDetailsVisible && (
        <div id={`details-${activity.title.replace(/\s+/g, '-')}`} className="p-6 pt-0 bg-brandNeutral-50 border-t border-brandNeutral-200">
          <h4 className="text-sm font-semibold text-brandTextSecondary mb-3">Details:</h4>
          <div className="flex flex-wrap gap-2">
            {tagDisplayOrder.map(tagKey => {
               const value = activity.tags[tagKey];
               // Skip main_category here as it's displayed above. Skip flashcards as they have custom display.
               if (tagKey === 'main_category' || tagKey === 'flashcards') return null; 
               // Skip sub_category if main_category is "Skills" because it's already combined above in the card's main tag.
               if (activity.tags.main_category === "Skills" && tagKey === 'sub_category') return null;

               return (
                  <TagBadge 
                      key={tagKey} 
                      label={formatTagName(tagKey)} 
                      value={value as string | boolean | string[]} // Assert type after filtering
                      color={tagColors[tagKey] || 'bg-brandNeutral-100 text-brandNeutral-700'} 
                  />
               )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
