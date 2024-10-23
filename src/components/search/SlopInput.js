import React from 'react';

const SlopInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 10) {
      onChange(val);
    }
  };

  return (
    <div className="slop-input-container">
      <label>
        Words Between:
        <input
          type="number"
          min="1"
          max="10"
          value={value}
          onChange={handleChange}
          className="slop-input"
        />
      </label>
    </div>
  );
};

export default SlopInput;