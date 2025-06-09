
import React, { useState } from 'react';
import { FilterOptions, Filters, CefrRangeFilter } from '../types';
// import Dropdown from './shared/Dropdown'; // Removed Dropdown for CEFR
import CefrRangeSlider from './shared/CefrRangeSlider'; // Added CefrRangeSlider
import CheckboxGroup from './shared/CheckboxGroup';
import Dropdown from './shared/Dropdown'; // Keep for other dropdowns
import { Link } from 'react-router-dom'; // Added import for Link

interface FilterPanelProps {
  options: FilterOptions;
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
  onClearFilters: () => void;
  onDownloadJson: () => void;
  isEditModeActive: boolean; 
  onToggleEditMode: () => void; 
}

const CEFR_LEVELS_ORDERED = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const CATEGORY_ORDER = ['Oral English', 'Writing', 'Vocabulary', 'Grammar', 'Practical English']; // FuelBox removed, handled separately

const FilterPanel: React.FC<FilterPanelProps> = ({
  options,
  filters,
  onFilterChange,
  onClearFilters,
  onDownloadJson,
  isEditModeActive, 
  onToggleEditMode, 
}) => {
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFilterChange({ [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (name: keyof Filters, value: string[] | boolean) => {
    // Adjusted to handle boolean for avoid_sensitive_topics if it were part of a generic handler
    // However, handleSingleCheckboxChange is more direct for single booleans.
    if (typeof value === 'boolean' && (name === 'avoid_sensitive_topics' || name === 'classroom_community_bonding' || name === 'thematically_adaptable')) {
        onFilterChange({ [name]: value });
    } else if (Array.isArray(value)) {
        onFilterChange({ [name]: value });
    }
  };
  
  const handleSingleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ [e.target.name]: e.target.checked });
  };

  const handleMainCategoryClick = (category: string) => {
    if (filters.main_category === category && !filters.sub_category) {
      onFilterChange({ main_category: '', sub_category: '' });
    } else {
      onFilterChange({ main_category: category, sub_category: '' });
    }
    setActivePopover(null); 
  };

  const handleSubCategoryClick = (mainCategory: string, subCategory: string) => {
    if (filters.main_category === mainCategory && filters.sub_category === subCategory) {
      onFilterChange({ main_category: mainCategory, sub_category: '' });
    } else {
      onFilterChange({ main_category: mainCategory, sub_category: subCategory });
    }
    setActivePopover(null); 
  };

  const handleCefrRangeChange = (newRange: CefrRangeFilter) => {
    onFilterChange({ cefr_level: newRange });
  };

  const renderCategoryButton = (category: string) => {
    const isMainActiveNoSub = filters.main_category === category && !filters.sub_category;
    const isSubActiveForThisMain = filters.main_category === category && filters.sub_category && options.sub_category_options[category]?.includes(filters.sub_category);
    
    let mainCatClasses = 'p-2 rounded-md cursor-pointer hover:bg-brandPrimary-100 w-full text-left transition-colors duration-150';
    if (isMainActiveNoSub) {
      mainCatClasses += ' bg-brandPrimary-200 text-brandPrimary-800 font-semibold ring-2 ring-brandPrimary-500';
    } else if (isSubActiveForThisMain) {
      mainCatClasses += ' bg-brandPrimary-100 text-brandPrimary-700';
    } else {
      mainCatClasses += ' bg-brandNeutral-50 text-brandTextPrimary border border-brandNeutral-200 hover:border-brandPrimary-300';
    }

    return (
      <div
        key={category}
        className="relative" 
        onMouseEnter={() => setActivePopover(category)}
        onMouseLeave={() => setActivePopover(null)}
      >
        <button 
          onClick={() => handleMainCategoryClick(category)}
          className={mainCatClasses}
          aria-expanded={activePopover === category}
          aria-haspopup="true"
        >
          {category}
          {isSubActiveForThisMain && (
            <span className="ml-2 text-xs text-brandPrimary-600">({filters.sub_category})</span>
          )}
        </button>

        {activePopover === category && (options.sub_category_options[category]?.length > 0) && (
          <div
            className="absolute top-full left-0 w-64 bg-white/95 shadow-xl rounded-md border border-brandNeutral-300 p-2 z-[999] animate-popover-appear max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-brandPrimary-300 scrollbar-track-brandNeutral-100"
            onMouseEnter={() => setActivePopover(category)} 
            onMouseLeave={() => setActivePopover(null)} 
          >
            <h4 className="text-xs font-semibold text-brandTextSecondary mb-1 sticky top-0 bg-white/95 py-1 px-1.5">Subcategories for {category}</h4>
            {(options.sub_category_options[category] || []).map(subCat => (
              <button 
                key={subCat}
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleSubCategoryClick(category, subCat);
                }}
                className={`block w-full text-left p-1.5 rounded hover:bg-brandPrimary-100 text-sm cursor-pointer transition-colors duration-150 ${
                  filters.main_category === category && filters.sub_category === subCat ? 'bg-brandPrimary-200 text-brandPrimary-800 font-semibold' : 'text-brandTextPrimary'
                }`}
              >
                {subCat}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const mainCategoriesToOrder = options.main_category.filter(cat => CATEGORY_ORDER.includes(cat) && cat !== "Skills" && cat !== "FuelBox");
  const orderedMainCategories = mainCategoriesToOrder.sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));
  
  const otherUnorderedCategories = options.main_category.filter(cat => !CATEGORY_ORDER.includes(cat) && cat !== "Skills" && cat !== "FuelBox");
  otherUnorderedCategories.sort((a, b) => a.localeCompare(b));
  
  const fuelBoxCategory = options.main_category.find(cat => cat === "FuelBox");
  const skillsCategory = options.main_category.find(cat => cat === "Skills");

  const displayCategories = [...orderedMainCategories, ...otherUnorderedCategories];


  return (
    <aside className="w-full lg:w-80 xl:w-96 bg-white shadow-xl lg:sticky lg:top-0 lg:h-screen border-r border-brandNeutral-200 flex flex-col z-40 overflow-y-auto overflow-x-visible scrollbar-thin scrollbar-thumb-brandPrimary-400 scrollbar-track-brandNeutral-100">
      {/* Non-scrolling Header Area - will now scroll if content overflows aside */}
      <div className="p-6 border-b border-brandPrimary-200 pb-4 flex-shrink-0">
        <div className="flex flex-col items-center mb-4">
          <img 
            src="/assets/daniel_the_teacher_logo.png" 
            alt="Daniel the Teacher Logo" 
            className="h-24 w-auto mb-3"
          />
          <h1 className="text-lg font-bold text-brandPrimary-700 text-center">Daniel the Teacher's Activity Hub</h1>
        </div>
      </div>

      {isEditModeActive && (
        <div className="px-6 pt-3 pb-3 border-b border-brandNeutral-200 flex-shrink-0">
           <div className="p-2 bg-brandAccent-100 text-brandAccent-700 text-sm rounded-md border border-brandAccent-300" role="status">
                ✏️ **Edit Mode Active:** Changes can be permanently saved.
            </div>
        </div>
      )}

      {/* Content Area - no longer clips its children with overflow */}
      <div className="flex-grow p-6 space-y-6">
        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium text-brandTextSecondary mb-1">Search Keywords</label>
          <div className="relative">
            <input
            type="text"
            id="searchTerm"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleInputChange}
            placeholder="e.g., debate, icebreaker"
            className="w-full p-2 bg-brandNeutral-50 text-brandTextPrimary border border-brandNeutral-300 rounded-md shadow-sm focus:ring-brandPrimary-500 focus:border-brandPrimary-500 pl-10 placeholder-brandNeutral-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brandPrimary-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brandTextSecondary mb-1">Main Category</label>
          <div className="space-y-1">
            {displayCategories.map(category => renderCategoryButton(category))}
            {(fuelBoxCategory || skillsCategory) && (
              <>
                <hr className="my-3 border-t-2 border-brandPrimary-200" />
                {fuelBoxCategory && renderCategoryButton(fuelBoxCategory)}
                {skillsCategory && renderCategoryButton(skillsCategory)}
              </>
            )}
          </div>
        </div>
        
        <CheckboxGroup
          label="Activity Type"
          name="activity_type"
          options={options.activity_type}
          selectedOptions={filters.activity_type}
          onChange={(selected) => handleCheckboxChange('activity_type', selected)}
        />
                
        <CefrRangeSlider
          label="CEFR Level"
          allCefrLevels={options.cefr_level.length > 0 ? options.cefr_level : CEFR_LEVELS_ORDERED}
          currentRange={filters.cefr_level}
          onChange={handleCefrRangeChange}
        />
        
        <CheckboxGroup
          label="Group Size"
          name="group_size"
          options={options.group_size}
          selectedOptions={filters.group_size}
          onChange={(selected) => handleCheckboxChange('group_size', selected)}
        />

        <Dropdown
          label="Preparation Required"
          name="preparation_required"
          value={filters.preparation_required}
          options={options.preparation_required}
          onChange={handleInputChange}
          emptyOptionLabel="Any Preparation"
        />
        
        <CheckboxGroup
          label="Materials/Resources"
          name="materials_resources"
          options={options.materials_resources}
          selectedOptions={filters.materials_resources}
          onChange={(selected) => handleCheckboxChange('materials_resources', selected)}
        />
        
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-brandTextSecondary">
            <input
              type="checkbox"
              name="avoid_sensitive_topics"
              checked={filters.avoid_sensitive_topics}
              onChange={handleSingleCheckboxChange}
              className="rounded border-brandNeutral-300 text-brandPrimary-600 bg-brandNeutral-50 shadow-sm focus:border-brandPrimary-500 focus:ring focus:ring-brandPrimary-500 focus:ring-opacity-50"
            />
            <span>Avoid sensitive topics</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-brandTextSecondary">
            <input
              type="checkbox"
              name="classroom_community_bonding"
              checked={filters.classroom_community_bonding}
              onChange={handleSingleCheckboxChange}
              className="rounded border-brandNeutral-300 text-brandPrimary-600 bg-brandNeutral-50 shadow-sm focus:border-brandPrimary-500 focus:ring focus:ring-brandPrimary-500 focus:ring-opacity-50"
            />
            <span>Relationship building activities</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-brandTextSecondary">
            <input
              type="checkbox"
              name="thematically_adaptable"
              checked={filters.thematically_adaptable}
              onChange={handleSingleCheckboxChange}
              className="rounded border-brandNeutral-300 text-brandPrimary-600 bg-brandNeutral-50 shadow-sm focus:border-brandPrimary-500 focus:ring focus:ring-brandPrimary-500 focus:ring-opacity-50"
            />
            <span>Can easily be adapted to another topic</span>
          </label>
        </div>

        {/* Bottom Action Buttons Area */}
        <div className="pt-4 space-y-3">
          <button
            onClick={onToggleEditMode}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50
                ${isEditModeActive 
                    ? 'bg-brandAccent-500 text-white hover:bg-brandAccent-600 focus:ring-brandAccent-400' 
                    : 'bg-brandPrimary-500 text-white hover:bg-brandPrimary-600 focus:ring-brandPrimary-400'}`}
            aria-pressed={isEditModeActive}
          >
            {isEditModeActive ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          </button>

          {isEditModeActive && (
            <button
                onClick={onDownloadJson}
                className="w-full px-4 py-2 bg-brandPrimary-500 text-white rounded-md hover:bg-brandPrimary-600 focus:outline-none focus:ring-2 focus:ring-brandPrimary-400 focus:ring-opacity-50 transition duration-150 ease-in-out flex items-center justify-center space-x-2"
                title="Download the current activities (including your edits from Edit Mode) as a JSON file."
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Download Updated JSON</span>
            </button>
          )}

          <button
            onClick={onClearFilters}
            className="w-full px-4 py-2 bg-brandFunctionalRed text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-brandFunctionalRed focus:ring-opacity-50 transition duration-150 ease-in-out flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
            </svg>
            <span>Clear Filters</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-brandNeutral-200 text-center">
            <Link 
                to="/disclaimer" 
                className="text-xs text-brandNeutral-500 hover:text-brandPrimary-600 hover:underline transition-colors"
                aria-label="View disclaimer and website information"
            >
                Disclaimer & About This Site
            </Link>
        </div>

      </div>
    </aside>
  );
};

export default FilterPanel;
