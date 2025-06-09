
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, ActivityTags, FilterOptions, Flashcard } from '../types.ts';
import LoadingSpinner from './shared/LoadingSpinner.tsx';

// Reusable TagBadgeModal from ActivityModal (or a simplified version)
const TagBadgeDisplay: React.FC<{ label: string; value?: string | boolean | string[]; color?: string }> = ({ label, value, color = 'bg-brandNeutral-200 text-brandNeutral-700' }) => {
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

const tagColors: Record<string, string> = {
    main_category: 'bg-brandPrimary-100 text-brandPrimary-800',
    sub_category: 'bg-sky-100 text-sky-800', 
    cefr_level: 'bg-green-100 text-green-800', 
    group_size: 'bg-indigo-100 text-indigo-800', 
    preparation_required: 'bg-brandAccent-100 text-brandAccent-800', 
    materials_resources: 'bg-purple-100 text-purple-800', 
    sensitivity_warning: 'bg-red-100 text-red-800', 
    activity_type: 'bg-teal-100 text-teal-800', 
    classroom_community_bonding: 'bg-pink-100 text-pink-800', 
    thematically_adaptable: 'bg-lime-100 text-lime-800', 
    teacher_instruction: 'bg-yellow-100 text-yellow-800',
  };
  
const formatTagName = (tagName: string): string => {
    return tagName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};


interface ActivityEmbedViewProps {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  globalFilterOptions: FilterOptions | null; // For tag colors and formatting, if needed
}

const ActivityEmbedView: React.FC<ActivityEmbedViewProps> = ({ activities, isLoading, error, globalFilterOptions }) => {
  const { activityId } = useParams<{ activityId: string }>();
  const [activity, setActivity] = useState<Activity | null | undefined>(null); // undefined for not found
  const [flippedCardIndices, setFlippedCardIndices] = useState<Set<number>>(new Set()); // Flashcard state

  useEffect(() => {
    if (!isLoading && activities.length > 0 && activityId) {
      const foundActivity = activities.find(act => act.id === activityId);
      setActivity(foundActivity || undefined); // Set to undefined if not found
       if (foundActivity) {
           document.title = `${foundActivity.title} - Activity Details`;
       } else {
           document.title = "Activity Not Found";
       }
    } else if (!isLoading && activities.length === 0 && !error) {
        setActivity(undefined); // No activities loaded yet, but no error, treat as not found for now
        document.title = "Activity Not Found";
    }
  }, [activityId, activities, isLoading, error]);

  // Flashcard handlers (simplified, no elimination for embed view for now)
  const toggleFlashcardFlip = (index: number) => {
    setFlippedCardIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index); else newSet.add(index);
      return newSet;
    });
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-brandPageBg"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="flex flex-col justify-center items-center h-screen bg-brandPageBg text-brandFunctionalRed p-4 text-center">Error: {error}</div>;
  }

  if (activity === undefined) {
    return <div className="flex flex-col justify-center items-center h-screen bg-brandPageBg text-brandTextPrimary p-4 text-center">Activity not found.</div>;
  }
  if (!activity) {
     return <div className="flex justify-center items-center h-screen bg-brandPageBg"><LoadingSpinner /></div>; // Still finding activity
  }

  const allTagsDisplayOrder: (keyof ActivityTags)[] = [
    'main_category', 'sub_category', 'cefr_level', 'group_size', 
    'preparation_required', 'materials_resources', 'activity_type', 
    'classroom_community_bonding', 'sensitivity_warning', 'thematically_adaptable', 'teacher_instruction'
  ];

  return (
    <div className="min-h-screen bg-brandNeutral-50 p-4 sm:p-6 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-6 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-brandPrimary-700 border-b pb-4 mb-6">{activity.title}</h1>
        
        {activity.tags.teacher_instruction && activity.tags.teacher_instruction.trim() !== '' && (
             <div className={`mb-4 p-3 bg-yellow-100 border border-yellow-200 rounded-md shadow-sm text-sm`}>
                <p className="font-semibold text-yellow-800 mb-1">Teacher Note:</p>
                <p className="text-yellow-700 whitespace-pre-wrap">
                    {activity.tags.teacher_instruction}
                </p>
            </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-brandTextPrimary mb-2">Description</h2>
          <p className="text-brandTextSecondary whitespace-pre-wrap text-base leading-relaxed">{activity.full_description}</p>
        </div>

        {activity.tags.flashcards && activity.tags.flashcards.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-brandTextPrimary mb-3">Flashcards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activity.tags.flashcards.map((flashcard, index) => {
                const isFlipped = flippedCardIndices.has(index);
                return (
                  <div key={index} className="group [perspective:1000px]">
                    <div
                      onClick={() => toggleFlashcardFlip(index)}
                      className={`relative w-full h-32 rounded-lg shadow-lg cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${
                        isFlipped ? '[transform:rotateY(180deg)]' : ''
                      }`}
                       role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleFlashcardFlip(index);}} aria-pressed={isFlipped}
                       aria-label={`Flashcard: ${flashcard.term}. Click to flip.`}
                    >
                      <div className="absolute w-full h-full bg-brandPrimary-50 p-4 rounded-lg flex items-center justify-center text-center [backface-visibility:hidden]">
                        <p className="text-brandTextPrimary text-sm break-words select-none">{flashcard.term}</p>
                      </div>
                      <div className="absolute w-full h-full bg-brandAccent-100 p-4 rounded-lg flex items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        <p className="text-brandTextPrimary text-sm break-words select-none">{flashcard.definition}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-brandTextPrimary mb-3">Details</h2>
          <div className="flex flex-wrap gap-3">
            {allTagsDisplayOrder.map(tagKey => {
              const value = activity.tags[tagKey];
              if (tagKey === 'flashcards' || tagKey === 'teacher_instruction') return null; // Handled separately
              if (tagKey === 'main_category') { // Combine main and sub for skills if applicable
                let displayValue = activity.tags.main_category;
                if (activity.tags.main_category === "Skills" && activity.tags.sub_category && activity.tags.sub_category.length > 0) {
                    const subString = Array.isArray(activity.tags.sub_category) ? activity.tags.sub_category.join(', ') : activity.tags.sub_category;
                    displayValue = `${displayValue} | ${subString}`;
                }
                return <TagBadgeDisplay key={tagKey} label="" value={displayValue} color={tagColors[tagKey] || 'bg-brandPrimary-100 text-brandPrimary-800'} />;
              }
              if (activity.tags.main_category === "Skills" && tagKey === 'sub_category') return null; // Already combined

              if (Array.isArray(value) && value.length === 0 && typeof value[0] !== 'boolean') return null;
              if (typeof value === 'string' && value.trim() === '') return null;
               if (value === undefined || (typeof value === 'string' && value.toLowerCase() === 'none')) return null;


              return (
                <TagBadgeDisplay
                    key={tagKey} 
                    label={formatTagName(String(tagKey))} 
                    value={value as string | boolean | string[]} 
                    color={tagColors[String(tagKey)] || 'bg-brandNeutral-200 text-brandNeutral-700'} 
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityEmbedView;