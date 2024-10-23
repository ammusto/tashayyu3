import React from 'react';
import SearchInputSelect from './SearchInputSelect';

const SimpleSearch = ({ searchField, handleFieldChange }) => {
  return (
    <div className="simple-search-container">
      <SearchInputSelect
        index={0}
        searchField={searchField}
        handleFieldChange={handleFieldChange}
        searchType="simple"
      />
    </div>
  );
};

export default SimpleSearch;