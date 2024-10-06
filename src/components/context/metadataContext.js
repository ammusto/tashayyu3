import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { loadMetadata } from '../utils/metadataLoader';

const MetadataContext = createContext();

export const useMetadata = () => useContext(MetadataContext);

export const MetadataProvider = ({ children }) => {
  const [rawMetadata, setRawMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await loadMetadata();
        setRawMetadata(data);
        setError(null);
      } catch (error) {
        console.error("Error loading metadata:", error);
        setError("Failed to load metadata. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  const metadata = useMemo(() => {
    if (!rawMetadata) return null;

    const genreSet = new Set();
    const dateRange = { min: Infinity, max: -Infinity };

    rawMetadata.texts.forEach(text => {
      const textTags = Array.isArray(text.tags) ? text.tags :
                       typeof text.tags === 'string' ? text.tags.split(',').map(t => t.trim()) :
                       text.tags ? [text.tags] : [];

      textTags.forEach(tag => genreSet.add(tag));

      const deathYear = parseInt(text.date);
      if (!isNaN(deathYear)) {
        if (deathYear < dateRange.min) dateRange.min = deathYear;
        if (deathYear > dateRange.max) dateRange.max = deathYear;
      }
    });

    return {
      ...rawMetadata,
      genreOptions: Array.from(genreSet),
      dateRange
    };
  }, [rawMetadata]);

  const contextValue = useMemo(() => ({
    metadata,
    isLoading,
    error
  }), [metadata, isLoading, error]);

  return (
    <MetadataContext.Provider value={contextValue}>
      {children}
    </MetadataContext.Provider>
  );
};

// Custom hooks for specific data needs
export const useAuthor = (authorId) => {
  const { metadata } = useMetadata();
  return useMemo(() => {
    if (!metadata || !metadata.authors) return null;
    return metadata.authors.find(author => author.value === parseInt(authorId));
  }, [metadata, authorId]);
};

export const useText = (textId) => {
  const { metadata } = useMetadata();
  return useMemo(() => {
    if (!metadata || !metadata.texts) return null;
    return metadata.texts.find(text => text.id === parseInt(textId));
  }, [metadata, textId]);
};

export const useAuthorTexts = (authorId) => {
  const { metadata } = useMetadata();
  return useMemo(() => {
    if (!metadata || !metadata.texts) return [];
    return metadata.texts.filter(text => text.author_id === parseInt(authorId));
  }, [metadata, authorId]);
};

export const useGenres = () => {
  const { metadata } = useMetadata();
  return metadata ? metadata.genreOptions : [];
};

export const useDateRange = () => {
  const { metadata } = useMetadata();
  return metadata ? metadata.dateRange : null;
};