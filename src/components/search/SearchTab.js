import React, { useState, useCallback } from 'react';
import SimpleSearch from './SimpleSearch';
import AdvancedSearch from './AdvancedSearch';
import ProximitySearch from './ProximitySearch';
import { useSearch } from '../context/SearchContext';

const SearchTab = ({ onSearch }) => {
  const [searchType, setSearchType] = useState('simple');
  const { selectedTexts } = useSearch();

  const [simpleField, setSimpleField] = useState({
    term: '',
    searchIn: 'tok',
    definite: false,
    proclitic: false
  });

  const [andFields, setAndFields] = useState([{
    term: '',
    searchIn: 'tok',
    definite: false,
    proclitic: false,
    tabType: 'AND'
  }]);

  const [orFields, setOrFields] = useState([{
    term: '',
    searchIn: 'tok',
    definite: false,
    proclitic: false,
    tabType: 'OR'
  }]);

  const [proximityData, setProximityData] = useState({
    firstTerm: {
      term: '',
      searchIn: 'tok',
      definite: false,
      proclitic: false
    },
    secondTerm: {
      term: '',
      searchIn: 'tok',
      definite: false,
      proclitic: false
    },
    slop: 5
  });

  const handleSimpleFieldChange = (index, name, value) => {
    setSimpleField(prev => ({ ...prev, [name]: value }));
  };

  const handleAdvancedFieldChange = useCallback((index, name, value, type) => {
    if (type === 'AND') {
      setAndFields(prev => {
        const newFields = [...prev];
        newFields[index] = { ...newFields[index], [name]: value, tabType: 'AND' };
        return newFields;
      });
    } else {
      setOrFields(prev => {
        const newFields = [...prev];
        newFields[index] = { ...newFields[index], [name]: value, tabType: 'OR' };
        return newFields;
      });
    }
  }, []);

  const handleProximityFieldChange = useCallback((index, name, value, isFirst) => {
    setProximityData(prev => ({
      ...prev,
      [isFirst ? 'firstTerm' : 'secondTerm']: {
        ...prev[isFirst ? 'firstTerm' : 'secondTerm'],
        [name]: value
      }
    }));
  }, []);

  const handleSlopChange = useCallback((value) => {
    setProximityData(prev => ({ ...prev, slop: parseInt(value, 10) }));
  }, []);

  const handleSearch = useCallback(() => {
    const searchConfig = {
      searchType,
      selectedTexts,
      searchFields: []
    };

    switch (searchType) {
      case 'simple':
        searchConfig.searchFields = [simpleField];
        break;
      case 'advanced':
        searchConfig.searchFields = [...andFields, ...orFields];
        break;
      case 'proximity':
        searchConfig.searchFields = proximityData;
        break;
      default:
        break;
    }

    onSearch(searchConfig, selectedTexts);
  }, [searchType, simpleField, andFields, orFields, proximityData, selectedTexts, onSearch]);

  return (
    <div className="search-tab-container">
      <div className="search-tabs">
        <button
          className={`search-tab ${searchType === 'simple' ? 'active' : ''}`}
          onClick={() => setSearchType('simple')}
        >
          Simple Search
        </button>
        <button
          className={`search-tab ${searchType === 'advanced' ? 'active' : ''}`}
          onClick={() => setSearchType('advanced')}
        >
          Advanced Search
        </button>
        <button
          className={`search-tab ${searchType === 'proximity' ? 'active' : ''}`}
          onClick={() => setSearchType('proximity')}
        >
          Proximity Search
        </button>
      </div>

      <div className="search-content">
        {searchType === 'simple' && (
          <SimpleSearch
            searchField={simpleField}
            handleFieldChange={handleSimpleFieldChange}
          />
        )}
        {searchType === 'advanced' && (
          <AdvancedSearch
            andFields={andFields}
            orFields={orFields}
            handleFieldChange={handleAdvancedFieldChange}
            setAndFields={setAndFields}
            setOrFields={setOrFields}
          />
        )}
        {searchType === 'proximity' && (
          <ProximitySearch
            proximityData={proximityData}
            handleFieldChange={handleProximityFieldChange}
            handleSlopChange={handleSlopChange}
          />
        )}
      </div>

      <div className='flex search-button-container'>
        <button
          type="submit"
          className='search-button'
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default React.memo(SearchTab);