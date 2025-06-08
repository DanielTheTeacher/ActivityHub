
import React from 'react';

const NoResultsFound: React.FC = () => {
  return (
    <div className="text-center py-10 px-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-brandPrimary-500 mx-auto mb-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
      <h3 className="text-xl font-semibold text-brandPrimary-700 mb-2">No Activities Found</h3>
      <p className="text-brandTextSecondary">Try adjusting your filters or search terms.</p>
    </div>
  );
};

export default NoResultsFound;