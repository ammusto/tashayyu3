import React, { useState } from 'react';
import SearchInputSelect from './SearchInputSelect';

const AdvancedSearch = ({ andFields, orFields, handleFieldChange, setAndFields, setOrFields }) => {
  const [activeTab, setActiveTab] = useState('AND');

  const addField = (type) => {
    const newField = {
      term: '',
      searchIn: 'tok',
      definite: false,
      proclitic: false,
      tabType: type
    };
    
    if (type === 'AND' && andFields.length < 5) {
      setAndFields([...andFields, newField]);
    } else if (type === 'OR' && orFields.length < 5) {
      setOrFields([...orFields, newField]);
    }
  };

  const removeField = (type, index) => {
    if (type === 'AND') {
      setAndFields(andFields.filter((_, i) => i !== index));
    } else {
      setOrFields(orFields.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="advanced-search-container">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'AND' ? 'active' : ''}`}
          onClick={() => setActiveTab('AND')}
        >
          AND
        </button>
        <button
          className={`tab ${activeTab === 'OR' ? 'active' : ''}`}
          onClick={() => setActiveTab('OR')}
        >
          OR
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'AND' && (
          <div className="and-fields">
            {andFields.map((field, index) => (
              <div key={index} className="search-field-container">
                <SearchInputSelect
                  index={index}
                  searchField={field}
                  handleFieldChange={(index, name, value) => handleFieldChange(index, name, value, 'AND')}
                  searchType="advanced"
                />
                {andFields.length > 1 && (
                  <button
                    className="remove-field"
                    onClick={() => removeField('AND', index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {andFields.length < 5 && (
              <button
                className="add-field"
                onClick={() => addField('AND')}
              >
                Add AND Condition
              </button>
            )}
          </div>
        )}

        {activeTab === 'OR' && (
          <div className="or-fields">
            {orFields.map((field, index) => (
              <div key={index} className="search-field-container">
                <SearchInputSelect
                  index={index}
                  searchField={field}
                  handleFieldChange={(index, name, value) => handleFieldChange(index, name, value, 'OR')}
                  searchType="advanced"
                />
                {orFields.length > 1 && (
                  <button
                    className="remove-field"
                    onClick={() => removeField('OR', index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {orFields.length < 5 && (
              <button
                className="add-field"
                onClick={() => addField('OR')}
              >
                Add OR Condition
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AdvancedSearch);