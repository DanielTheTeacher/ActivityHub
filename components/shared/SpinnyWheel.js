import React from 'react';

const SpinnyWheel: React.FC = () => {
  const embedUrl = "https://danieltheteacher.github.io/AILesson";

  return (
    <div className="flex flex-col items-center p-3 rounded-lg w-full h-full bg-white">
      <div className="w-full h-[calc(100%-2rem)] aspect-[4/3] max-h-[600px] border border-brandNeutral-300 rounded-md overflow-hidden shadow-inner">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="External Spinny Wheel"
            className="w-full h-full border-0"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Adjust sandbox as needed
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brandTextSecondary">
            Spinny Wheel tool will be embedded here.
          </div>
        )}
      </div>
      <p className="text-xs text-brandTextSecondary mt-2 text-center">
        Displaying content from: <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="text-brandPrimary-600 hover:underline">{embedUrl}</a>
      </p>
    </div>
  );
};

export default SpinnyWheel;