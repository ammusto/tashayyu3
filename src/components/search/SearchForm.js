import React, { useCallback, useEffect, useState } from 'react';
import { useSearch } from '../context/SearchContext';
import FilterDropdown from './FilterDropdown';
import TextFilterList from './TextFilterList';
import SelectedTextsList from './SelectedTextsList';
import DateRangeSlider from './DateRangeSlider';

const SearchForm = ({ onSearch, onResetSearch, initialQuery = '', initialTextIds = [], isOpen, onToggle }) => {
  const {
    setSearchQuery,
    selectedTexts,
    setSelectedTexts,
    metadata,
    textFilter,
    setTextFilter,
    selectedGenres,
    setSelectedGenres,
    totalResults,
    resetSearch
  } = useSearch();

  const [localQuery, setLocalQuery] = useState(initialQuery);

  useEffect(() => {
    setLocalQuery(initialQuery);
    setSearchQuery(initialQuery);
    setSelectedTexts(initialTextIds);
  }, []);

  const handleQueryChange = (e) => {
    setLocalQuery(e.target.value);
  };

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    onSearch(localQuery, selectedTexts, 1);
  }, [onSearch, localQuery, selectedTexts, setSearchQuery]);

  const handleReset = useCallback(() => {
    setLocalQuery('');
    resetSearch();
    onResetSearch();
  }, [resetSearch, onResetSearch]);

  return (
    <div>
      <div className={`search-form-container ${isOpen ? 'open' : 'closed'}`}>
        <div className='search-form search-page-container flex'>
          <form onSubmit={handleSubmit}>
            <div className='filter-top'>
              <input
                className='search-form-input'
                type="text"
                value={localQuery}
                onChange={handleQueryChange}
                placeholder="Enter your search query..."
              />
            </div>
            <div className="filter-middle flex">
              <div className='filter-left'>
                <div className='filter-container flex'>
                  Select Genres
                  <FilterDropdown
                    label=""
                    options={metadata?.genreOptions || []}
                    selectedOptions={selectedGenres}
                    onChange={setSelectedGenres}
                  />
                  Filter Authors and Texts
                  <input
                    type="text"
                    value={textFilter}
                    onChange={(e) => setTextFilter(e.target.value)}
                    placeholder=""
                  />
                  <DateRangeSlider />
                </div>
              </div>
              <div className="filter-right">
                <TextFilterList initialTextIds={initialTextIds} />
              </div>
            </div>
            <div className="flex column gap10">
              Selected Texts
              <SelectedTextsList />
            </div>
            <div className='flex search-button-container'>
              <button
                type="submit"
                className='search-button'
                disabled={!localQuery.trim() && selectedTexts.length === 0}
              >
                Search
              </button>
              <button
                type="button"
                className='reset-button'
                onClick={handleReset}
              >
                Reset Search & Results
              </button>
            </div>
          </form>
        </div>
      </div>
      {totalResults > 0 && (
        <button className="toggle-form-button" onClick={onToggle}>
          {isOpen ? 'Hide Search Form' : 'Show Search Form'}
        </button>
      )}
    </div>
  );
};

export default React.memo(SearchForm);