import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactSlider from 'react-slider';
import { useSearch } from '../context/SearchContext';
import debounce from 'lodash/debounce';
import './DateRangeSlider.css';

const DateRangeSlider = () => {
  const { dateRange, setDateRange, metadata } = useSearch();
  const [localRange, setLocalRange] = useState([0, 2000]); // Default range
  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');

  const sliderProps = useMemo(() => ({
    min: metadata?.dateRange?.min ?? 0,
    max: metadata?.dateRange?.max ?? 2000,
  }), [metadata]);

  useEffect(() => {
    if (metadata?.dateRange) {
      const newRange = [
        metadata.dateRange.min ?? 0,
        metadata.dateRange.max ?? 2000
      ];
      setLocalRange(newRange);
      setMinInput(newRange[0].toString());
      setMaxInput(newRange[1].toString());
      setDateRange(newRange);
    }
  }, [metadata, setDateRange]);

  const debouncedSetDateRange = useCallback(
    debounce((range) => {
      setDateRange(range);
    }, 300),
    [setDateRange]
  );

  const handleChange = useCallback((newRange) => {
    setLocalRange(newRange);
    setMinInput(newRange[0].toString());
    setMaxInput(newRange[1].toString());
    debouncedSetDateRange(newRange);
  }, [debouncedSetDateRange]);

  const handleInputChange = useCallback((e) => {
    const { value, name } = e.target;
    if (name === "minInput") {
      setMinInput(value);
    } else {
      setMaxInput(value);
    }
  }, []);

  const handleBlur = useCallback(() => {
    let newMin = parseInt(minInput, 10);
    let newMax = parseInt(maxInput, 10);

    newMin = isNaN(newMin) ? sliderProps.min : Math.max(newMin, sliderProps.min);
    newMax = isNaN(newMax) ? sliderProps.max : Math.min(newMax, sliderProps.max);

    if (newMax < newMin) {
      newMax = newMin;
    }

    const newRange = [newMin, newMax];
    setLocalRange(newRange);
    setMinInput(newMin.toString());
    setMaxInput(newMax.toString());
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
        min={sliderProps.min}
        max={sliderProps.max}
        pearling
        minDistance={10}
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