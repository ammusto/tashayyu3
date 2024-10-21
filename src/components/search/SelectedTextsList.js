import React from 'react';
import { useSearch } from '../context/SearchContext';

const SelectedTextsList = () => {
  const { selectedTextDetails, selectedTexts, setSelectedTexts, setSelectedTextDetails } = useSearch();

  const handleRemoveText = (id) => {
    setSelectedTexts(prev => prev.filter(textId => textId !== id));
    setSelectedTextDetails(prev => prev.filter(t => t.id !== id));
  };

  if (!selectedTextDetails || selectedTextDetails.length === 0) {
    return <div className="text-filter-list"><div className="center">Searching all texts</div></div>;
  }

  // Remove any potential duplicates
  const uniqueSelectedTextDetails = selectedTextDetails.filter((text, index, self) =>
    index === self.findIndex((t) => t.id === text.id)
  );

  return (
    <div className="text-filter-list">
      {uniqueSelectedTextDetails.map(text => (
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