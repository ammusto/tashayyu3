import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMetadata, useAuthor, useAuthorTexts } from '../context/metadataContext';
import LoadingGif from '../utils/LoadingGif';

const AuthorPage = () => {
  const { authorId } = useParams();
  const { isLoading, error } = useMetadata();
  const author = useAuthor(authorId);
  const authorTexts = useAuthorTexts(authorId);

  const labelMap = [
    { key: 'author_lat', label: 'Latinized Name' },
    { key: 'label', label: 'Arabic Name' },
    { key: 'date', label: 'Death Year' },
    // Add any other fields you want to display
  ];

  if (isLoading) return <LoadingGif />;
  if (error) return <div className="container"><div className='main'><div className='text-content'>Error: {error}</div></div></div>;
  if (!author) return <div className="container"><div className='main'><div className='text-content'>Author not found. ID: {authorId}</div></div></div>;

  return (
    <div className="container">
      <div className='main'>
        <div className='text-content'>
          <h2>
            <ul>
              <li>{author.author_lat}</li>
              <li>{author.author_ar}</li>
            </ul>
          </h2>
          <table className='individual-meta'>
            <tbody>
              {labelMap.map(({ key, label }) => (
                author[key] !== undefined && (
                  <tr key={key}>
                    <td>{label}</td>
                    <td>{author[key]}</td>
                  </tr>
                )
              ))}
              <tr>
                <td>Texts in Corpus</td>
                <td>
                  <ul>
                    {authorTexts.map(text => (
                      <li key={text.id}>
                        <Link to={`/text/${text.id}`}>{text.title_lat || text.title_ar}</Link>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuthorPage;