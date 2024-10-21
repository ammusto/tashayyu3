import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { loadMetadata } from '../utils/metadataLoader';
import { performSearch } from '../services/searchService';
import { parseAdvancedQuery, buildSQLQuery } from '../utils/queryParser';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [metadata, setMetadata] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTexts, setSelectedTexts] = useState([]);
  const [originalQuery, setOriginalQuery] = useState('');
  const [textFilter, setTextFilter] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [dateRange, setDateRange] = useState({ min: 0, max: 2000, current: [0, 2000] });
  const [displayedResults, setDisplayedResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [allSearchResults, setAllSearchResults] = useState([]);
  const [highlightQuery, setHighlightQuery] = useState('');
  const [checkA, setCheckA] = useState(true);
  const [checkB, setCheckB] = useState(true);

  useEffect(() => {
    const initMetadata = async () => {
      try {
        const data = await loadMetadata();
        setMetadata(data);
        setDateRange({
          min: data.dateRange.min,
          max: data.dateRange.max,
          current: [data.dateRange.min, data.dateRange.max]
        });
      } catch (error) {
        console.error('Error initializing metadata:', error);
            }
    };

    initMetadata();
  }, []);

  const memoizedFilteredTexts = useMemo(() => {
    if (!metadata?.texts) return [];

    const genreSet = new Set(selectedGenres);
    const lowerFilter = textFilter.toLowerCase();

    return metadata.texts.filter(text => {
      const textTags = Array.isArray(text.tags) ? text.tags :
        typeof text.tags === 'string' ? text.tags.split(',').map(t => t.trim()) :
          text.tags ? [text.tags] : [];

      if (selectedGenres.length > 0 && !textTags.some(tag => genreSet.has(tag))) return false;

      if (textFilter && !text.title_ar.toLowerCase().includes(lowerFilter) && !text.author_ar.toLowerCase().includes(lowerFilter)) return false;

      const deathYear = parseInt(text.date);
      if (isNaN(deathYear) || deathYear < dateRange[0] || deathYear > dateRange[1]) return false;

      return true;
    });
  }, [metadata, selectedGenres, textFilter, dateRange]);

  const handleProcliticsChange = useCallback((newCheckA, newCheckB) => {
    setCheckA(newCheckA);
    setCheckB(newCheckB);
  }, []);

  const handleSearch = useCallback(async (query, searchTexts, page = 1) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const parsedQuery = parseAdvancedQuery(trimmedQuery);

    setIsSearching(true);
    setOriginalQuery(trimmedQuery);
    setHasSearched(true);
    try {
      let textsToSearch = searchTexts.length > 0 ? searchTexts : memoizedFilteredTexts.map(text => text.id);
      const sqlQuery = buildSQLQuery(parsedQuery, checkA, checkB);

      const results = await performSearch(sqlQuery, textsToSearch);

      setAllSearchResults(results.results);
      setTotalResults(results.totalResults);
      setTotalPages(Math.ceil(results.totalResults / 20));
      setCurrentPage(page);

      const startIndex = (page - 1) * 20;
      setDisplayedResults(results.results.slice(startIndex, startIndex + 20));
    } catch (error) {
      console.error("Error performing search:", error);
      setAllSearchResults([]);
      setDisplayedResults([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setIsSearching(false);
    }
  }, [memoizedFilteredTexts, checkA, checkB]);

  const handlePageChange = useCallback((newPage) => {
    setIsChangingPage(true);
    const startIndex = (newPage - 1) * 20;
    setDisplayedResults(allSearchResults.slice(startIndex, startIndex + 20));
    setCurrentPage(newPage);
    setIsChangingPage(false);
  }, [allSearchResults]);

  const debouncedHandlePageChange = useMemo(
    () => debounce(handlePageChange, 300),
    [handlePageChange]
  );

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedTexts([]);
    setTextFilter('');
    setSelectedGenres([]);
    setDateRange(prevState => ({
      ...prevState,
      current: [prevState.min, prevState.max]
    }));
    setDisplayedResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setTotalPages(1);
    setHasSearched(false);
    setAllSearchResults([]);
    setHighlightQuery('');
  }, []);

  const initializeSearchFromParams = useCallback((searchParams) => {
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page')) || 1;
    const textIds = searchParams.get('text_ids')?.split(',').map(Number) || [];

    if (query) {
      setSearchQuery(query);
      setHighlightQuery(query);
      handleSearch(query, textIds, page);
    }
  }, [handleSearch]);

  const value = {
    metadata,
    searchQuery,
    setSearchQuery,
    selectedTexts,
    setSelectedTexts,
    textFilter,
    setTextFilter,
    selectedGenres,
    setSelectedGenres,
    dateRange,
    setDateRange,
    displayedResults,
    totalResults,
    currentPage,
    totalPages,
    isSearching,
    hasSearched,
    isChangingPage,
    allSearchResults,
    highlightQuery,
    setHighlightQuery,
    checkA,
    checkB,
    handleSearch,
    handlePageChange,
    handleProcliticsChange,
    resetSearch,
    initializeSearchFromParams,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};