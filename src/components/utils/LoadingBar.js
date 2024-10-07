import React from 'react';
import LoadingGif from './LoadingGif';

const Progress = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div 
        className="bg-blue-600 h-2.5 rounded-full" 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

const LoadingBar = ({ progress }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium"><LoadingGif /></span>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
};

export default LoadingBar;