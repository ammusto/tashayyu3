import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useMetadata } from './metadataContext';
import { performSearch } from '../services/searchService';
import { parseAdvancedQuery, buildSQLQuery } from '../utils/queryParser';
import debounce from 'lodash/debounce';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [checkA, setCheckA] = useState(true);
  const [checkB, setCheckB] = useState(true);
  const { metadata, isLoading: isMetadataLoading } = useMetadata();
  const [searchQuery, setSearchQuery] = useState('');
  const [originalQuery, setOriginalQuery] = useState('');
  const [selectedTexts, setSelectedTexts] = useState([]);
  const [selectedTextDetails, setSelectedTextDetails] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [textFilter, setTextFilter] = useState('');
  const [allSearchResults, setAllSearchResults] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState(() => metadata?.dateRange || [0, 0]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [highlightQuery, setHighlightQuery] = useState('');

  useEffect(() => {
    if (metadata?.dateRange) {
      setDateRange([metadata.dateRange.min, metadata.dateRange.max]);
    }
  }, [metadata]);

  const clearSelectedTexts = useCallback(() => {
    setSelectedTexts([]);
    setSelectedTextDetails([]);
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
    setSelectedTextDetails([]);
    setSelectedGenres([]);
    setTextFilter('');
    setDateRange([metadata?.dateRange?.min || 0, metadata?.dateRange?.max || 0]);
    setAllSearchResults([]);
    setDisplayedResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setHasSearched(false);
    setHighlightQuery('');
  }, [metadata]);

  const initializeSearchFromParams = useCallback((searchParams) => {
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const textIds = searchParams.get('text_ids')?.split(',').map(Number) || [];

    if (query || textIds.length > 0) {
      const textsToSearch = textIds.length > 0 ? textIds : (metadata?.texts || []).map(text => text.id);
      setHighlightQuery(query);
      handleSearch(query, textsToSearch, page);
    }
  }, [metadata, handleSearch]);

  const value = useMemo(() => ({
    filteredTexts: memoizedFilteredTexts,
    searchQuery,
    setSearchQuery,
    originalQuery,
    selectedTexts,
    setSelectedTexts,
    selectedTextDetails,
    setSelectedTextDetails,
    selectedGenres,
    setSelectedGenres,
    textFilter,
    setTextFilter,
    allSearchResults,
    displayedResults,
    isSearching,
    currentPage,
    setCurrentPage,
    dateRange,
    setDateRange,
    totalResults,
    totalPages,
    hasSearched,
    handleSearch,
    handlePageChange: debouncedHandlePageChange,
    resetSearch,
    clearSelectedTexts,
    metadata,
    isMetadataLoading,
    isChangingPage,
    handleProcliticsChange,
    checkA,
    checkB,
    highlightQuery,
    setHighlightQuery,
    initializeSearchFromParams
  }), [
    memoizedFilteredTexts, searchQuery, originalQuery, selectedTexts, selectedTextDetails,
    selectedGenres, textFilter, allSearchResults, displayedResults, isSearching, currentPage,
    dateRange, totalResults, totalPages, hasSearched, handleSearch,
    debouncedHandlePageChange, resetSearch, clearSelectedTexts, metadata, isMetadataLoading, 
    isChangingPage, handleProcliticsChange, checkA, checkB, highlightQuery, initializeSearchFromParams
  ]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};