import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/About';
import MetadataBrowser from './components/MetadataBrowser';
import TextPage from './components/pages/TextPage';
import AuthorPage from './components/pages/AuthorPage';
import SearchPage from './components/pages/SearchPage';
import Reader from './components/pages/Reader';
import { MetadataProvider } from './components/context/metadataContext';
import { SearchProvider } from './components/context/SearchContext';

function App() {
  return (
    <MetadataProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/metadata" element={<MetadataBrowser />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/text/:textId" element={<TextPage />} />
            <Route path="/author/:authorId" element={<AuthorPage />} />
            <Route path="/search" element={
              <SearchProvider>
                <SearchPage />
              </SearchProvider>
            } />
            <Route path="/reader/:textId/:vol/:pageNum?" element={<Reader />} />
          </Routes>
        </Layout>
      </Router>
    </MetadataProvider>
  );
}

export default App;