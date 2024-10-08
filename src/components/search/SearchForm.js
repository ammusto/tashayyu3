import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useSearch } from '../context/SearchContext';
import FilterDropdown from './FilterDropdown';
import TextFilterList from './TextFilterList';
import SelectedTextsList from './SelectedTextsList';
import DateRangeSlider from './DateRangeSlider';
import SearchInput from './SearchInput';

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
    resetSearch,
    searchQuery,
    handleProcliticsChange
  } = useSearch();

  const [localQuery, setLocalQuery] = useState(initialQuery);
  const isInitialMount = useRef(true);

  const handleQueryChange = useCallback((value) => {
    setLocalQuery(value);
    setSearchQuery(value);
  }, [setSearchQuery]);

  const handleProcliticsChangeLocal = useCallback((checkA, checkB) => {
    handleProcliticsChange(checkA, checkB);
  }, [handleProcliticsChange]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    onSearch(localQuery, selectedTexts, 1);
  }, [onSearch, localQuery, selectedTexts, setSearchQuery]);

  const handleReset = useCallback(() => {
    setLocalQuery('');
    setSearchQuery('');
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

  useEffect(() => {
    if (isInitialMount.current) {
      if (initialQuery !== '') {
        setLocalQuery(initialQuery);
        setSearchQuery(initialQuery);
        onToggle();

      }
      if (initialTextIds.length > 0) {
        setSelectedTexts(initialTextIds);
      }
      isInitialMount.current = false;
    }
  }, [initialQuery, initialTextIds, setSearchQuery, setSelectedTexts]);

  useEffect(() => {
    if (!isInitialMount.current && searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery, localQuery]);

  const memoizedSearchInput = useMemo(() => (
    <SearchInput
      value={localQuery}
      onChange={handleQueryChange}
      placeholder="Search"
      onProcliticsChange={handleProcliticsChangeLocal}
    />
  ), [localQuery, handleQueryChange, handleProcliticsChangeLocal]);

  const memoizedFilterDropdown = useMemo(() => (
    <FilterDropdown
      label=""
      options={metadata?.genreOptions || []}
      selectedOptions={selectedGenres}
      onSelectionChange={setSelectedGenres}
      onReset={handleResetGenres}
    />
  ), [metadata?.genreOptions, selectedGenres, setSelectedGenres, handleResetGenres]);

  return (
    <div className="search-form-container">
      <form onSubmit={handleSubmit}>
        <div className="search-bar-container">
          {memoizedSearchInput}
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
                <strong>Filter Authors and Texts</strong>
                <input
                  type="text"
                  value={textFilter}
                  onChange={(e) => setTextFilter(e.target.value)}
                  placeholder=""
                />
                <strong>Select Genres</strong>
                {memoizedFilterDropdown}
                <DateRangeSlider />
                <strong>Selected Texts</strong>
                <SelectedTextsList />
              </div>
            </div>
            <div className="filter-right center">
              <TextFilterList initialTextIds={initialTextIds} />
            </div>
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
            Reset Search and Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(SearchForm);