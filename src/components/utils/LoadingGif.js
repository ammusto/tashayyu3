import React from 'react';

const LoadingGif = () => {
  return (
    <div>
      <img 
        src={`${process.env.PUBLIC_URL}/loading.gif`} 
        alt="Loading..." 
        style={{ width: '64px', height: '64px' }} 
      />
    </div>
  );
};

export default LoadingGif;
