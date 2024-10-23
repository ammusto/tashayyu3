import React from 'react';
import SearchInputSelect from './SearchInputSelect';
import SlopInput from './SlopInput';

const ProximitySearch = ({ 
  proximityData,
  handleFieldChange,
  handleSlopChange 
}) => {
  return (
    <div className="proximity-search-container">
      <div className="proximity-terms">
        <SearchInputSelect
          index={0}
          searchField={proximityData.firstTerm}
          handleFieldChange={(index, name, value) => handleFieldChange(index, name, value, true)}
          searchType="proximity"
        />
        <SearchInputSelect
          index={1}
          searchField={proximityData.secondTerm}
          handleFieldChange={(index, name, value) => handleFieldChange(index, name, value, false)}
          searchType="proximity"
        />
      </div>
      <SlopInput value={proximityData.slop} onChange={handleSlopChange} />
    </div>
  );
};

export default React.memo(ProximitySearch);