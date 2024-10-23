import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import SearchForm from '../search/SearchForm';
import Results from '../search/Results';
import DownloadButton from '../search/DownloadButton';
import './Search.css';
import LoadingGif from '../utils/LoadingGif';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchFormOpen, setIsSearchFormOpen] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchConfig, setSearchConfig] = useState({
    searchType: 'simple',
    searchFields: [{
      term: '',
      searchIn: 'tok',
      definite: false,
      proclitic: false
    }]
  });

  const {
    displayedResults,
    totalResults,
    isSearching,
    hasSearched,
    handleSearch,
    handlePageChange,
    searchQuery,
    currentPage,
    totalPages,
    resetSearch,
    isChangingPage,
    metadata,
    allSearchResults,
    highlightQuery,
    setHighlightQuery,
    initializeSearchFromParams,
    selectedTexts,
  } = useSearch();

  const updateSearchParams = useCallback((config, texts, page) => {
    const newSearchParams = new URLSearchParams();
    if (config.searchFields[0]?.term) {
      newSearchParams.set('query', config.searchFields[0].term);
    }
    if (page !== 1) newSearchParams.set('page', page.toString());
    if (texts.length > 0 && texts.length !== (metadata?.texts || []).length) {
      newSearchParams.set('text_ids', texts.join(','));
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [setSearchParams, metadata]);

  const handleSearchSubmit = useCallback((newConfig, texts, page = 1) => {
    setSearchConfig(newConfig);
    setHighlightQuery(newConfig.searchFields[0]?.term || '');
    handleSearch(newConfig, texts, page, itemsPerPage);
    updateSearchParams(newConfig, texts, page);
    setIsSearchFormOpen(false);
  }, [handleSearch, updateSearchParams, setHighlightQuery, itemsPerPage]);

  const handleResetSearch = useCallback(() => {
    resetSearch();
    setSearchParams({});
    setIsSearchFormOpen(true);
    setItemsPerPage(20);
    setSearchConfig({
      searchType: 'simple',
      searchFields: [{
        term: '',
        searchIn: 'tok',
        definite: false,
        proclitic: false
      }]
    });
  }, [resetSearch, setSearchParams]);

  const toggleSearchForm = useCallback(() => {
    setIsSearchFormOpen(prev => !prev);
  }, []);

  useEffect(() => {
    initializeSearchFromParams(searchParams);
  }, [searchParams, initializeSearchFromParams]);

  const memoizedSearchForm = useMemo(() => (
    <SearchForm
      onResetSearch={handleResetSearch}
      onSearch={handleSearchSubmit}
      searchConfig={searchConfig}
      setSearchConfig={setSearchConfig}
      initialQuery={searchParams.get('query') || ''}
      initialTextIds={searchParams.get('text_ids')?.split(',').map(Number) || []}
      isOpen={isSearchFormOpen}
      totalResults={totalResults}
      onToggle={toggleSearchForm}
    />
  ), [handleResetSearch, handleSearchSubmit, searchConfig, searchParams, isSearchFormOpen, totalResults, toggleSearchForm]);

  const memoizedResults = useMemo(() => (
    !isSearching && !isChangingPage && hasSearched && (
      <Results
        displayedResults={displayedResults || []}
        query={highlightQuery}
        currentPage={currentPage}
        totalResults={totalResults}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    )
  ), [isSearching, isChangingPage, hasSearched, displayedResults, highlightQuery, 
      currentPage, totalResults, totalPages, itemsPerPage, handlePageChange]);

  return (
    <div className='container'>
      <div className='main'>
        {memoizedSearchForm}
        {(isSearching || isChangingPage) && <div className='text-content center'><p><LoadingGif divs={false}/></p></div>}
        {memoizedResults}
        {displayedResults.length > 0 && !isSearching && (
          <DownloadButton allSearchResults={allSearchResults} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchPage);