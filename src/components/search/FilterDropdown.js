import React, { useState, useEffect, useRef, useMemo } from 'react';
import './FilterDropdown.css';

const FilterDropdown = ({ label, options, selectedOptions, onSelectionChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelectedOptions = Array.isArray(selectedOptions) ? selectedOptions : [];

  const sortedOptions = useMemo(() => {
    return [...safeOptions].sort((a, b) => {
      const labelA = typeof a === 'object' ? a.label : String(a);
      const labelB = typeof b === 'object' ? b.label : String(b);
      return labelA.localeCompare(labelB);
    });
  }, [safeOptions]);

  const filteredOptions = useMemo(() => {
    return sortedOptions.filter(option => {
      if (option == null) return false;
      const optionLabel = typeof option === 'object' ? option.label : String(option);
      return optionLabel.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [sortedOptions, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = (option) => {
    if (option == null) return;
    const optionValue = typeof option === 'object' ? option.value : option;
    const newSelectedOptions = safeSelectedOptions.includes(optionValue)
      ? safeSelectedOptions.filter(item => item !== optionValue)
      : [...safeSelectedOptions, optionValue];
    onSelectionChange(newSelectedOptions);
    setSearchTerm('');  // Clear the search term after selection
  };

  const handleUnselectAll = (event) => {
    event.stopPropagation();  // Prevent event from bubbling up
    event.preventDefault();   // Prevent default button behavior
    onReset();
    setSearchTerm('');
  };

  const getSelectedLabels = () => {
    return safeSelectedOptions.map(value =>
      safeOptions.find(option =>
        (typeof option === 'object' ? option.value : option) === value
      )
    ).filter(Boolean).map(option =>
      typeof option === 'object' ? option.label : String(option)
    );
  };

  const selectedLabels = getSelectedLabels();
  const displayText = selectedLabels.length > 0
    ? `${selectedLabels.join(', ')} (${selectedLabels.length})`
    : '';

  return (
    <div className="filter-dropdown" ref={dropdownRef} id="filter-dropdown">
      <label id="filter-dropdown-label">{label}</label>
      <div className="search-input-container">
        <input
          id="filter-dropdown-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={() => setIsOpen(true)}
          placeholder={displayText || ""}
          aria-labelledby="filter-dropdown-label"
        />
      </div>
      {isOpen && (
        <div className="dropdown-content" id="filter-dropdown-content">
          <button id="unselect-all-button"  className='text-button' onClick={handleUnselectAll}>
            Unselect All
          </button>
          {filteredOptions.map((option, index) => {
            if (option == null) return null;
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : String(option);
            const optionId = `option-${optionValue || index}`;
            return (
              <div key={optionId} className="option-container">

                <label htmlFor={optionId}>                <input
                  id={optionId}
                  type="checkbox"
                  checked={safeSelectedOptions.includes(optionValue)}
                  onChange={() => handleToggle(option)}
                />{optionLabel}</label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;