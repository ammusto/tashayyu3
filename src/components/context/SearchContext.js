import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { loadMetadata } from '../utils/metadataLoader';
import { performSearch } from '../services/searchService';
import { buildOpenSearchQuery } from '../utils/queryParser';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [metadata, setMetadata] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTexts, setSelectedTexts] = useState([]);
  const [selectedTextDetails, setSelectedTextDetails] = useState([]);
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

  const filteredTexts = useMemo(() => {
    if (!metadata?.texts) return [];
  
    const genreSet = new Set(selectedGenres);
    const lowerFilter = textFilter.toLowerCase();
    const [minDate, maxDate] = dateRange.current || [dateRange.min, dateRange.max];
  
    return metadata.texts.filter(text => {
      const textTags = Array.isArray(text.tags) ? text.tags :
        typeof text.tags === 'string' ? text.tags.split(',').map(t => t.trim()) :
          text.tags ? [text.tags] : [];
  
      if (selectedGenres.length > 0 && !textTags.some(tag => genreSet.has(tag))) return false;
      if (textFilter && !text.title_ar.toLowerCase().includes(lowerFilter) && 
          !text.author_ar.toLowerCase().includes(lowerFilter)) return false;
      const deathYear = parseInt(text.date);
      if (isNaN(deathYear) || deathYear < minDate || deathYear > maxDate) return false;
  
      return true;
    });
  }, [metadata, selectedGenres, textFilter, dateRange]);

  const handleSearch = useCallback(async (searchConfig, searchTexts, page = 1, pageSize = 20) => {
    if (!searchConfig) return;
  
    setIsSearching(true);
    setHasSearched(true);
  
    try {
      const textsToSearch = searchTexts.length > 0 ? searchTexts : filteredTexts.map(text => text.id);
      
      const query = buildOpenSearchQuery({
        ...searchConfig,
        selectedTexts: textsToSearch
      }, page, pageSize);
  
      const results = await performSearch(query);
  
      setDisplayedResults(results.results);
      setTotalResults(results.totalResults);
      setTotalPages(Math.ceil(results.totalResults / pageSize));
      setCurrentPage(page);
      setAllSearchResults(results.results);
      setSearchQuery(searchConfig.searchFields[0]?.term || '');
  
    } catch (error) {
      console.error("Error performing search:", error);
      setDisplayedResults([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setIsSearching(false);
    }
  }, [filteredTexts]);

  const handlePageChange = useCallback(async (newPage, pageSize = 20) => {
    setIsChangingPage(true);
    try {
      const query = buildOpenSearchQuery({
        searchType: 'simple',
        searchFields: [{ term: searchQuery }],
        selectedTexts
      }, newPage, pageSize);

      const results = await performSearch(query);
      setDisplayedResults(results.results);
      setCurrentPage(newPage);
    } catch (error) {
      console.error("Error changing page:", error);
    } finally {
      setIsChangingPage(false);
    }
  }, [searchQuery, selectedTexts]);

  const debouncedHandlePageChange = useMemo(
    () => debounce(handlePageChange, 300),
    [handlePageChange]
  );

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedTexts([]);
    setSelectedTextDetails([]);
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
      const searchConfig = {
        searchType: 'simple',
        searchFields: [{
          term: query,
          searchIn: 'tok',
          definite: false,
          proclitic: false
        }]
      };
      handleSearch(searchConfig, textIds, page);
    }
  }, [handleSearch]);

  const value = {
    metadata,
    searchQuery,
    setSearchQuery,
    selectedTexts,
    setSelectedTexts,
    selectedTextDetails,
    setSelectedTextDetails,
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
    filteredTexts,
    handleSearch,
    handlePageChange,
    debouncedHandlePageChange,
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