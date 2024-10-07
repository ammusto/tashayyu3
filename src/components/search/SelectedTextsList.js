import React from 'react';
import { useSearch } from '../context/SearchContext';

const SelectedTextsList = () => {
  const { selectedTextDetails, selectedTexts, setSelectedTexts, setSelectedTextDetails } = useSearch();

  const handleRemoveText = (id) => {
    setSelectedTexts(prev => prev.filter(textId => textId !== id));
    setSelectedTextDetails(prev => prev.filter(t => t.id !== id));
  };

  if (selectedTextDetails.length === 0) {
    return <div className="text-filter-list"><div className="center">Searching all texts</div></div>;
  }

  return (
    <div className="text-filter-list">
      {/* <button onClick={clearSelectedTexts} className="clear-selected-button">
        Remove All Selected Texts
      </button> */}
      {selectedTextDetails.map(text => (
        <label key={text.id} onClick={() => handleRemoveText(text.id)}>
          <input
            type="checkbox"
            checked={selectedTexts.includes(text.id)}
            onChange={() => handleRemoveText(text.id)}
            className="text-checkbox"
          />
          {text.title} - {text.author} ({text.date})
        </label>
      ))}
      
    </div>

  );
};

export default React.memo(SelectedTextsList);