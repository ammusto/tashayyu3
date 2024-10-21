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
    { key: 'au_tl', label: 'Latinized Name' },
    { key: 'au_ar', label: 'Arabic Name' },
    { key: 'date', label: 'Death Year' },
    { key: 'bio', label: 'Biography' },
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
              <li>{author.au_tl}</li>
              <li>{author.au_ar}</li>
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
                        <Link to={`/text/${text.id}`}>{text.title_tl || text.title_ar}</Link>
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