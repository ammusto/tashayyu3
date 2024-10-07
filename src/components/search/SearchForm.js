import React, { useCallback, useEffect, useState, useRef } from 'react';
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
    resetSearch,
    searchQuery
  } = useSearch();

  const [localQuery, setLocalQuery] = useState(initialQuery);
  const isInitialMount = useRef(true);

  const handleQueryChange = useCallback((e) => {
    setLocalQuery(e.target.value);
  }, []);

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

  const handleResetGenres = useCallback(() => {
    setSelectedGenres([]);
  }, [setSelectedGenres]);

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    onToggle();
  }, [onToggle]);

  // Effect to handle initial query and text IDs
  useEffect(() => {
    if (isInitialMount.current) {
      if (initialQuery !== '') {
        setLocalQuery(initialQuery);
        setSearchQuery(initialQuery);
      }
      if (initialTextIds.length > 0) {
        setSelectedTexts(initialTextIds);
      }
      isInitialMount.current = false;
    }
  }, [initialQuery, initialTextIds, setSearchQuery, setSelectedTexts]);

  // Effect to keep localQuery in sync with searchQuery only when searchQuery changes
  useEffect(() => {
    if (!isInitialMount.current && searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery]);


  return (
    <div className="search-form-container">
      <form onSubmit={handleSubmit}>
        <div className="search-bar-container">
          <input
            className="search-form-input"
            type="text"
            value={localQuery}
            onChange={handleQueryChange}
            placeholder="Search"
          />
          <button
            type="button"
            className="toggle-form-button"
            onClick={handleToggle}
            aria-label={isOpen ? "Hide search options" : "Show search options"}
          >
            {isOpen ? '☰🡅' : '☰🡇'}
          </button>
        </div>

        <div className={`search-options ${isOpen ? 'open' : 'closed'}`}>
          <div className="filter-middle flex">
            <div className='filter-left'>
              <div className='filter-container flex center'>
                Filter Authors and Texts
                <input
                  type="text"
                  value={textFilter}
                  onChange={(e) => setTextFilter(e.target.value)}
                  placeholder=""
                />
                Select Genres
                <FilterDropdown
                  label=""
                  options={metadata?.genreOptions || []}
                  selectedOptions={selectedGenres}
                  onSelectionChange={setSelectedGenres}
                  onReset={handleResetGenres}
                />
                <DateRangeSlider />
              </div>
            </div>
            <div className="filter-right center">
              <TextFilterList initialTextIds={initialTextIds} />
            </div>
          </div>
          <div className="flex column gap10 center">
            Selected Texts
            <SelectedTextsList />
          </div>
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
            Clear Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(SearchForm);