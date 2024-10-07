import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import SearchForm from '../search/SearchForm';
import Results from '../search/Results';
import DownloadButton from '../search/DownloadButton';
import './Search.css';
import LoadingGif from '../utils/LoadingGif';

const ITEMS_PER_PAGE = 20;

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightQuery, setHighlightQuery] = useState('');
  const [isSearchFormOpen, setIsSearchFormOpen] = useState(true);

  const {
    displayedResults,
    totalResults,
    isSearching,
    hasSearched,
    handleSearch,
    handlePageChange,
    searchQuery,
    selectedTexts,
    setSelectedTexts,
    currentPage,
    totalPages,
    resetSearch,
    isChangingPage,
    metadata,
    allSearchResults,
    hasMoreResults,
  } = useSearch();

  useEffect(() => {
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const textIds = searchParams.get('text_ids')?.split(',').map(Number) || [];

    if (query || textIds.length > 0) {
      const textsToSearch = textIds.length > 0 ? textIds : (metadata?.texts || []).map(text => text.id);
      setSelectedTexts(textsToSearch);
      handleSearchSubmit(query, textsToSearch, page);
    }
  }, [metadata]);

  const handleSearchSubmit = useCallback((query, texts, page) => {
    setHighlightQuery(query);
    const textsToSearch = texts.length > 0 ? texts : (metadata?.texts || []).map(text => text.id);
    handleSearch(query, textsToSearch, page);
    updateSearchParams(query, textsToSearch, page);
    setIsSearchFormOpen(false);
  }, [handleSearch, metadata]);

  const handlePageChangeWithoutSearch = useCallback((newPage) => {
    handlePageChange(newPage);
    updateSearchParams(searchQuery, selectedTexts, newPage);
  }, [handlePageChange, searchQuery, selectedTexts]);

  const updateSearchParams = useCallback((query, texts, page) => {
    const newSearchParams = new URLSearchParams();
    if (query) newSearchParams.set('query', query);
    if (page !== 1) newSearchParams.set('page', page.toString());
    if (texts.length > 0 && texts.length !== (metadata?.texts || []).length) {
      newSearchParams.set('text_ids', texts.join(','));
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [setSearchParams, metadata]);

  const handleResetSearch = useCallback(() => {
    resetSearch();
    setSearchParams({});
    setIsSearchFormOpen(true);
  }, [resetSearch, setSearchParams]);

  const toggleSearchForm = useCallback(() => {
    setIsSearchFormOpen(prev => !prev);
  }, []);

  return (
    <div className='container'>
      <div className='main'>
        <SearchForm
          onResetSearch={handleResetSearch}
          onSearch={handleSearchSubmit}
          initialQuery={searchParams.get('query') || ''}
          initialTextIds={searchParams.get('text_ids')?.split(',').map(Number) || []}
          isOpen={isSearchFormOpen}
          totalResults={totalResults}
          onToggle={toggleSearchForm}
        />
        {(isSearching || isChangingPage) && <div className='text-content center'><p><LoadingGif /></p></div>}
        {!isSearching && !isChangingPage && hasSearched && (
          <Results
            displayedResults={displayedResults || []}
            query={highlightQuery}
            currentPage={currentPage}
            totalResults={totalResults}  // Pass the actual total results
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChangeWithoutSearch}
          />
        )}
        {displayedResults.length > 0 && (
          <DownloadButton allSearchResults={allSearchResults} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchPage);