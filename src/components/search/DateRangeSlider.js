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
    (newRange) => {
      debounce((range) => {
        setDateRange(range);
      }, 300)(newRange);
    },
    [setDateRange]
  );

  const handleChange = useCallback((newRange) => {
    setLocalRange(newRange);
    setMinInput(newRange[0]);
    setMaxInput(newRange[1]);
    debouncedSetDateRange(newRange);
  }, [debouncedSetDateRange]);

  const handleInputChange = useCallback((e) => {
    const { value, name } = e.target;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      if (name === "minInput") {
        setMinInput(parsedValue);
      } else {
        setMaxInput(parsedValue);
      }
    }
  }, []);

  const handleBlur = useCallback(() => {
    let newMin = parseFloat(minInput);
    let newMax = parseFloat(maxInput);

    if (isNaN(newMin) || newMin < sliderProps.min) {
      newMin = sliderProps.min;
    }
    if (isNaN(newMax) || newMax > sliderProps.max) {
      newMax = sliderProps.max;
    }

    if (newMax < newMin) {
      newMax = newMin + 50;
    }

    const newRange = [newMin, newMax];
    setLocalRange(newRange);
    debouncedSetDateRange(newRange);
  }, [minInput, maxInput, debouncedSetDateRange, sliderProps.min, sliderProps.max]);

  return (
    <div className="date-slider-container">
      <div>
        <strong>Filter by Death Date</strong>
      </div>
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="thumb"
        trackClassName="track"
        value={localRange}
        onChange={handleChange}
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
          onBlur={handleBlur}
          className="input-left"
        />
        <input
          type="number"
          name="maxInput"
          value={maxInput}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="input-right"
        />
      </div>
    </div>
  );
};

export default React.memo(DateRangeSlider);