import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useSearch } from '../context/SearchContext';
import FilterDropdown from './FilterDropdown';
import TextFilterList from './TextFilterList';
import SelectedTextsList from './SelectedTextsList';
import DateRangeSlider from './DateRangeSlider';
import SearchTab from './SearchTab';

const SearchForm = ({ 
  onSearch, 
  onResetSearch, 
  searchConfig, 
  setSearchConfig,
  initialQuery = '', 
  initialTextIds = [], 
  isOpen, 
  onToggle 
}) => {
  const {
    selectedTexts,
    setSelectedTexts,
    metadata,
    textFilter,
    setTextFilter,
    selectedGenres,
    setSelectedGenres,
    resetSearch,
    dateRange,
  } = useSearch();

  const [activeTab, setActiveTab] = useState('select');
  const isInitialMount = useRef(true);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleResetGenres = useCallback(() => {
    setSelectedGenres([]);
  }, [setSelectedGenres]);

  const handleReset = useCallback(() => {
    resetSearch();
    onResetSearch();
  }, [resetSearch, onResetSearch]);

  // Field change handler for search inputs
  const handleFieldChange = useCallback((index, name, value, type = null) => {
    setSearchConfig(prev => {
      const newConfig = { ...prev };
      
      // Handle fields based on search type
      if (prev.searchType === 'simple') {
        newConfig.searchFields[0] = {
          ...newConfig.searchFields[0],
          [name]: value
        };
      } 
      else if (prev.searchType === 'advanced') {
        const fields = type === 'AND' ? [...prev.searchFields.filter(f => f.tabType === 'AND')] 
                                    : [...prev.searchFields.filter(f => f.tabType === 'OR')];
        fields[index] = { ...fields[index], [name]: value };
        newConfig.searchFields = [...fields];
      }
      else if (prev.searchType === 'proximity') {
        if (index === 0) {
          newConfig.searchFields.firstTerm = {
            ...newConfig.searchFields.firstTerm,
            [name]: value
          };
        } else {
          newConfig.searchFields.secondTerm = {
            ...newConfig.searchFields.secondTerm,
            [name]: value
          };
        }
      }
      
      return newConfig;
    });
  }, [setSearchConfig]);

  useEffect(() => {
    if (isInitialMount.current) {
      if (initialQuery !== '') {
        setActiveTab('search');
      }
      if (initialTextIds.length > 0) {
        setSelectedTexts(initialTextIds);
      }
      isInitialMount.current = false;
    }
  }, [initialQuery, initialTextIds, setSelectedTexts]);

  return (
    <div className="search-form-container">
      <div className="search-tabs">
        <button
          className={`search-tab ${activeTab === 'select' ? 'active' : ''}`}
          onClick={() => handleTabChange('select')}
        >
          Select Texts
        </button>
        <button
          className={`search-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => handleTabChange('search')}
        >
          Search
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'select' && (
          <div className="select-texts-container">
            <div className="filter-middle flex">
              <div className='filter-left'>
                <div className='filter-container flex center'>
                  <strong>Filter Authors and Texts</strong>
                  <input
                    type="text"
                    value={textFilter}
                    onChange={(e) => setTextFilter(e.target.value)}
                    placeholder="Filter texts..."
                  />
                  <strong>Select Genres</strong>
                  <FilterDropdown
                    label=""
                    options={metadata?.genreOptions || []}
                    selectedOptions={selectedGenres}
                    onSelectionChange={setSelectedGenres}
                    onReset={handleResetGenres}
                  />
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
        )}
        {activeTab === 'search' && (
          <SearchTab 
            onSearch={onSearch}
            searchConfig={searchConfig}
            handleFieldChange={handleFieldChange}
          />
        )}
      </div>

      <div className='flex search-button-container'>
        <button
          type="button"
          className='reset-button'
          onClick={handleReset}
        >
          Reset Search and Filters
        </button>
      </div>
    </div>
  );
};

export default React.memo(SearchForm);