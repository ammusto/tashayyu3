import React from 'react';

const LoadingGif = ({ divs = true }) => {
  const loadingImg = (
    <div>
      <img
        src={`${process.env.PUBLIC_URL}/loading.gif`}
        alt="Loading..."
        style={{ width: '64px', height: '64px' }}
      />
    </div>
  );

  return divs ? (
    <div className="container">
      <div className="main">
        <div className="text-content center">
          {loadingImg}
        </div>
      </div>
    </div>
  ) : (
    loadingImg
  );
};

export default LoadingGif;
