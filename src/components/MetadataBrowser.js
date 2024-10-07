import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMetadata } from './context/metadataContext';
import Pagination from './utils/Pagination';
import './Metadata.css';

const MetadataBrowser = () => {
  const { metadata, isLoading } = useMetadata();
  const [texts, setTexts] = useState([]);
  const [sortColumn, setSortColumn] = useState('text_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (metadata && metadata.texts) {
      setTexts(metadata.texts);
    }
  }, [metadata]);

  const filteredTexts = texts.filter(text =>
    searchTerm === '' ||
    Object.entries(text).some(([key, value]) => {
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const trimTableData = (name, num = 0) => {
    if (!name) return 'N/A';
    const parts = name.split('::');
    if (num < parts.length) {
      return parts[num].trim();
    }
    return name;
  };

  const sortedTexts = [...filteredTexts].sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    if (sortColumn === 'death' || sortColumn === 'length') {
      if (valueA === null && valueB === null) return 0;
      if (valueA === null) return sortDirection === 'asc' ? 1 : -1;
      if (valueB === null) return sortDirection === 'asc' ? -1 : 1;
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTexts.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (column) => {
    const newDirection = column === sortColumn && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className='main'>
        <div className='text-content'>Loading metadata...</div>
      </div>
    );
  }

  return (
    <div className='main'>
      <div className='search-form'>
        <input
          type="text"
          placeholder="Filter"
          value={searchTerm}
          onChange={handleSearchChange}
          className='search-form-input'
        />
      </div>

      <div className='meta-show-items'>
        Show
        <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        items per page
      </div>

      <table className='metadata-table'>
        <thead>
          <tr>
            <th onClick={() => handleSort('title_ar')}>Title⇅</th>
            <th onClick={() => handleSort('author_ar')}>Author⇅</th>
            <th onClick={() => handleSort('death')}>Death⇅</th>
            <th onClick={() => handleSort('length')}>Length⇅</th>
            <th onClick={() => handleSort('tags')}>Tags⇅</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((text) => (
            <tr key={text.id}>
              <td>
                <ul>
                  <li><Link to={`/text/${text.id}`}>{trimTableData(text.title_ar, 0) || 'N/A'}</Link></li>
                  <li><Link to={`/text/${text.id}`}>{trimTableData(text.title_lat, 0) || 'N/A'}</Link></li>
                </ul>
              </td>
              <td>
                <ul>
                  <li>
                    <Link 
                      to={`/author/${text.author_id}`} 
                    >
                      {trimTableData(text.author_ar, 0) || 'N/A'}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to={`/author/${text.author_id}`} 
                    >
                      {trimTableData(text.author_lat, 0) || 'N/A'}
                    </Link>
                  </li>
                </ul>
              </td>
              <td>{text.date || 'N/A'}</td>
              <td>{text.length || 'N/A'}</td>
              <td>{trimTableData(text.tags, 0) || 'N/A'}</td>
              <td>
                <a href={text.download} target="_blank" rel="noopener noreferrer">💾</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalItems={sortedTexts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MetadataBrowser;