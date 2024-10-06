import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactSlider from 'react-slider';
import { useSearch } from '../context/SearchContext';
import debounce from 'lodash/debounce';
import './DateRangeSlider.css';

const DateRangeSlider = () => {
  const { dateRange, setDateRange, metadata } = useSearch();
  const [localRange, setLocalRange] = useState(dateRange);
  const [minInput, setMinInput] = useState(dateRange[0]);
  const [maxInput, setMaxInput] = useState(dateRange[1]);

  const sliderProps = useMemo(() => ({
    min: metadata?.dateRange?.min || 0,
    max: metadata?.dateRange?.max || 2000,
  }), [metadata]);

  useEffect(() => {
    if (metadata?.dateRange) {
      const newRange = [metadata.dateRange.min, metadata.dateRange.max];
      setLocalRange(newRange);
      setMinInput(newRange[0]);
      setMaxInput(newRange[1]);
      setDateRange(newRange);
    }
  }, [metadata, setDateRange]);

  const debouncedSetDateRange = useCallback(
    debounce((newRange) => {
      setDateRange(newRange); // Trigger filtering
    }, 300),
    [setDateRange]
  );

  const handleChange = useCallback((newRange) => {
    setLocalRange(newRange);
    setMinInput(newRange[0]); // Update min input based on slider
    setMaxInput(newRange[1]); // Update max input based on slider

    // Trigger filtering immediately when slider changes
    debouncedSetDateRange(newRange);
  }, [debouncedSetDateRange]);

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      if (name === "minInput") {
        setMinInput(parsedValue);
      } else {
        setMaxInput(parsedValue);
      }
    }
  };

  const handleBlur = useCallback(() => {
    let newMin = parseFloat(minInput);
    let newMax = parseFloat(maxInput);

    // Validate the min and max dates
    if (isNaN(newMin) || newMin < sliderProps.min) {
      newMin = sliderProps.min; // Reset to min range if invalid
    }
    if (isNaN(newMax) || newMax > sliderProps.max) {
      newMax = sliderProps.max; // Reset to max range if invalid
    }

    // Ensure max is not less than min
    if (newMax < newMin) {
      newMax = newMin + 50; // Set max to min + 1 if invalid
    }

    const newRange = [newMin, newMax];
    setLocalRange(newRange); // Update local range
    debouncedSetDateRange(newRange); // Apply filtering on blur
  }, [minInput, maxInput, debouncedSetDateRange, sliderProps]);

  return (
    <div className="date-slider-container">
      <div>
        <span>Filter by Death Date</span>
      </div>
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="thumb"
        trackClassName="track"
        value={localRange}
        onChange={handleChange} // Update and filter on slider change
        pearling
        minDistance={10}
        {...sliderProps}
      />
      <div className="input-container">
        <input
          type="number"
          name="minInput"
          value={minInput}
          onChange={handleInputChange}
          onBlur={handleBlur} // Trigger filtering on blur
          className="input-left"
        />
        <input
          type="number"
          name="maxInput"
          value={maxInput}
          onChange={handleInputChange}
          onBlur={handleBlur} // Trigger filtering on blur
          className="input-right"
        />
      </div>

    </div>
  );
};

export default React.memo(DateRangeSlider);
