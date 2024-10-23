import React, { useCallback, useMemo } from 'react';
import { useSearch } from '../context/SearchContext';

const TextFilterList = () => {
  const {
    filteredTexts,
    selectedTexts,
    setSelectedTexts,
    selectedTextDetails,
    setSelectedTextDetails,
    isMetadataLoading,
  } = useSearch();

  // Sort texts by date
  const sortedTexts = useMemo(() => {
    if (!filteredTexts) return [];
    return [...filteredTexts].sort((a, b) => {
      const dateA = parseInt(a.date) || 0;
      const dateB = parseInt(b.date) || 0;
      return dateA - dateB;
    });
  }, [filteredTexts]);

  const handleTextToggle = useCallback((text) => {
    const isSelected = selectedTexts.includes(text.id);

    if (isSelected) {
      setSelectedTexts(prev => prev.filter(id => id !== text.id));
      setSelectedTextDetails(prev => prev.filter(t => t.id !== text.id));
    } else {
      setSelectedTexts(prev => [...prev, text.id]);
      setSelectedTextDetails(prev => {
        const newDetail = { id: text.id, title: text.title_ar, author: text.author_ar, date: text.date };
        return prev.some(t => t.id === text.id) ? prev : [...prev, newDetail];
      });
    }
  }, [selectedTexts, setSelectedTexts, setSelectedTextDetails]);

  const handleAddAll = useCallback(() => {
    const textsToAdd = sortedTexts.filter(text => !selectedTexts.includes(text.id));
    setSelectedTexts(prev => [...prev, ...textsToAdd.map(t => t.id)]);
    setSelectedTextDetails(prev => {
      const newDetails = textsToAdd.map(t => ({ id: t.id, title: t.title_ar, author: t.author_ar, date: t.date }));
      return [...prev, ...newDetails.filter(newDetail => !prev.some(existingDetail => existingDetail.id === newDetail.id))];
    });
  }, [sortedTexts, selectedTexts, setSelectedTexts, setSelectedTextDetails]);

  const handleRemoveAll = useCallback(() => {
    setSelectedTexts([]);
    setSelectedTextDetails([]);
  }, [setSelectedTexts, setSelectedTextDetails]);

  const memoizedTextList = useMemo(() => {
    return sortedTexts.map(text => (
      <label key={text.id} className="text-item">
        <input
          type="checkbox"
          checked={selectedTexts.includes(text.id)}
          onChange={() => handleTextToggle(text)}
        />
        <span>
          {text.title_ar} - {text.author_ar} ({text.date})
        </span>
      </label>
    ));
  }, [sortedTexts, selectedTexts, handleTextToggle]);

  const isDisabled = isMetadataLoading || sortedTexts.length === 0;
  const noTextsAvailable = !isMetadataLoading && sortedTexts.length === 0;

  return (
    <div className='filter-container'>
      <div className="filter-header">
        <div className="filter-actions">
          <strong>Select Texts </strong>
          (
          <button
            type="button"
            onClick={handleAddAll}
            className="text-button"
            disabled={isDisabled}
          >
            Add All
          </button>
           / 
          <button
            type="button"
            onClick={handleRemoveAll}
            className="text-button"
            disabled={isDisabled || selectedTexts.length === 0}
          >
             Remove All
          </button>
          )
        </div>
      </div>
      <div className="text-filter-list">
        {isMetadataLoading && <div className="no-texts center">Loading texts...</div>}
        {noTextsAvailable && <div className="no-texts center">No texts match the selected filters</div>}
        {!isMetadataLoading && !noTextsAvailable && memoizedTextList}
      </div>
    </div>
  );
};

export default React.memo(TextFilterList);