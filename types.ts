export interface Flashcard {
  term: string;
  definition: string;
}

export interface ActivityTags {
  main_category: string; 
  sub_category: string[]; 
  cefr_level: string[]; 
  group_size: string[]; 
  preparation_required: string; 
  materials_resources: string[]; 
  sensitivity_warning: boolean; 
  activity_type: string[]; 
  classroom_community_bonding: boolean; 
  thematically_adaptable: boolean; 
  flashcards?: Flashcard[];
  teacher_instruction?: string;
}

export interface Activity {
  id: string; // Added for unique identification
  title: string;
  full_description: string;
  tags: ActivityTags;
}

export interface FilterOptions {
  main_category: string[];
  sub_category_options: Record<string, string[]>;
  cefr_level: string[]; 
  group_size: string[];
  preparation_required: string[];
  materials_resources: string[];
  // sensitivity_warning: string[]; // Removed
  activity_type: string[];
  classroom_community_bonding: string[]; 
}

export interface CefrRangeFilter {
  min: string;
  max: string;
}

export interface Filters {
  searchTerm: string;
  main_category: string;
  sub_category: string; 
  cefr_level: CefrRangeFilter;  
  group_size: string[]; 
  preparation_required: string;
  materials_resources: string[]; 
  // sensitivity_warning: string[]; // Removed
  avoid_sensitive_topics: boolean; // Added
  activity_type: string[]; 
  classroom_community_bonding: boolean; 
  thematically_adaptable: boolean; 
}

export interface GlobalToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  showDice: boolean;
  toggleDice: () => void;
  showTimer: boolean;
  toggleTimer: () => void;
  showScoreCounter: boolean;
  toggleScoreCounter: () => void;
  pulseDice: boolean;
  pulseTimer: boolean;
  pulseScore: boolean;
  pulseSpinnyWheel?: boolean; 
  showSpinnyWheel: boolean; 
  toggleSpinnyWheel: () => void; 
  showRandomTeamGenerator: boolean; // Added
  toggleRandomTeamGenerator: () => void; // Added
  pulseRandomTeamGenerator?: boolean; // Added, optional
}