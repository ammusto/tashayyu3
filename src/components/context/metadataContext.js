import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadMetadata } from '../utils/metadataLoader';

const MetadataContext = createContext();

const CACHE_KEY = 'nusus_metadata_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 10000

export const MetadataProvider = ({ children }) => {
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Check localStorage for cached metadata
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setMetadata(data);
            setIsLoading(false);
            return;
          }
        }

        // If no valid cache, fetch new data
        const data = await loadMetadata();
        setMetadata(data);
        
        // Cache the new data
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (err) {
        console.error("Error fetching metadata:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const value = {
    metadata,
    isLoading,
    error,
  };

  return <MetadataContext.Provider value={value}>{children}</MetadataContext.Provider>;
};

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (context === undefined) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
};

export const useText = (textId) => {
  const { metadata } = useMetadata();
  return metadata ? metadata.texts.find(text => text.id === textId) : null;
};

export const useAuthor = (authorId) => {
  const { metadata } = useMetadata();
  return metadata ? metadata.authors.find(author => author.author_id === authorId) : null;
};

export const useAuthorTexts = (authorId) => {
  const { metadata } = useMetadata();
  return metadata ? metadata.texts.filter(text => text.author_id === authorId) : [];
};