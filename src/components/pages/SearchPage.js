import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import SearchForm from '../search/SearchForm';
import Results from '../search/Results';
import DownloadButton from '../search/DownloadButton';
import './Search.css';
import LoadingGif from '../utils/LoadingGif';

const ITEMS_PER_PAGE = 20;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchFormOpen, setIsSearchFormOpen] = useState(true);

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
  } = useSearch();

  const updateSearchParams = useCallback((query, texts, page) => {
    const newSearchParams = new URLSearchParams();
    if (query) newSearchParams.set('query', query);
    if (page !== 1) newSearchParams.set('page', page.toString());
    if (texts.length > 0 && texts.length !== (metadata?.texts || []).length) {
      newSearchParams.set('text_ids', texts.join(','));
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [setSearchParams, metadata]);

  const handleSearchSubmit = useCallback((query, texts, page) => {
    setHighlightQuery(query);
    handleSearch(query, texts, page);
    updateSearchParams(query, texts, page);
    setIsSearchFormOpen(false);
  }, [handleSearch, updateSearchParams, setHighlightQuery]);

  const handleResetSearch = useCallback(() => {
    resetSearch();
    setSearchParams({});
    setIsSearchFormOpen(true);
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
      initialQuery={searchParams.get('query') || ''}
      initialTextIds={searchParams.get('text_ids')?.split(',').map(Number) || []}
      isOpen={isSearchFormOpen}
      totalResults={totalResults}
      onToggle={toggleSearchForm}
    />
  ), [handleResetSearch, handleSearchSubmit, searchParams, isSearchFormOpen, totalResults, toggleSearchForm]);

  const memoizedResults = useMemo(() => (
    !isSearching && !isChangingPage && hasSearched && (
      <Results
        displayedResults={displayedResults || []}
        query={highlightQuery}
        currentPage={currentPage}
        totalResults={totalResults}
        totalPages={totalPages}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />
    )
  ), [isSearching, isChangingPage, hasSearched, displayedResults, highlightQuery, currentPage, totalResults, totalPages, handlePageChange]);

  return (
    <div className='container'>
      <div className='main'>
        {memoizedSearchForm}
        {(isSearching || isChangingPage) && <div className='text-content center'><p><LoadingGif divs={false}/></p></div>}
        {memoizedResults}
        {displayedResults.length > 0 && isSearching === false && (
          <DownloadButton allSearchResults={allSearchResults} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchPage);