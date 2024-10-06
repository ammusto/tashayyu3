import React, { useState, useEffect, useRef } from 'react';
import './FilterDropdown.css';

const FilterDropdown = ({ label, options, selectedOptions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const dropdownRef = useRef(null);

  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelectedOptions = Array.isArray(selectedOptions) ? selectedOptions : [];

  useEffect(() => {
    setFilteredOptions(
      safeOptions.filter(option => {
        if (option == null) return false;
        const optionLabel = typeof option === 'object' ? option.label : String(option);
        return optionLabel.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [searchTerm, safeOptions]);

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
    onChange(newSelectedOptions);
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <label>{label}</label>
      <div className="search-input-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={() => setIsOpen(true)}
        />
        {safeSelectedOptions.length > 0 && (
          <span className="selected-count">({safeSelectedOptions.length})</span>
        )}
      </div>
      {isOpen && (
        <div className="dropdown-content">
          {filteredOptions.map((option, index) => {
            if (option == null) return null;
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : String(option);
            return (
              <label key={optionValue || index}>
                <input
                  type="checkbox"
                  checked={safeSelectedOptions.includes(optionValue)}
                  onChange={() => handleToggle(option)}
                />
                {optionLabel}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;