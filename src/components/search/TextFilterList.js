import React, { useCallback, useMemo } from 'react';
import { useSearch } from '../context/SearchContext';

const TextFilterList = () => {
  const {
    filteredTexts,
    selectedTexts,
    setSelectedTexts,
    setSelectedTextDetails,
    isMetadataLoading,
    metadata,
    selectedGenres,
    textFilter,
    dateRange
  } = useSearch();

  const handleTextToggle = useCallback((text) => {
    setSelectedTexts(prev => {
      if (prev.includes(text.id)) {
        setSelectedTextDetails(current => current.filter(t => t.id !== text.id));
        return prev.filter(id => id !== text.id);
      } else {
        const newDetail = { id: text.id, title: text.title_ar, author: text.author_ar, date: text.date };
        setSelectedTextDetails(current => {
          if (!current.some(t => t.id === text.id)) {
            return [...current, newDetail];
          }
          return current;
        });
        return [...prev, text.id];
      }
    });
  }, [setSelectedTexts, setSelectedTextDetails]);

  const handleAddAll = useCallback(() => {
    const textsToAdd = filteredTexts.filter(text => !selectedTexts.includes(text.id));
    setSelectedTexts(prev => [...prev, ...textsToAdd.map(t => t.id)]);
    setSelectedTextDetails(prev => [
      ...prev,
      ...textsToAdd.map(t => ({ id: t.id, title: t.title_ar, author: t.author_ar, date: t.date }))
    ]);
  }, [filteredTexts, selectedTexts, setSelectedTexts, setSelectedTextDetails]);

  const handleRemoveAll = useCallback(() => {
    setSelectedTexts([]);
    setSelectedTextDetails([]);
  }, [setSelectedTexts, setSelectedTextDetails]);

  const memoizedTextList = useMemo(() => {
    return filteredTexts.map(text => (
      <label key={text.id}>
        <input
          type="checkbox"
          checked={selectedTexts.includes(text.id)}
          onChange={() => handleTextToggle(text)}
        />
        {text.title_ar} - {text.author_ar} ({text.date})
      </label>
    ));
  }, [filteredTexts, selectedTexts, handleTextToggle]);

  const isDisabled = isMetadataLoading || !metadata?.texts?.length;

  return (
    <div className='filter-container flex'>
      Select Texts
      <div className="text-filter-list">
        {isMetadataLoading ? (
          <div className="no-texts center">Loading texts...</div>
        ) : !metadata?.texts?.length ? (
          <div className="no-texts center">No texts available</div>
        ) : memoizedTextList.length > 0 ? (
          memoizedTextList
        ) : (
          <div className="no-texts center">No texts match the selected filters</div>
        )}
      </div>
      <div className="text-filter-actions">
        <button
          type="button"
          onClick={handleAddAll}
          className="add-all-btn"
          disabled={isDisabled || memoizedTextList.length === 0}
        >
          Add All
        </button>
        <button
          type="button"
          onClick={handleRemoveAll}
          className="remove-all-btn"
          disabled={isDisabled || selectedTexts.length === 0}
        >
          Remove All
        </button>
      </div>
    </div>
  );
};

export default React.memo(TextFilterList);