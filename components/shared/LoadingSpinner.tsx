
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brandPrimary-500"></div>
      <p className="text-brandTextSecondary text-lg">Loading activities...</p>
    </div>
  );
};

export default LoadingSpinner;