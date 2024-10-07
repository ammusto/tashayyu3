import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import './Alert.css';

const CustomAlert = ({ message }) => (
    <div className="custom-alert fade-out">
        <AlertCircle className="alert-icon" />
        <span className="alert-message">{message}</span>
    </div>
);

const SearchInput = ({ value, onChange, placeholder, onProcliticsChange }) => {
    const [localValue, setLocalValue] = useState(value);
    const [error, setError] = useState('');
    const [checkA, setCheckA] = useState(true);
    const [checkB, setCheckB] = useState(true);
    const timeoutRef = useRef(null);

    const showError = (message) => {
        setError(message);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setError(''), 5000);
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        const arabicAndAllowedCharsRegex = /^[\u0600-\u06FF\s؟|+*]*$/;
      
        if (!arabicAndAllowedCharsRegex.test(newValue)) {
          showError('Only Arabic characters, ؟, |, +, and * are allowed');
          return;
        }
      
        const words = newValue.split(/\s+/);
        const invalidWildcard = words.some(word => {
          const asteriskCount = (word.match(/\*/g) || []).length;
          const questionMarkCount = (word.match(/؟/g) || []).length;
          
          if (asteriskCount > 1 || questionMarkCount > 1) {
            return true;
          }
          
          if (asteriskCount === 1 || questionMarkCount === 1) {
            return word.startsWith('*') || word.startsWith('؟');
          }
          
          return false;
        });
      
        if (invalidWildcard) {
          showError('Wildcards (* or ؟) are only allowed at the end of a word');
          return;
        }
      
        setLocalValue(newValue);
        onChange(newValue);
      };

    const handleCheckChange = (check) => {
        if (check === 'A') {
            setCheckA(!checkA);
        } else {
            setCheckB(!checkB);
        }
    };

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        onProcliticsChange(checkA, checkB);
    }, [checkA, checkB, onProcliticsChange]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <>
            <div className="checkbox-container">
                <label>
                    <input
                        type="checkbox"
                        checked={checkA}
                        onChange={() => handleCheckChange('A')}
                    />
                    Definite
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={checkB}
                        onChange={() => handleCheckChange('B')}
                    />
                    Proclitics
                </label>
            </div>
            <div className="search-input-container">
                <input
                    className="search-form-input"
                    type="text"
                    value={localValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                />

                {error && <CustomAlert message={error} />}
            </div>
        </>
    );
};

export default SearchInput;