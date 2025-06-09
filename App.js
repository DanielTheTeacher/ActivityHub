
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Activity, ActivityTags, FilterOptions, Filters, CefrRangeFilter } from './types.js';
import FilterPanel from './components/FilterPanel.js';
import ActivityCard from './components/ActivityCard.js';
import LoadingSpinner from './components/shared/LoadingSpinner.js';
import NoResultsFound from './components/shared/NoResultsFound.js';
import ActivityModal from './components/ActivityModal.js';
import GlobalToolsPanel from './components/shared/GlobalToolsPanel.js';
import ConfirmationDialog from './components/shared/ConfirmationDialog.js';
import { useSearchParams, Routes, Route, useParams } from 'react-router-dom';
import ActivityEmbedView from './components/ActivityEmbedView.js';
import DisclaimerPage from './components/DisclaimerPage.js'; // Added import

const CEFR_LEVELS_ORDERED = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const slugify = (text: string, fallback: string = 'unknown-activity'): string => {
  if (!text || typeof text !== 'string' || text.trim() === '') return fallback;
  return text
    .toString().toLowerCase().trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '') // Remove special characters
    .replace(/--+/g, '-') // Replace multiple - with single -
    .substring(0, 75); // Max length
};

const MainAppLayout: React.FC<{
  allActivities: Activity[];
  filteredActivities: Activity[];
  isLoading: boolean;
  filterOptions: FilterOptions | null;
  filters: Filters;
  handleFilterChange: (newFilters: Partial<Filters>) => void;
  clearFilters: () => void;
  handleDownloadUpdatedJson: () => void;
  isEditModeActive: boolean;
  toggleEditMode: () => void;
  handleOpenModal: (activity: Activity) => void;
  openDeleteConfirmationDialog: (activity: Activity) => void;
  isGlobalToolsPanelOpen: boolean;
  toggleGlobalToolsPanel: () => void;
  isToolSuggestedForModal: boolean;
  isModalOpen: boolean;
  isDeleteConfirmationOpen: boolean;
}> = ({
  allActivities,
  filteredActivities,
  isLoading,
  filterOptions,
  filters,
  handleFilterChange,
  clearFilters,
  handleDownloadUpdatedJson,
  isEditModeActive,
  toggleEditMode,
  handleOpenModal,
  openDeleteConfirmationDialog,
  isGlobalToolsPanelOpen,
  toggleGlobalToolsPanel,
  isToolSuggestedForModal,
  isModalOpen,
  isDeleteConfirmationOpen,
}) => (
  <div className={`min-h-screen flex flex-col lg:flex-row bg-brandPageBg relative ${isModalOpen || isDeleteConfirmationOpen ? 'blur-sm pointer-events-none' : ''}`}>
    {filterOptions && (
      <FilterPanel
        options={filterOptions}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onDownloadJson={handleDownloadUpdatedJson}
        isEditModeActive={isEditModeActive}
        onToggleEditMode={toggleEditMode}
      />
    )}
    <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out relative z-0 ${isGlobalToolsPanelOpen ? 'lg:mr-[320px]' : 'mr-0'}`}>
      <div className="mb-6 text-brandTextSecondary">
        Showing {filteredActivities.length} of {allActivities.length} activities.
      </div>
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredActivities.map((activity, index) => (
            <ActivityCard
                key={activity.id || `${activity.title}-${index}-${isEditModeActive}`}
                activity={activity}
                onViewActivityInModal={handleOpenModal}
                isEditModeActive={isEditModeActive}
                onDeleteRequest={openDeleteConfirmationDialog}
            />
          ))}
        </div>
      ) : (
        !isLoading && <NoResultsFound />
      )}
    </main>
  </div>
);


const App: React.FC = () => {
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedActivityForModal, setSelectedActivityForModal] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editedDescriptions, setEditedDescriptions] = useState<Record<string, string>>({});

  const [isGlobalToolsPanelOpen, setIsGlobalToolsPanelOpen] = useState<boolean>(false);
  const [showDiceGlobal, setShowDiceGlobal] = useState<boolean>(false);
  const [showTimerGlobal, setShowTimerGlobal] = useState<boolean>(false);
  const [showScoreCounterGlobal, setShowScoreCounterGlobal] = useState<boolean>(false);
  const [showSpinnyWheelGlobal, setShowSpinnyWheelGlobal] = useState<boolean>(false);
  const [showRandomTeamGeneratorGlobal, setShowRandomTeamGeneratorGlobal] = useState<boolean>(false); // Added
  const [isToolSuggestedForModal, setIsToolSuggestedForModal] = useState<boolean>(false);

  const [pulseDice, setPulseDice] = useState(false);
  const [pulseTimer, setPulseTimer] = useState(false);
  const [pulseScore, setPulseScore] = useState(false);
  const [pulseSpinnyWheel, setPulseSpinnyWheel] = useState(false);
  const [pulseRandomTeamGenerator, setPulseRandomTeamGenerator] = useState(false); // Added

  const [isEditModeActive, setIsEditModeActive] = useState<boolean>(false);

  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false);


  const toggleGlobalToolsPanel = () => setIsGlobalToolsPanelOpen(prev => !prev);
  const toggleDiceGlobal = () => setShowDiceGlobal(prev => !prev);
  const toggleTimerGlobal = () => setShowTimerGlobal(prev => !prev);
  const toggleScoreCounterGlobal = () => setShowScoreCounterGlobal(prev => !prev);
  const toggleSpinnyWheelGlobal = () => setShowSpinnyWheelGlobal(prev => !prev);
  const toggleRandomTeamGeneratorGlobal = () => setShowRandomTeamGeneratorGlobal(prev => !prev); // Added

  const triggerDicePulse = useCallback(() => {
    setPulseDice(true);
    setTimeout(() => setPulseDice(false), 2500);
  }, []);
  const triggerTimerPulse = useCallback(() => {
    setPulseTimer(true);
    setTimeout(() => setPulseTimer(false), 2500);
  }, []);
  const triggerScorePulse = useCallback(() => {
    setPulseScore(true);
    setTimeout(() => setPulseScore(false), 2500);
  }, []);
  // const triggerSpinnyWheelPulse = useCallback(() => {
  //   setPulseSpinnyWheel(true);
  //   setTimeout(() => setPulseSpinnyWheel(false), 2500);
  // }, []);
  // const triggerRandomTeamGeneratorPulse = useCallback(() => { // For future use
  //   setPulseRandomTeamGenerator(true);
  //   setTimeout(() => setPulseRandomTeamGenerator(false), 2500);
  // }, []);

  const toggleEditMode = () => {
    setIsEditModeActive(prev => {
      if (prev) {
        // console.log("Exiting Edit Mode.");
      } else {
        // console.log("Entering Edit Mode. Modifications can be permanently saved to activities.");
        setEditedDescriptions({});
      }
      return !prev;
    });
  };

  useEffect(() => {
    const originalTitle = "Classroom Activity Finder";
    if (isEditModeActive) {
      document.title = `${originalTitle} - (Edit Mode)`;
    } else {
      document.title = originalTitle;
    }
  }, [isEditModeActive]);

  const initialFilters: Filters = useMemo(() => {
    const cefrMinFromUrl = searchParams.get('cefr_min');
    const cefrMaxFromUrl = searchParams.get('cefr_max');

    const defaultMinCefr = CEFR_LEVELS_ORDERED[0];
    const defaultMaxCefr = CEFR_LEVELS_ORDERED[CEFR_LEVELS_ORDERED.length - 1];

    return {
      searchTerm: searchParams.get('searchTerm') || '',
      main_category: searchParams.get('main_category') || '',
      sub_category: searchParams.get('sub_category') || '',
      cefr_level: {
        min: cefrMinFromUrl && CEFR_LEVELS_ORDERED.includes(cefrMinFromUrl) ? cefrMinFromUrl : defaultMinCefr,
        max: cefrMaxFromUrl && CEFR_LEVELS_ORDERED.includes(cefrMaxFromUrl) ? cefrMaxFromUrl : defaultMaxCefr,
      },
      group_size: searchParams.get('group_size')?.split(',').filter(Boolean) || [],
      preparation_required: searchParams.get('preparation_required') || '',
      materials_resources: searchParams.get('materials_resources')?.split(',').filter(Boolean) || [],
      avoid_sensitive_topics: searchParams.get('avoid_sensitive_topics') === 'true' || false,
      activity_type: searchParams.get('activity_type')?.split(',').filter(Boolean) || [],
      classroom_community_bonding: searchParams.get('classroom_community_bonding') === 'true' || false,
      thematically_adaptable: searchParams.get('thematically_adaptable') === 'true' || false,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<Filters>(initialFilters);

  useEffect(() => {
    const fetchAllActivities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [activitiesResponse, skillsResponse, fuelboxResponse] = await Promise.all([
          fetch('./data/activities.json'),
          fetch('./data/skills.json'),
          fetch('./data/fuelbox_questions.json')
        ]);

        if (!activitiesResponse.ok) {
          throw new Error(`HTTP error! status for activities.json: ${activitiesResponse.status}`);
        }
        if (!skillsResponse.ok) {
          throw new Error(`HTTP error! status for skills.json: ${skillsResponse.status}`);
        }
        if (!fuelboxResponse.ok) {
          throw new Error(`HTTP error! status for fuelbox_questions.json: ${fuelboxResponse.status}`);
        }

        const activitiesData = await activitiesResponse.json();
        const skillsData = await skillsResponse.json();
        const fuelboxData = await fuelboxResponse.json();

        if (!Array.isArray(activitiesData)) {
          throw new Error('Fetched data from \'activities.json\' is not an array.');
        }
        if (!Array.isArray(skillsData)) {
          throw new Error('Fetched data from \'skills.json\' is not an array.');
        }
        if (!Array.isArray(fuelboxData)) {
          throw new Error('Fetched data from \'fuelbox_questions.json\' is not an array.');
        }

        const combinedRawActivities = [
          ...(activitiesData as Omit<Activity, 'id'>[]),
          ...(skillsData as Omit<Activity, 'id'>[]),
          ...(fuelboxData as Omit<Activity, 'id'>[])
        ];

        // De-duplicate based on title
        const deduplicatedRawActivities: Omit<Activity, 'id'>[] = [];
        const titlesSeen = new Set<string>();

        for (const activity of combinedRawActivities) {
          if (activity.title && !titlesSeen.has(activity.title)) {
            deduplicatedRawActivities.push(activity);
            titlesSeen.add(activity.title);
          } else if (!activity.title) { // Handle activities with no title (though unlikely based on structure)
            deduplicatedRawActivities.push(activity);
          }
        }

        const activitiesWithIds: Activity[] = [];
        const slugCounts: Record<string, number> = {};

        const defaultActivityTags: ActivityTags = {
          main_category: '',
          sub_category: [],
          cefr_level: [],
          group_size: [],
          preparation_required: '',
          materials_resources: [],
          sensitivity_warning: false,
          activity_type: [],
          classroom_community_bonding: false,
          thematically_adaptable: false,
          flashcards: undefined,
          teacher_instruction: undefined,
        };

        deduplicatedRawActivities.forEach((activity, index) => {
          let baseSlug = slugify(activity.title, `activity-${index}`);
          let slug = baseSlug;
          if (slugCounts[baseSlug]) {
            slugCounts[baseSlug]++;
            slug = `${baseSlug}-${slugCounts[baseSlug]}`;
          } else {
            slugCounts[baseSlug] = 1;
          }
          // Ensure all activities have a tags object that conforms to ActivityTags
          const ensuredTags: ActivityTags = {
            ...defaultActivityTags,
            ...(activity.tags || {}), // Spread existing tags over defaults
          };

          const activityToAdd: Activity = {
            // Spread properties from activity (Omit<Activity, 'id'>)
            // title, full_description are from activity.
            // activity.tags is overridden by ensuredTags.
            title: activity.title,
            full_description: activity.full_description,
            tags: ensuredTags,
            id: slug, // Add the generated id
          };
          activitiesWithIds.push(activityToAdd);
        });

        setAllActivities(activitiesWithIds);

      } catch (e) {
        console.error("Failed to load activities:", e);
        if (e instanceof SyntaxError) {
          setError(`Failed to parse JSON data. Please ensure it's a valid JSON array. Details: ${e.message}`);
        } else if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred while loading activities.");
        }
        setAllActivities([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllActivities();
  }, []);

  const extractUniqueTagValues = useCallback((activities: Activity[], tagKey: keyof ActivityTags): string[] => {
    const values = new Set<string>();
    activities.forEach(activity => {
      // Ensure activity.tags exists before trying to access its properties
      if (!activity.tags) return;

      const tagValue = activity.tags[tagKey];
      if (tagValue === undefined || tagValue === null) return;
      if (tagKey === 'flashcards') return;

      if (Array.isArray(tagValue)) {
        tagValue.forEach(item => {
          if (typeof item === 'string' && item.trim() !== '' && item.toLowerCase() !== 'none') {
            values.add(item.trim());
          } else if (typeof item === 'boolean') {
             values.add(item ? "Yes" : "No");
          }
        });
      } else if (typeof tagValue === 'boolean') {
         // For boolean properties like sensitivity_warning, classroom_community_bonding, thematically_adaptable,
         // we handle their filtering directly and don't need "Yes"/"No" in FilterOptions typically.
         // However, if you explicitly wanted to offer "Yes"/"No" as filter choices for *any* boolean tag, this could be reinstated.
         // For now, this specific case is not needed for the new 'avoid_sensitive_topics' filter.
         // values.add(tagValue ? "Yes" : "No");
      } else if (typeof tagValue === 'string') {
        if (tagValue.trim() !== '' && tagValue.toLowerCase() !== 'none') {
          values.add(tagValue.trim());
        }
      }
    });

    const sortedValues = Array.from(values);
    if (tagKey === 'cefr_level') {
        sortedValues.sort((a, b) => CEFR_LEVELS_ORDERED.indexOf(a) - CEFR_LEVELS_ORDERED.indexOf(b));
    } else {
        sortedValues.sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
    }
    return sortedValues;
  }, []);

  useEffect(() => {
    if (allActivities.length > 0) {
      const mainCategories = extractUniqueTagValues(allActivities, 'main_category');
      const subCategoriesByMain: Record<string, string[]> = {};

      mainCategories.forEach(mainCat => {
        const relevantActivities = allActivities.filter(act => act.tags && act.tags.main_category === mainCat);
        const subCatSet = new Set<string>();
        relevantActivities.forEach(relAct => {
          // Ensure relAct.tags exists
          if (!relAct.tags) return;
          const subCategoryTagValue = relAct.tags.sub_category as unknown;

          if (Array.isArray(subCategoryTagValue)) {
            subCategoryTagValue.forEach(sc => {
              if (typeof sc === 'string' && sc.trim() !== '' && sc.toLowerCase() !== 'none') {
                subCatSet.add(sc.trim());
              }
            });
          } else if (typeof subCategoryTagValue === 'string') {
            if (subCategoryTagValue.trim() !== '' && subCategoryTagValue.toLowerCase() !== 'none') {
              subCatSet.add(subCategoryTagValue.trim());
            }
          }
        });
        subCategoriesByMain[mainCat] = Array.from(subCatSet).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
      });

      const extractedCefrLevels = extractUniqueTagValues(allActivities, 'cefr_level');

      setFilterOptions({
        main_category: mainCategories,
        sub_category_options: subCategoriesByMain,
        cefr_level: extractedCefrLevels.length > 0 ? extractedCefrLevels : CEFR_LEVELS_ORDERED,
        group_size: extractUniqueTagValues(allActivities, 'group_size'),
        preparation_required: extractUniqueTagValues(allActivities, 'preparation_required'),
        materials_resources: extractUniqueTagValues(allActivities, 'materials_resources'),
        activity_type: extractUniqueTagValues(allActivities, 'activity_type'),
        classroom_community_bonding: extractUniqueTagValues(allActivities, 'classroom_community_bonding'),
      });
    }
  }, [allActivities, extractUniqueTagValues]);

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      const params = new URLSearchParams();

      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          params.delete(key);
          if (key === 'cefr_level') {
            params.delete('cefr_min');
            params.delete('cefr_max');
          }
          return;
        }

        if (key === 'cefr_level') {
          const cefrValue = value as CefrRangeFilter;
          const defaultMin = filterOptions?.cefr_level?.[0] || CEFR_LEVELS_ORDERED[0];
          const defaultMax = filterOptions?.cefr_level?.[filterOptions.cefr_level.length - 1] || CEFR_LEVELS_ORDERED[CEFR_LEVELS_ORDERED.length - 1];

          if (cefrValue.min !== defaultMin) {
            params.set('cefr_min', cefrValue.min);
          } else {
            params.delete('cefr_min');
          }
          if (cefrValue.max !== defaultMax) {
            params.set('cefr_max', cefrValue.max);
          } else {
            params.delete('cefr_max');
          }
        } else if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(','));
          else params.delete(key);
        } else if (typeof value === 'boolean') {
           if (key === 'classroom_community_bonding' || key === 'thematically_adaptable' || key === 'avoid_sensitive_topics') {
            if (value) params.set(key, String(value));
            else params.delete(key);
           }
        } else if (String(value).trim() !== '') {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });
      setSearchParams(params, { replace: true });
      return updatedFilters;
    });
  }, [setSearchParams, filterOptions]);

  const clearFilters = useCallback(() => {
    const defaultMinCefr = filterOptions?.cefr_level?.[0] || CEFR_LEVELS_ORDERED[0];
    const defaultMaxCefr = filterOptions?.cefr_level?.[filterOptions.cefr_level.length - 1] || CEFR_LEVELS_ORDERED[CEFR_LEVELS_ORDERED.length - 1];

    const cleared: Filters = {
      searchTerm: '', main_category: '', sub_category: '',
      cefr_level: { min: defaultMinCefr, max: defaultMaxCefr },
      group_size: [], preparation_required: '', materials_resources: [],
      avoid_sensitive_topics: false, 
      activity_type: [],
      classroom_community_bonding: false,
      thematically_adaptable: false,
    };
    setFilters(cleared);
    setSearchParams({}, {replace: true});
  }, [setSearchParams, filterOptions]);

  useEffect(() => {
    if (allActivities.length === 0 || !filterOptions) {
      setFilteredActivities(isLoading ? [] : allActivities);
      return;
    }
    let currentActivities = [...allActivities];

    // Ensure all activities being filtered have a .tags property
    currentActivities = currentActivities.filter(activity => activity.tags);

    const searchTermString = filters.searchTerm;
    if (searchTermString && typeof searchTermString === 'string') {
      const searchTermLower = searchTermString.toLowerCase();
      currentActivities = currentActivities.filter(activity =>
        (activity.title && typeof activity.title === 'string' && (activity.title as string).toLowerCase().includes(searchTermLower)) ||
        (activity.full_description && typeof activity.full_description === 'string' && (activity.full_description as string).toLowerCase().includes(searchTermLower))
      );
    }

    // CEFR Level Filter
    const defaultMinCefr = CEFR_LEVELS_ORDERED[0];
    const defaultMaxCefr = CEFR_LEVELS_ORDERED[CEFR_LEVELS_ORDERED.length - 1];
    const isCefrFilterActive = !(filters.cefr_level.min === defaultMinCefr && filters.cefr_level.max === defaultMaxCefr);

    if (isCefrFilterActive && filters.cefr_level && filters.cefr_level.min && filters.cefr_level.max) {
        const minCefrIndex = CEFR_LEVELS_ORDERED.indexOf(filters.cefr_level.min);
        const maxCefrIndex = CEFR_LEVELS_ORDERED.indexOf(filters.cefr_level.max);

        if (minCefrIndex !== -1 && maxCefrIndex !== -1 && minCefrIndex <= maxCefrIndex) {
            currentActivities = currentActivities.filter(activity => {
                const activityCefrLevels = activity.tags.cefr_level;
                // If a specific CEFR range is active, activities MUST have a CEFR level,
                // and at least one must fall within the range.
                if (Array.isArray(activityCefrLevels) && activityCefrLevels.length > 0) {
                    return activityCefrLevels.some(level => {
                        const levelIndex = CEFR_LEVELS_ORDERED.indexOf(level);
                        return levelIndex !== -1 && levelIndex >= minCefrIndex && levelIndex <= maxCefrIndex;
                    });
                }
                return false; // Exclude if no CEFR levels specified and a filter IS active
            });
        }
    }
    // If CEFR filter is NOT active (i.e., it's A1-C2), this whole block is skipped,
    // so activities with empty cefr_level arrays are NOT filtered out by this specific CEFR block.


    (['main_category', 'sub_category', 'preparation_required'] as const).forEach(key => {
      const filterValue = filters[key];
      if (filterValue && typeof filterValue === 'string') {
        currentActivities = currentActivities.filter(activity => {
          const activityTagValue = activity.tags[key];
          if (Array.isArray(activityTagValue)) {
            return (activityTagValue as string[]).includes(filterValue);
          } else if (typeof activityTagValue === 'string') {
            return activityTagValue === filterValue;
          }
          return false;
        });
      }
    });
    (['group_size', 'materials_resources', 'activity_type'] as const).forEach(key => {
      const selectedOptions = filters[key];
      if (selectedOptions && selectedOptions.length > 0) {
        currentActivities = currentActivities.filter(activity => {
          const activityTagValues = activity.tags[key] as string[];
          if (Array.isArray(activityTagValues)) {
            return selectedOptions.every(opt => activityTagValues.includes(opt));
          }
          return false;
        });
      }
    });

    if (filters.avoid_sensitive_topics) {
      currentActivities = currentActivities.filter(activity =>
        activity.tags.sensitivity_warning === false
      );
    }

    if (filters.classroom_community_bonding) {
        currentActivities = currentActivities.filter(activity =>
            activity.tags.classroom_community_bonding === true
        );
    }
    if (filters.thematically_adaptable) {
      currentActivities = currentActivities.filter(activity =>
        activity.tags.thematically_adaptable === true
      );
    }
    setFilteredActivities(currentActivities);
  }, [filters, allActivities, filterOptions, isLoading]);

  useEffect(() => {
    if (isModalOpen && selectedActivityForModal && selectedActivityForModal.tags) {
      const activityTypes = selectedActivityForModal.tags.activity_type;
      let suggested = false;
      if (Array.isArray(activityTypes)) {
        if (activityTypes.includes("Games & Quizzes")) {
          suggested = true;
        }
        if (activityTypes.some(type => ["Presentation & Speaking", "Discussion & Debate", "Writing", "Role-play & Acting", "Problem Solving"].includes(type))) {
          suggested = true;
        }
      }
      setIsToolSuggestedForModal(suggested);
    } else {
      setIsToolSuggestedForModal(false);
    }
  }, [isModalOpen, selectedActivityForModal]);

  const handleOpenModal = (activity: Activity) => {
    setSelectedActivityForModal(activity);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
    if (activity.tags) { // Ensure tags exist
        const activityTypes = activity.tags.activity_type;
        if (Array.isArray(activityTypes)) {
            if (activityTypes.includes("Games & Quizzes")) {
                triggerDicePulse();
                triggerScorePulse();
                triggerTimerPulse();
            }
            if (activityTypes.some(type => ["Presentation & Speaking", "Discussion & Debate", "Writing", "Role-play & Acting", "Problem Solving"].includes(type))) {
                if (!activityTypes.includes("Games & Quizzes")) triggerTimerPulse();
            }
        }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivityForModal(null);
    document.body.style.overflow = 'auto';
    setIsToolSuggestedForModal(false);
  };

  const handleSaveTemporaryEditedDescription = (activityTitle: string, newDescription: string) => {
    if (!isEditModeActive) {
      setEditedDescriptions(prev => ({ ...prev, [activityTitle]: newDescription }));
    }
  };

  const handleResetTemporaryEditedDescription = (activityTitle: string) => {
     if (!isEditModeActive) {
        setEditedDescriptions(prev => {
        const newDescriptions = { ...prev };
        delete newDescriptions[activityTitle];
        return newDescriptions;
        });
    }
  };

  const handleSaveChangesInEditMode = (originalActivityId: string, updatedActivity: Activity) => {
    setAllActivities(prevActivities =>
      prevActivities.map(act => (act.id === originalActivityId ? updatedActivity : act))
    );
    if (selectedActivityForModal && selectedActivityForModal.id === originalActivityId) { // Use ID for comparison
        setSelectedActivityForModal(updatedActivity);
    }
  };

  const handleDownloadUpdatedJson = useCallback(() => {
    const dataToDownload = allActivities.map(activity => ({
      title: activity.title,
      full_description: activity.full_description,
      tags: activity.tags,
      // id is intentionally omitted here as per original logic
    }));
    const jsonString = JSON.stringify(dataToDownload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'updated_activities.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [allActivities]);

  const openDeleteConfirmationDialog = (activity: Activity) => {
    setActivityToDelete(activity);
    setIsDeleteConfirmationOpen(true);
  };

  const closeDeleteConfirmationDialog = () => {
    setActivityToDelete(null);
    setIsDeleteConfirmationOpen(false);
  };

  const handleConfirmDeleteActivity = () => {
    if (activityToDelete) {
      setAllActivities(prevActivities =>
        prevActivities.filter(act => act.id !== activityToDelete.id)
      );
      setActivityToDelete(null);
      setIsDeleteConfirmationOpen(false);
    }
  };

  if (isLoading && !error && allActivities.length === 0) {
    return <div className="flex justify-center items-center h-screen bg-brandPageBg"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="flex flex-col justify-center items-center h-screen bg-brandPageBg text-brandFunctionalRed p-4 text-center">
        <p className="font-semibold text-lg mb-2 text-brandTextPrimary">Error loading activities:</p>
        <p className="mb-4 text-brandTextSecondary">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-brandPrimary-500 text-white rounded hover:bg-brandPrimary-600">Retry</button>
      </div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <MainAppLayout
              allActivities={allActivities}
              filteredActivities={filteredActivities}
              isLoading={isLoading}
              filterOptions={filterOptions}
              filters={filters}
              handleFilterChange={handleFilterChange}
              clearFilters={clearFilters}
              handleDownloadUpdatedJson={handleDownloadUpdatedJson}
              isEditModeActive={isEditModeActive}
              toggleEditMode={toggleEditMode}
              handleOpenModal={handleOpenModal}
              openDeleteConfirmationDialog={openDeleteConfirmationDialog}
              isGlobalToolsPanelOpen={isGlobalToolsPanelOpen}
              toggleGlobalToolsPanel={toggleGlobalToolsPanel}
              isToolSuggestedForModal={isToolSuggestedForModal}
              isModalOpen={isModalOpen}
              isDeleteConfirmationOpen={isDeleteConfirmationOpen}
            />
            <button
              onClick={toggleGlobalToolsPanel}
              className={`fixed bottom-5 right-5 bg-brandPrimary-600 text-white p-3 rounded-full shadow-lg hover:bg-brandPrimary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brandPrimary-500 focus:ring-opacity-50 z-[70]
                          ${isToolSuggestedForModal ? 'animate-ping-very-subtle' : ''}`}
              aria-label="Toggle Tools Panel"
              aria-expanded={isGlobalToolsPanelOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 1.905c-.007.379.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.333.183-.583.495-.646.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-1.905c.007-.379-.137-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
            <GlobalToolsPanel
              isOpen={isGlobalToolsPanelOpen}
              onClose={toggleGlobalToolsPanel}
              showDice={showDiceGlobal}
              toggleDice={toggleDiceGlobal}
              showTimer={showTimerGlobal}
              toggleTimer={toggleTimerGlobal}
              showScoreCounter={showScoreCounterGlobal}
              toggleScoreCounter={toggleScoreCounterGlobal}
              pulseDice={pulseDice}
              pulseTimer={pulseTimer}
              pulseScore={pulseScore}
              pulseSpinnyWheel={pulseSpinnyWheel}
              showSpinnyWheel={showSpinnyWheelGlobal}
              toggleSpinnyWheel={toggleSpinnyWheelGlobal}
              showRandomTeamGenerator={showRandomTeamGeneratorGlobal} // Added
              toggleRandomTeamGenerator={toggleRandomTeamGeneratorGlobal} // Added
              pulseRandomTeamGenerator={pulseRandomTeamGenerator} // Added
            />
            {isModalOpen && selectedActivityForModal && filterOptions && (
              <ActivityModal
                activity={selectedActivityForModal}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                initialEditedDescription={
                  isEditModeActive
                    ? selectedActivityForModal?.full_description || ''
                    : (editedDescriptions[selectedActivityForModal?.id || ''] || selectedActivityForModal?.full_description || '')
                }
                onSaveTemporaryEdit={(activityId, newDescription) => {
                   if (!isEditModeActive) {
                     setEditedDescriptions(prev => ({ ...prev, [activityId]: newDescription }));
                   }
                }}
                onResetTemporaryEdit={(activityId) => {
                   if (!isEditModeActive) {
                      setEditedDescriptions(prev => {
                      const newDescriptions = { ...prev };
                      delete newDescriptions[activityId];
                      return newDescriptions;
                      });
                  }
                }}
                isGlobalToolsPanelOpen={isGlobalToolsPanelOpen}
                isEditModeActive={isEditModeActive}
                onSaveChangesInEditMode={handleSaveChangesInEditMode}
                globalFilterOptions={filterOptions}
                toggleGlobalToolsPanel={toggleGlobalToolsPanel}
                setShowDiceGlobal={setShowDiceGlobal}
                setShowTimerGlobal={setShowTimerGlobal}
                setShowScoreCounterGlobal={setShowScoreCounterGlobal}
                triggerDicePulse={triggerDicePulse}
                triggerTimerPulse={triggerTimerPulse}
                triggerScorePulse={triggerScorePulse}
              />
            )}
            {activityToDelete && (
              <ConfirmationDialog
                isOpen={isDeleteConfirmationOpen}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${activityToDelete.title}"? This action cannot be undone.`}
                onConfirm={handleConfirmDeleteActivity}
                onCancel={closeDeleteConfirmationDialog}
                confirmButtonText="Delete Activity"
              />
            )}
          </>
        }
      />
      <Route path="/activity/:activityId" element={
          <ActivityEmbedView
            activities={allActivities}
            isLoading={isLoading}
            error={error}
            globalFilterOptions={filterOptions}
            />
        }
      />
      <Route path="/disclaimer" element={<DisclaimerPage />} /> {/* Added route */}
    </Routes>
  );
};

export default App;
